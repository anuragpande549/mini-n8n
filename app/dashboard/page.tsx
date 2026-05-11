"use client";

import { useEffect, useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus, Bot, LayoutDashboard, ChevronRight, Activity } from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import Link from "next/link";

interface Task {
  id: string;
  name: string;
  description: string;
  workflowData: any;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/");
    } else if (user) {
      fetchTasks();
    }
  }, [user, isLoaded, router]);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error(error);
      // Fail silently for nicer UX during loading
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete task");
    }
  };

  const handleLoadWorkflow = (task: Task) => {
    try {
      const data = typeof task.workflowData === "string" ? JSON.parse(task.workflowData) : task.workflowData;
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      router.push("/editor");
    } catch (e) {
      alert("Failed to load workflow data");
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              AgentFlow
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                useWorkflowStore.getState().clearWorkflow();
                router.push("/editor");
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Agent
            </Button>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.firstName || 'Creator'} 👋</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Manage your AI agents and automated workflows.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Agents</p>
              <h2 className="text-3xl font-bold">{tasks.length}</h2>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600 dark:text-green-400">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Active Executions</p>
              <h2 className="text-3xl font-bold">0</h2>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Your Saved Agents</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm text-center">
            <div className="w-24 h-24 mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center">
              <Bot className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No agents yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
              You haven't created any AI agents or workflows. Get started by building your first automated intelligence graph.
            </p>
            <Button
              onClick={() => {
                useWorkflowStore.getState().clearWorkflow();
                router.push("/editor");
              }}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-8 shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform"
            >
              Create your first Agent
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 w-full" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Bot className="w-6 h-6" />
                    </div>
                    <Button
                      onClick={() => handleDelete(task.id)}
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <h3 className="text-xl font-bold mb-2 line-clamp-1">{task.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                    {task.description || "No description provided. This is an automated AI agent."}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(task.updatedAt).toLocaleDateString()}
                    </span>
                    <Button
                      onClick={() => handleLoadWorkflow(task)}
                      size="sm"
                      variant="secondary"
                      className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Edit Agent
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
