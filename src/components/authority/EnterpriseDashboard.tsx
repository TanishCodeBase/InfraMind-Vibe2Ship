"use client";

import React, { useState, useEffect } from "react";
import { ClipboardList, AlertTriangle, Clock, Target, Building2, CheckCircle2, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Pure React Count-Up Component
function AnimatedCounter({ value, duration = 2000, isFloat = false }: { value: number; duration?: number; isFloat?: boolean }): JSX.Element {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = progress * value;
      setCount(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  if (isFloat) {
    return <span>{count.toFixed(1)}</span>;
  }
  return <span>{Math.floor(count)}</span>;
}

export function EnterpriseDashboard(): JSX.Element {
  const metrics = [
    {
      title: "Total Reports Today",
      value: 324,
      isFloat: false,
      unit: "",
      subtitle: "↑ 18% increase today",
      isUp: true,
      icon: ClipboardList,
      colorClass: "text-blue-400 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] bg-blue-950/5",
    },
    {
      title: "Critical Issues Active",
      value: 17,
      isFloat: false,
      unit: "",
      subtitle: "↓ 2 unresolved pending",
      isUp: false,
      icon: AlertTriangle,
      colorClass: "text-rose-400 border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.15)] bg-rose-950/5",
    },
    {
      title: "Avg Response Time",
      value: 2.8,
      isFloat: true,
      unit: " Hours",
      subtitle: "↓ 12m from yesterday",
      isUp: false,
      icon: Clock,
      colorClass: "text-amber-400 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-950/5",
    },
    {
      title: "AI Classifier Accuracy",
      value: 97.3,
      isFloat: true,
      unit: "%",
      subtitle: "↑ 0.4% this week",
      isUp: true,
      icon: Target,
      colorClass: "text-purple-400 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-950/5",
    },
    {
      title: "Active Departments",
      value: 8,
      isFloat: false,
      unit: " boards",
      subtitle: "Fully interconnected",
      isUp: true,
      icon: Building2,
      colorClass: "text-cyan-400 border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-cyan-950/5",
    },
    {
      title: "Issues Resolved Today",
      value: 142,
      isFloat: false,
      unit: "",
      subtitle: "↑ 22% target SLA met",
      isUp: true,
      icon: CheckCircle2,
      colorClass: "text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-950/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <Card key={idx} glass className={m.colorClass}>
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold">
                  {m.title}
                </span>
                <div className="p-1.5 bg-slate-950/40 rounded border border-white/5">
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-white tracking-tight flex items-baseline gap-1">
                  <AnimatedCounter value={m.value} isFloat={m.isFloat} />
                  <span className="text-sm font-medium text-slate-400">{m.unit}</span>
                </h3>
                
                <div className="flex items-center gap-1 mt-1 text-[10px] font-mono text-slate-400">
                  {m.isUp ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-450" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-455" />
                  )}
                  <span>{m.subtitle}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
