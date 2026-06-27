"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Activity, Radio, Cpu, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  time: string;
  text: string;
  routing: string;
  priority: "low" | "medium" | "high" | "critical" | "resolved" | "system";
}

const INITIAL_LOG_POOL: Omit<LogEntry, "id" | "time">[] = [
  { text: "Pothole detected near MG Road. Gemini Confidence: 97.2%", routing: "Routing → Public Works Department", priority: "critical" },
  { text: "Water leakage severity increased.", routing: "Priority escalated → HIGH | Routing → BWSSB", priority: "high" },
  { text: "Streetlight outage detected on 100 Feet Rd.", routing: "Assigned → BESCOM", priority: "medium" },
  { text: "Garbage overflow detected near Indiranagar.", routing: "Assigned → BBMP Waste Management", priority: "medium" },
  { text: "Duplicate report pattern detected.", routing: "Merged incident cluster successfully.", priority: "system" },
  { text: "Road damage near Whitefield. Traffic risk score elevated.", routing: "Priority → CRITICAL", priority: "critical" },
  { text: "Drainage blockage identified near Jayanagar.", routing: "Assigned → Sewerage Department", priority: "high" },
  { text: "AI classification confidence stable.", routing: "System accuracy → 97.3%", priority: "resolved" },
  { text: "Water supply pipe rupture reported near Koramangala.", routing: "Assigned → BWSSB Dispatch Desk", priority: "high" },
  { text: "PWD maintenance crew dispatched to MG Road.", routing: "SLA status updated → IN_PROGRESS", priority: "resolved" },
  { text: "Illegal trash dumping hotspot flagged in HSR Layout.", routing: "Assigned → SWM Sanitation Unit", priority: "medium" },
  { text: "Anomalous voltage fluctuation reported on streetlights.", routing: "Assigned → BESCOM Grid Control", priority: "medium" }
];

export function AiDispatchConsole(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [poolIndex, setPoolIndex] = useState(0);

  // Helper to format HH:MM:SS
  const getFormattedTime = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Initialize with the first 6 logs
  useEffect(() => {
    const initialLogs: LogEntry[] = INITIAL_LOG_POOL.slice(0, 6).map((item, idx) => {
      const timeObj = new Date(Date.now() - (6 - idx) * 35000); // spread them in past
      const pad = (n: number) => String(n).padStart(2, "0");
      const timeStr = `${pad(timeObj.getHours())}:${pad(timeObj.getMinutes())}:${pad(timeObj.getSeconds())}`;
      
      return {
        ...item,
        id: `log_${idx}_${Date.now()}`,
        time: timeStr,
      };
    });
    setLogs(initialLogs);
    setPoolIndex(6);
  }, []);

  // Set up interval to append a new log every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        const item = INITIAL_LOG_POOL[poolIndex % INITIAL_LOG_POOL.length];
        const newLog: LogEntry = {
          ...item,
          id: `log_${Date.now()}`,
          time: getFormattedTime(),
        };
        
        // Append new, limit to last 8 logs to slide old logs off
        const nextLogs = [...prev, newLog];
        if (nextLogs.length > 8) {
          return nextLogs.slice(nextLogs.length - 8);
        }
        return nextLogs;
      });
      setPoolIndex((prev) => prev + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, [poolIndex]);

  return (
    <div className="border border-slate-800 bg-slate-900/10 backdrop-blur rounded-xl p-5 md:p-6 shadow-[0_0_30px_rgba(34,211,238,0.05)] relative overflow-hidden mb-8">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

      {/* CSS cursor blink */}
      <style>{`
        @keyframes terminal-blink {
          0%, 100% { opacity: 0 }
          50% { opacity: 1 }
        }
        .animate-blink {
          animation: terminal-blink 1s infinite;
        }
      `}</style>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-455 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
              SYSTEM ONLINE ●
            </span>
          </div>
          <h2 className="text-base font-black tracking-wider text-white mt-1 uppercase flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            AI Dispatch Command Center
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Live autonomous agent routing activity across municipal infrastructure network.
          </p>
        </div>

        {/* Live Network Status Indicator Widgets */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 bg-slate-950/80 border border-slate-900 rounded-lg p-2 px-3 font-mono text-[9px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>GEMINI VISION: <span className="text-emerald-400 font-bold">ONLINE</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>ROUTING: <span className="text-cyan-400 font-bold">ACTIVE</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>PRIORITY: <span className="text-cyan-400 font-bold">ACTIVE</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: "6s" }} />
            <span>PATTERN DETECT: <span className="text-purple-400 font-bold">MONITORING</span></span>
          </div>
        </div>
      </div>

      {/* Scrolling logs console screen */}
      <div className="bg-slate-950/90 border border-slate-900/60 rounded-lg p-4 font-mono text-xs text-slate-355 min-h-[260px] max-h-[300px] overflow-y-auto space-y-3 relative z-10 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
        {logs.map((log) => (
          <div 
            key={log.id} 
            className={cn(
              "flex items-start gap-3 border-l-2 pl-3 py-1 animate-fade-in transition-all duration-300",
              log.priority === "critical" && "border-rose-500 text-rose-300",
              log.priority === "high" && "border-amber-500 text-amber-300",
              log.priority === "medium" && "border-cyan-500 text-cyan-300",
              log.priority === "resolved" && "border-emerald-500 text-emerald-300",
              log.priority === "system" && "border-purple-500 text-purple-300"
            )}
          >
            {/* Timestamp */}
            <span className="text-[10px] text-slate-500 shrink-0 font-bold">
              [{log.time}]
            </span>

            {/* Indicator Dot */}
            <span className={cn(
              "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 animate-pulse",
              log.priority === "critical" && "bg-rose-500",
              log.priority === "high" && "bg-amber-500",
              log.priority === "medium" && "bg-cyan-500",
              log.priority === "resolved" && "bg-emerald-500",
              log.priority === "system" && "bg-purple-500"
            )} />

            {/* Log text and Routing */}
            <div className="flex-1 space-y-0.5">
              <span className="block text-slate-100 font-semibold leading-relaxed">
                {log.text}
              </span>
              <span className={cn(
                "block text-[10px] font-bold tracking-wider",
                log.priority === "critical" && "text-rose-400",
                log.priority === "high" && "text-amber-400",
                log.priority === "medium" && "text-cyan-400",
                log.priority === "resolved" && "text-emerald-400",
                log.priority === "system" && "text-purple-400"
              )}>
                {log.routing}
              </span>
            </div>
          </div>
        ))}

        {/* Blinking cursor line */}
        <div className="flex items-center text-cyan-400/80 text-[11px] pl-3 animate-pulse pt-1">
          <span>&gt; awaiting next neural consensus dispatch...</span>
          <span className="w-1.5 h-3.5 bg-cyan-400 ml-1.5 inline-block animate-blink shrink-0" />
        </div>
      </div>
    </div>
  );
}
