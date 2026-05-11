"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
} from "reactflow";
import "reactflow/dist/style.css";

import Sidebar from "@/components/Sidebar";
import CustomNode from "@/components/CustomNode";
import CustomEdge from "@/components/CustomEdge";
import NodeConfigPanel from "@/components/NodeConfigPanel";
import { useWorkflowStore } from "@/lib/store";
import { nodeDefinitions } from "@/lib/node-definitions";
import { WorkflowNode, NodeData } from "@/lib/types";
import { WorkflowExecutor } from "@/lib/executor";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
  smoothstep: CustomEdge,
};



export default function Home() {
  const { nodes, edges, addNode, addEdge, updateNode, setNodes, setEdges, selectedNodeId, setSelectedNodeId } =
    useWorkflowStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        id: `e${connection.source}-${connection.target}`,
        type: "custom",
        animated: true,
      };
      addEdge(edge as any);
    },
    [addEdge]
  );

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      setNodes(applyNodeChanges(changes, useWorkflowStore.getState().nodes));
    },
    [setNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      setEdges(applyEdgeChanges(changes, useWorkflowStore.getState().edges));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance) return;

      const definition = nodeDefinitions[type];
      if (!definition) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `node-${crypto.randomUUID()}`,
        type: "custom",
        position,
        data: {
          label: definition.label,
          type: definition.type,
          config: { ...definition.defaultConfig, type: definition.type },
        } as NodeData,
      };

      addNode(newNode);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setSelectedNodeId(node.id);
    },
    []
  );

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      alert("Add some nodes to the canvas first!");
      return;
    }

    setIsExecuting(true);
    const executor = new WorkflowExecutor();

    // Find trigger nodes (nodes with no incoming edges)
    const triggerNodes = nodes.filter(
      (node) => !edges.some((edge) => edge.target === node.id)
    );

    if (triggerNodes.length === 0) {
      alert("Add a trigger node to start the workflow!");
      setIsExecuting(false);
      return;
    }

    // Reset all nodes
    nodes.forEach((node) => {
      updateNode(node.id, {
        output: undefined,
        error: undefined,
        isExecuting: false,
      });
    });

    // Execute nodes in order
    const executedNodes = new Set<string>();
    const nodeOutputs: Record<string, any> = {};

    const executeNodeChain = async (nodeId: string, input: any = null) => {
      if (executedNodes.has(nodeId)) return;

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      executedNodes.add(nodeId);
      updateNode(nodeId, { isExecuting: true, error: undefined });

      try {
        const result = await executor.executeNode({
          nodeId: node.id,
          input,
          config: node.data.config || {},
          previousNodes: nodeOutputs,
        });

        if (result.success) {
          updateNode(nodeId, {
            output: result.output,
            isExecuting: false,
          });
          nodeOutputs[nodeId] = result.output;

          // Find and execute connected nodes
          const connectedEdges = edges.filter((edge) => edge.source === nodeId);
          
          if (node.data.type === "loop" && result.output.items && Array.isArray(result.output.items)) {
            // Loop node execution: Iterate and execute branch for each item
            const items = result.output.items;
            for (let i = 0; i < items.length; i++) {
              for (const edge of connectedEdges) {
                // To allow downstream nodes to re-execute safely, we could clone the executedNodes set.
                // However, since executeNodeChain is recursive and stateful, doing it in order is safe if there are no cycles.
                // We'll clear the executed nodes from this point forward for the loop iteration.
                // A robust implementation would pass a context down, but here we just reset the Set
                // to allow the branch to execute again.
                // Actually, just removing the downstream targets from the set works.
                executedNodes.delete(edge.target);
                await executeNodeChain(edge.target, { ...result.output, item: items[i], loopIndex: i });
              }
            }
          } else {
            // Standard execution
            for (const edge of connectedEdges) {
              await executeNodeChain(edge.target, result.output);
            }
          }
        } else {
          updateNode(nodeId, {
            error: result.error,
            isExecuting: false,
          });
        }
      } catch (error: any) {
        updateNode(nodeId, {
          error: error.message || "Execution failed",
          isExecuting: false,
        });
      }
    };

    // Execute from each trigger
    for (const triggerNode of triggerNodes) {
      await executeNodeChain(triggerNode.id);
    }

    setIsExecuting(false);
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-950 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-950">
      <Sidebar onExecute={executeWorkflow} isExecuting={isExecuting} />

      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange as OnNodesChange}
          onEdgesChange={handleEdgesChange as OnEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const definition = nodeDefinitions[node.data.type];
              return definition?.color.includes("gradient")
                ? "#8b5cf6"
                : definition?.color.replace("bg-", "") || "#6366f1";
            }}
            className="bg-white dark:bg-gray-800"
          />

          <Panel
            position="top-center"
            className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">
                {nodes.length}
              </span>{" "}
              nodes •{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {edges.length}
              </span>{" "}
              connections
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {selectedNodeId && (
        <NodeConfigPanel
          nodeId={selectedNodeId}
          onClose={() => setSelectedNodeId(null)}
        />
      )}
    </div>
  );
}
