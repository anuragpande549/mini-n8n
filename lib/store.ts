import { create } from "zustand";
import { persist } from "zustand/middleware";
import { WorkflowState, WorkflowNode, WorkflowEdge } from "./types";
import { addEdge as addReactFlowEdge, Connection } from "reactflow";

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodeId: null,

      setSelectedNodeId: (id: string | null) => {
        set({ selectedNodeId: id });
      },

      addNode: (node: WorkflowNode) => {
        set((state) => ({
          nodes: [...state.nodes, node],
        }));
      },

      updateNode: (id: string, data: Partial<WorkflowNode["data"]>) => {
        set((state) => ({
          nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
          ),
        }));
      },

      deleteNode: (id: string) => {
        set((state) => ({
          nodes: state.nodes.filter((node) => node.id !== id),
          edges: state.edges.filter(
            (edge) => edge.source !== id && edge.target !== id
          ),
        }));
      },

      addEdge: (edge: WorkflowEdge) => {
        set((state) => ({
          edges: addReactFlowEdge(edge as any, state.edges) as WorkflowEdge[],
        }));
      },

      deleteEdge: (id: string) => {
        set((state) => ({
          edges: state.edges.filter((edge) => edge.id !== id),
        }));
      },

      setNodes: (nodes: WorkflowNode[]) => {
        set({ nodes });
      },

      setEdges: (edges: WorkflowEdge[]) => {
        set({ edges });
      },

      clearWorkflow: () => {
        set({ nodes: [], edges: [] });
      },
    }),
    {
      name: "n8n-workflow-storage", // name of the item in the storage (must be unique)
    }
  )
);
