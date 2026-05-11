"use client";

import React, { useState } from "react";
import { nodeDefinitions, NodeDefinition } from "@/lib/node-definitions";

import {
  Play,
  Plus,
  Save,
  LayoutList,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useWorkflowStore } from "@/lib/store";

import {
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import Link from "next/link";

interface SidebarProps {
  onExecute: () => void;
  isExecuting: boolean;
}

export default function Sidebar({
  onExecute,
  isExecuting,
}: SidebarProps) {
  const { clearWorkflow, nodes, edges } =
    useWorkflowStore();

  const { isLoaded, isSignedIn } = useUser();

  const [search, setSearch] = useState("");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const handleSave = async () => {
    const name = prompt("Enter workflow name");

    if (!name) return;

    const description =
      prompt("Enter workflow description") || "";

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          description,
          workflowData: { nodes, edges },
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("Please sign in first");
          return;
        }

        throw new Error("Failed");
      }

      alert("Workflow saved successfully 🚀");
    } catch (err) {
      console.error(err);
      alert("Failed to save workflow");
    }
  };

  const onDragStart = (
    event: React.DragEvent,
    nodeType: string
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      nodeType
    );

    event.dataTransfer.effectAllowed = "move";
  };

  const categories = {
    trigger: "Trigger Nodes",
    ai: "AI Nodes",
    action: "Action Nodes",
    logic: "Logic Nodes",
  };

  const groupedNodes = Object.values(nodeDefinitions).reduce(
    (acc, node) => {
      if (
        !node.label
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return acc;
      }

      if (!acc[node.category]) {
        acc[node.category] = [];
      }

      acc[node.category].push(node);

      return acc;
    },
    {} as Record<string, NodeDefinition[]>
  );

  return (
    <>
      <aside className="w-80 h-screen flex flex-col overflow-hidden border-r border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#09090b]/90 backdrop-blur-xl">

        {/* HEADER */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 p-4">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Agent Editor
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Build AI workflows visually
              </p>
            </div>

            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <Button size="sm">
                  Sign In
                </Button>
              </SignInButton>
            )}

            {isLoaded && isSignedIn && (
              <UserButton afterSignOutUrl="/" />
            )}
          </div>

          {/* SEARCH */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

            <input
              type="text"
              placeholder="Search nodes..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* ACTIONS */}
          <div className="space-y-2">

            <Button
              onClick={onExecute}
              disabled={isExecuting}
              className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Play className="mr-2 h-4 w-4" />

              {isExecuting
                ? "Executing..."
                : "Run Workflow"}
            </Button>

            <div className="grid grid-cols-2 gap-2">

              <Button
                onClick={handleSave}
                variant="outline"
                className="rounded-xl"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>

              <button
                onClick={() =>
                  setShowConfirm(true)
                }
                className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 transition-all h-10 text-sm font-medium"
              >
                <Plus className="mr-2 h-4 w-4" />
                New
              </button>
            </div>

            {isLoaded && isSignedIn && (
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="w-full rounded-xl"
                >
                  <LayoutList className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* NODE LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {Object.entries(categories).map(
            ([category, title]) => (
              <div key={category}>

                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-indigo-500" />

                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {title}
                  </h3>
                </div>

                <div className="space-y-2">

                  {groupedNodes[category]?.map(
                    (node) => (
                      <div
                        key={node.type}
                        draggable
                        onDragStart={(event) =>
                          onDragStart(
                            event,
                            node.type
                          )
                        }
                        className="group cursor-grab active:cursor-grabbing rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 transition-all hover:-translate-y-0.5 hover:border-indigo-400 hover:shadow-lg"
                      >
                        <div className="flex items-start gap-3">

                          <div
                            className={`${node.color} rounded-xl p-2 shadow-md`}
                          >
                            <node.icon className="h-4 w-4 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">

                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {node.label}
                            </h4>

                            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                              {node.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )
          )}

          {/* TIP BOX */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/30 p-4">
            <p className="text-xs leading-relaxed text-indigo-700 dark:text-indigo-300">
              <strong>Tip:</strong> Drag nodes onto the
              canvas and connect them to create AI
              workflows visually.
            </p>
          </div>
        </div>
      </aside>

      {/* CUSTOM ALERT MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">

          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#111111] p-6 shadow-2xl border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Create New Workflow?
                </h2>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  This will remove all nodes and
                  connections from the current
                  workflow.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowConfirm(false)
                }
                className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                onClick={() =>
                  setShowConfirm(false)
                }
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  clearWorkflow();
                  setShowConfirm(false);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Yes, Clear Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}