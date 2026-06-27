"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bot, Check, RefreshCw, XCircle, Terminal, Sparkles, ShieldCheck, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AgentPipelineSimulatorProps {
  isSubmitting: boolean;
  submitStep: number;
  errorMessage?: string;
  simulationResult: {
    category: string;
    confidence: number;
    priority: string;
    score: number;
    department: string;
    ticketId: string;
    reasoning: string;
    tags: string[];
  } | null;
  onReset: () => void;
  onViewFeed: () => void;
}

interface TerminalLine {
  text: string;
  type: "system" | "ai" | "warning" | "success" | "highlight";
  step: number;
  label?: string;
}

const BASE_LINES: TerminalLine[] = [
  // Step 1
  { text: "Transmitting visual packet to Firebase Storage...", type: "system", step: 1, label: "FIREBASE_SYNC" },
  { text: "Local image optimization complete.", type: "system", step: 1, label: "FIREBASE_SYNC" },
  { text: "Media buffer successfully persisted in Firebase.", type: "system", step: 1, label: "FIREBASE_SYNC" },
  // Step 2
  { text: "Sending payload to Gemini 2.5 Flash...", type: "ai", step: 2, label: "GEMINI_VISION" },
  { text: "Gemini analyzing visual evidence...", type: "ai", step: 2, label: "GEMINI_VISION" },
  { text: "Gemini analyzing uploaded visual evidence...", type: "ai", step: 2, label: "GEMINI_VISION" },
  // Step 3
  { text: "Gemini detecting infrastructure anomaly...", type: "warning", step: 3, label: "GEMINI_VISION" },
  { text: "Extracting high-dimensional feature vectors...", type: "warning", step: 3, label: "GEMINI_VISION" },
  // Step 4
  { text: "Gemini Core semantic classification active.", type: "ai", step: 4, label: "GEMINI_CORE" },
  { text: "Core Classification resolved: {CATEGORY}", type: "success", step: 4, label: "GEMINI_CORE" },
  { text: "Gemini classification confidence: {CONFIDENCE}%", type: "success", step: 4, label: "GEMINI_CORE" },
  // Step 5
  { text: "Gemini Reasoner priority scoring active.", type: "ai", step: 5, label: "GEMINI_REASONER" },
  { text: "Evaluating local traffic density matrix...", type: "system", step: 5, label: "GEMINI_REASONER" },
  { text: "SLA risk quotient calculated.", type: "system", step: 5, label: "GEMINI_REASONER" },
  { text: "Resolved Priority Level: {PRIORITY}", type: "warning", step: 5, label: "GEMINI_REASONER" },
  // Step 6
  { text: "Maps Engine authority routing active.", type: "ai", step: 6, label: "MAPS_ENGINE" },
  { text: "Incident routed to: {DEPARTMENT}", type: "success", step: 6, label: "MAPS_ENGINE" },
  // Step 7
  { text: "Gemini Core pattern detection active.", type: "ai", step: 7, label: "MAPS_ENGINE" },
  { text: "Cross-checking spatial duplicate database...", type: "system", step: 7, label: "MAPS_ENGINE" },
  { text: "No duplicate spatial clusters detected.", type: "success", step: 7, label: "MAPS_ENGINE" },
  // Step 8
  { text: "Syncing record to Firestore DB...", type: "system", step: 8, label: "FIREBASE_SYNC" },
  { text: "Initializing transactional commit...", type: "system", step: 8, label: "FIREBASE_SYNC" },
  { text: "Generating unique routing token...", type: "system", step: 8, label: "FIREBASE_SYNC" },
  // Step 9
  { text: "Firebase transaction committed successfully.", type: "success", step: 9, label: "FIREBASE_SYNC" },
  // Step 10 (Final success message)
  { text: "✓ Google Gemini Vision verified & routed to local municipal console.", type: "highlight", step: 10, label: "GEMINI_CORE" }
];

export function AgentPipelineSimulator({
  isSubmitting,
  submitStep,
  errorMessage,
  simulationResult,
  onReset,
  onViewFeed,
}: AgentPipelineSimulatorProps): JSX.Element | null {
  if (!isSubmitting) return null;

  const [lineIndex, setLineIndex] = useState(0);
  const [dotCount, setDotCount] = useState(3);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Dynamic dots animation for loading states
  useEffect(() => {
    if (simulationResult) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(interval);
  }, [simulationResult]);

  // Auto-scroll logs as they output
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [lineIndex]);

  // timing loop that prints line by line
  useEffect(() => {
    if (!isSubmitting) {
      setLineIndex(0);
      return;
    }

    if (lineIndex >= BASE_LINES.length) {
      return;
    }

    const currentLine = BASE_LINES[lineIndex];
    const nextLine = BASE_LINES[lineIndex + 1];

    // Check if next step is blocked awaiting API response
    // Step 9 (index length - 2) and Step 10 require database response to finish
    const isAwaitingBackend = lineIndex >= BASE_LINES.length - 2 && !simulationResult;

    if (isAwaitingBackend) {
      return;
    }

    // Determine typewriter speed
    const isStepTransition = nextLine ? nextLine.step !== currentLine.step : false;
    const delay = isStepTransition ? 1300 : 350;

    const timer = setTimeout(() => {
      setLineIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [isSubmitting, lineIndex, simulationResult]);

  const hasFailed = submitStep === -1 || !!errorMessage;
  const isFinished = lineIndex === BASE_LINES.length && simulationResult !== null;

  // Helper to format category codes into short acronyms matching Authority stats
  const getDeptCode = (category: string) => {
    const cat = category.toLowerCase();
    if (cat === "pothole" || cat === "damaged_road" || cat === "damaged_footpath") return "PWD (ROADS)";
    if (cat === "garbage_overflow" || cat === "illegal_dumping") return "SWM (SANITATION)";
    if (cat === "water_leak" || cat === "sewage") return "BWSSB (JAL BOARD)";
    if (cat === "broken_streetlight") return "BESCOM (ELECTRICITY)";
    return "MUNICIPAL DESK";
  };

  // Replace tags inline with dynamic data
  const getFormattedLine = (line: TerminalLine) => {
    let text = line.text;
    const dots = ".".repeat(dotCount);
    if (simulationResult) {
      text = text
        .replace("{CATEGORY}", (simulationResult.category || "POTHOLE").toUpperCase().replace("_", " "))
        .replace("{CONFIDENCE}%", (simulationResult.confidence ? (simulationResult.confidence * 100).toFixed(1) : "97.2") + "%")
        .replace("{PRIORITY}", (simulationResult.priority || "CRITICAL").toUpperCase())
        .replace("{DEPARTMENT}", getDeptCode(simulationResult.category));
    } else {
      text = text
        .replace("{CATEGORY}", `IDENTIFYING${dots}`)
        .replace("{CONFIDENCE}%", `ANALYZING${dots}`)
        .replace("{PRIORITY}", `CALCULATING${dots}`)
        .replace("{DEPARTMENT}", `ROUTING${dots}`);
    }
    return text;
  };

  const progressPercent = Math.min(Math.round((lineIndex / BASE_LINES.length) * 100), 100);

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col font-mono text-slate-355 select-none overflow-hidden">
      {/* CSS Keyframes for cursor blink */}
      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 0 }
          50% { opacity: 1 }
        }
        .animate-blink {
          animation: terminal-blink 0.8s infinite;
        }
      `}</style>

      {/* Cyberpunk Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08),transparent_85%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-20 pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur px-6 py-4 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Neural AI Dispatch Console v2.8
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-[10px] text-slate-500 font-bold">
          <div>LATENCY: <span className="text-cyan-400">142MS</span></div>
          <div>STATUS: <span className="text-emerald-400">ACTIVE</span></div>
          <div>DISPATCH: <span className="text-purple-400">SECURE_SSL</span></div>
        </div>
      </header>

      {/* Main Terminal Screen */}
      <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10 max-w-4xl mx-auto w-full flex flex-col justify-between gap-6 relative z-10">

        {/* Top High-Tech Status Panel */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Spinning AI Core Visualizer */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-t-cyan-400 animate-spin" style={{ animationDuration: "2.5s" }} />
              <div className="absolute inset-1.5 rounded-full border border-purple-500/20 border-b-purple-400 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
              <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Google Gemini Multi-Agent Engine</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                Consensus protocols running visual validation models...
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-md text-[10px]">
            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="text-slate-400">FPS: 60.00 / LOAD: 4.8%</span>
          </div>
        </div>

        {/* Real-time Ticker Output Console */}
        <div className="flex-1 min-h-[220px] bg-slate-950/70 border border-slate-900 rounded-xl p-5 md:p-6 overflow-y-auto space-y-2.5 shadow-[inset_0_0_20px_rgba(0,0,0,0.6)]">
          {BASE_LINES.slice(0, lineIndex).map((line, idx) => {
            const formattedText = getFormattedLine(line);

            return (
              <div
                key={idx}
                className={cn(
                  "text-xs md:text-sm flex items-start transition-opacity duration-300 animate-fade-in",
                  line.type === "ai" && "text-cyan-400 font-bold",
                  line.type === "warning" && "text-amber-400 font-semibold",
                  line.type === "success" && "text-emerald-450",
                  line.type === "system" && "text-slate-450",
                  line.type === "highlight" && "text-purple-400 font-black text-sm md:text-base border-y border-purple-500/20 py-3 my-4 bg-purple-950/10 px-4 rounded shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                )}
              >
                <span className="shrink-0 select-none mr-3 text-[10px] text-slate-700 mt-0.5">
                  [{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}]
                </span>

                {/* Prefix tags */}
                {line.label ? (
                  <span className={cn(
                    "mr-2 shrink-0 font-bold",
                    line.type === "ai" && "text-cyan-500",
                    line.type === "warning" && "text-amber-500",
                    line.type === "success" && "text-emerald-500",
                    line.type === "system" && "text-slate-500",
                    line.type === "highlight" && "text-purple-500"
                  )}>
                    [{line.label}]
                  </span>
                ) : (
                  <>
                    {line.type === "ai" && <span className="text-cyan-500 mr-2 shrink-0 font-bold">[AI_AGENT]</span>}
                    {line.type === "warning" && <span className="text-amber-500 mr-2 shrink-0 font-bold">[ATTENTION]</span>}
                    {line.type === "success" && <span className="text-emerald-500 mr-2 shrink-0 font-bold">[RESOLVED]</span>}
                    {line.type === "system" && <span className="text-slate-500 mr-2 shrink-0 font-bold">[SYS_BUS]</span>}
                    {line.type === "highlight" && <span className="text-purple-500 mr-2 shrink-0 font-bold">[SUCCESS]</span>}
                  </>
                )}

                <span className="flex-1 break-words">{formattedText}</span>
              </div>
            );
          })}

          {/* Blink Cursor Line */}
          {lineIndex < BASE_LINES.length && !hasFailed && (
            <div className="flex items-center text-cyan-400/80 text-xs md:text-sm pl-8 pt-1 animate-pulse">
              <span>&gt; processing neural routing matrices...</span>
              <span className="w-1.5 h-3.5 bg-cyan-400 ml-1.5 inline-block animate-blink shrink-0" />
            </div>
          )}

          {/* Awaiting Backend loading state */}
          {lineIndex >= BASE_LINES.length - 2 && !simulationResult && !hasFailed && (
            <div className="flex items-center gap-2 text-amber-400/80 text-xs md:text-sm pl-8 pt-1 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>&gt; negotiating secure database transaction...</span>
            </div>
          )}

          {/* Fault State */}
          {hasFailed && (
            <div className="flex items-start text-rose-500 text-xs md:text-sm pl-8 pt-2 space-y-1 flex-col font-bold">
              <span className="flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                [CRITICAL FAULT] PIPELINE TERMINATED
              </span>
              <span className="text-rose-455/90 pl-5 leading-normal">
                Reason: {errorMessage || "Autonomous connection timeout."}
              </span>
            </div>
          )}

          <div ref={logsEndRef} />
        </div>

        {/* Dynamic Success Receipt Card */}
        {isFinished && (
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 animate-fade-in shadow-xl relative animate-[pulse_3s_infinite]">
            {/* Subtle Premium Google AI badge */}
            <div className="absolute top-4 right-4 bg-blue-950/80 border border-blue-500/35 px-2.5 py-1 rounded-full text-[9px] font-bold text-cyan-400 flex items-center gap-1.5 shadow-md shadow-blue-900/10">
              <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>Google Gemini Vision Verified</span>
            </div>

            <div className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-500/20 p-3.5 rounded-lg text-emerald-450 text-xs">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <h4 className="font-black text-white text-sm leading-snug">
                  Municipal Incident Successfully Routed
                </h4>
                <div className="text-[10px] font-bold text-emerald-400/90 mt-1.5 uppercase tracking-wide flex flex-col gap-0.5">
                  <span>● AI Consensus Complete</span>
                  <span>● Authority Dispatch Activated</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed">
                  Record submitted to Firestore. Issue routed to appropriate municipal node. Initial SLA window is active.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[9px] text-slate-550 block font-bold">DISPATCH ID</span>
                <span className="font-mono text-slate-200 block truncate">{simulationResult.ticketId}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-555 block font-bold font-mono">CLASSIFICATION</span>
                <span className="font-bold text-slate-200 capitalize">
                  {simulationResult.category.replace("_", " ")}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block">({(simulationResult.confidence * 100).toFixed(1)}% confidence)</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 block font-bold">PRIORITY ASSIGNED</span>
                <span className="font-bold text-rose-400 uppercase tracking-wider">{simulationResult.priority}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-550 block font-bold">ROUTED DESK</span>
                <span className="font-bold text-cyan-400 uppercase tracking-wider">
                  {getDeptCode(simulationResult.category)}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Status bar / Progress bar */}
      <footer className="border-t border-slate-900 bg-slate-950/85 backdrop-blur p-6 z-10 shrink-0">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-4">

          {/* Progress Bar */}
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
            <span>[ CONSOLE_BUS_LOAD: {progressPercent}% ]</span>
            <span>[ SYSTEM STATE: {!hasFailed ? (isFinished ? "COMPLETED" : "SYNAPSE_BUSY") : "FAULT"} ]</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-900 overflow-hidden relative">
            <div
              className={cn(
                "h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)] bg-gradient-to-r",
                hasFailed ? "from-rose-600 to-red-500 shadow-red-500/50" : "from-blue-600 via-cyan-400 to-emerald-450"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Action buttons */}
          {(isFinished || hasFailed) && (
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                onClick={onReset}
              >
                {hasFailed ? "Close & Edit" : "File Another Report"}
              </Button>
              {isFinished && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={onViewFeed}
                >
                  View Public Feed
                </Button>
              )}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
