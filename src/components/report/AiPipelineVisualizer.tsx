"use client";

import React from "react";
import { Eye, Tag, Gauge, Building, Radar, ArrowRight, BrainCircuit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AiPipelineVisualizer(): JSX.Element {
  const agents = [
    {
      step: "01",
      name: "Gemini Vision Agent",
      role: "Context Parser",
      desc: "Extracts road damage contours, waste volumes, and structural defects from uploaded image attachments.",
      icon: Eye,
      color: "from-cyan-500 to-blue-500 shadow-cyan-500/10",
    },
    {
      step: "02",
      name: "Classification Agent",
      role: "Classifier",
      desc: "Classifies incidents (pothole, sewage, streetlight) and generates tags with confidence probability thresholds.",
      icon: Tag,
      color: "from-blue-500 to-indigo-500 shadow-blue-500/10",
    },
    {
      step: "03",
      name: "Priority Scorer Agent",
      role: "Urgency Assessor",
      desc: "Calculates an SLA severity score (0-100) based on population density, road speeds, and recurrence.",
      icon: Gauge,
      color: "from-indigo-500 to-purple-500 shadow-indigo-500/10",
    },
    {
      step: "04",
      name: "Routing Agent",
      role: "Dispatcher",
      desc: "Matches incident category with local municipal databases (PWD, SWM, BESCOM) for automatic SLA dispatches.",
      icon: Building,
      color: "from-purple-500 to-pink-500 shadow-purple-500/10",
    },
    {
      step: "05",
      name: "Pattern Agent",
      role: "Cluster Detector",
      desc: "Scans geographical radius constraints to detect repeating failures, duplicate reports, or infrastructure hotspots.",
      icon: Radar,
      color: "from-pink-500 to-rose-500 shadow-pink-500/10",
    },
  ];

  return (
    <section className="mt-12 border-t border-slate-800/80 pt-8">
      <div className="text-center md:text-left mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 font-mono uppercase tracking-widest text-[10px] mb-2">
          <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
          Autonomous Dispatch System
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white mb-1">
          Multi-Agent AI Processing Pipeline
        </h2>
        <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
          How it works: Every reported incident undergoes an autonomous end-to-end multi-agent evaluation sequence using Gemini AI models.
        </p>
      </div>

      {/* Pipeline Flow Container */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-3 relative">
        {agents.map((agent, idx) => {
          const Icon = agent.icon;
          const isLast = idx === agents.length - 1;

          return (
            <React.Fragment key={agent.step}>
              {/* Agent Card (Shorter height design) */}
              <Card glass className="flex-1 bg-slate-900/45 border-slate-850 hover:border-slate-700/80 hover:shadow-lg transition-all duration-300 relative group overflow-hidden h-[240px]">
                <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${agent.color}`} />
                
                <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-mono text-[9px] text-slate-600 font-bold tracking-widest">
                        AGENT {agent.step}
                      </span>
                      <div className={`p-1 rounded-lg bg-gradient-to-br ${agent.color} bg-opacity-10 border border-white/5`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Agent details */}
                    <h3 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-[8px] text-slate-500 font-mono tracking-wider uppercase mt-0.5">
                      {agent.role}
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-450 leading-relaxed font-normal">
                    {agent.desc}
                  </p>
                </CardContent>
              </Card>

              {/* Connecting arrow (only visible on desktop between items) */}
              {!isLast && (
                <div className="hidden lg:flex items-center justify-center text-slate-800 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 animate-pulse-slow" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}
