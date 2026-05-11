"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  ArrowRight,
  Bot,
  Play,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const { isSignedIn } = useUser();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute left-0 top-1/2 h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-[100px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/20">
              <Bot className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                AgentFlow
              </h1>
              <p className="text-xs text-white/50">
                AI Workflow Automation
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-white/70 transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#workflow"
              className="text-sm text-white/70 transition hover:text-white"
            >
              Workflow
            </a>

            <a
              href="#pricing"
              className="text-sm text-white/70 transition hover:text-white"
            >
              Pricing
            </a>
          </div>

          <Link href={isSignedIn ? "/dashboard" : "/dashboard"}>
            <button className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-105">
              {isSignedIn ? "Dashboard" : "Get Started"}

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-24 text-center">
        {/* Badge */}
        <div className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-violet-400" />

          <span className="text-sm text-white/80">
            Build next-gen AI automations visually
          </span>
        </div>

        {/* Heading */}
        <h1 className="max-w-6xl text-5xl font-black leading-[1] tracking-[-0.05em] md:text-7xl xl:text-[92px]">
          Create Powerful
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {" "}
            AI Agents{" "}
          </span>
          Without Writing Complex Code.
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/60 md:text-xl">
          Design intelligent AI workflows with drag-and-drop nodes,
          automation pipelines, LLM integrations, memory systems, and
          real-time execution logs.
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col gap-4 sm:flex-row">
          <Link href={isSignedIn ? "/dashboard" : "/dashboard"}>
            <button className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-8 py-4 text-lg font-semibold shadow-2xl shadow-violet-500/30 transition-all duration-300 hover:scale-105">
              Start Building Free

              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </Link>

          <Link href="/editor">
            <button className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium backdrop-blur-xl transition-all duration-300 hover:bg-white/10">
              <Play className="h-5 w-5" />
              Watch Demo
            </button>
          </Link>
        </div>

        {/* Trust */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-white/40">
          <span>Trusted by developers worldwide</span>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Realtime Execution</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
            <span>AI Automation</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-violet-400" />
            <span>Cloud Sync</span>
          </div>
        </div>

        {/* Product Preview */}
        <div className="relative mt-24 w-full max-w-6xl">
          <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-r from-violet-500 via-cyan-500 to-blue-500 opacity-30 blur-xl" />

          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
            {/* Topbar */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>

              <div className="rounded-full border border-white/10 bg-black/30 px-4 py-1 text-xs text-white/60">
                AI Workflow Editor
              </div>
            </div>

            {/* Workflow Canvas */}
            <div className="grid gap-6 p-8 lg:grid-cols-3">
              {/* Left */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-violet-500/20 bg-violet-500/10 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-violet-400/40">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-violet-500/20 p-3">
                      <Bot className="h-6 w-6 text-violet-300" />
                    </div>

                    <div>
                      <h3 className="font-semibold">AI Agent</h3>

                      <p className="text-sm text-white/50">
                        GPT-4 Workflow
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-sm text-white/60">
                    Analyze customer query and generate automation response.
                  </div>
                </div>

                <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-400/40">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-500/20 p-3">
                      <Workflow className="h-6 w-6 text-cyan-300" />
                    </div>

                    <div>
                      <h3 className="font-semibold">Workflow</h3>

                      <p className="text-sm text-white/50">
                        Trigger Pipeline
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/30 p-3 text-sm text-white/60">
                    Connect APIs, memory systems, and AI models visually.
                  </div>
                </div>
              </div>

              {/* Center */}
              <div className="flex items-center justify-center">
                <div className="relative flex h-[320px] w-full items-center justify-center">
                  <div className="absolute h-[220px] w-[220px] rounded-full border border-dashed border-violet-400/30 animate-spin-slow" />

                  <div className="absolute h-[140px] w-[140px] rounded-full border border-dashed border-cyan-400/30 animate-pulse" />

                  <div className="rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
                    <Zap className="h-10 w-10 text-yellow-400" />
                  </div>
                </div>
              </div>

              {/* Right */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-emerald-400/40">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-500/20 p-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-300" />
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        Execution Logs
                      </h3>

                      <p className="text-sm text-white/50">
                        Live Monitoring
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl bg-black/30 p-3 text-sm">
                    <div className="text-emerald-400">
                      ✓ Workflow started
                    </div>

                    <div className="text-cyan-400">
                      ✓ GPT response generated
                    </div>

                    <div className="text-violet-400">
                      ✓ Automation completed
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                  <p className="text-sm text-white/50">
                    Build production-ready AI systems visually with realtime
                    execution, cloud sync, and scalable node architecture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}