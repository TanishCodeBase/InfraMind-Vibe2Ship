"use client";

import React, { useState, useEffect } from "react";
import { Activity, Terminal } from "lucide-react";

export function LiveActivityTicker(): JSX.Element {
  const messages = [
    "New pothole detected in Koramangala. Routing to BBMP PWD.",
    "Garbage overflow report on 27th Main HSR Layout routed automatically.",
    "Water leakage pipeline outside Whitefield IT park assigned to BWSSB.",
    "Streetlight outage resolved in Jayanagar 3rd Block by BESCOM crew.",
    "Critical road damage reported at MG Road Metro intersection. SLA active.",
    "Sewer overflow in Indiranagar identified. BWSSB jetting dispatched.",
    "Consensus engine merged 3 duplicate street defect reports in Banashankari."
  ];

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 animate-pulse-slow">
      {/* Cyan Neon Glow Border Card */}
      <div className="bg-slate-950/90 border border-cyan-500/30 rounded-lg py-2.5 px-4 flex items-center gap-3.5 backdrop-blur-md shadow-[0_0_22px_rgba(34,211,238,0.25)] relative overflow-hidden">
        {/* Glowing backdrop laser beam effect */}
        <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />

        {/* Pulsing Signal Waveform Icon */}
        <div className="relative flex items-center justify-center shrink-0">
          <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-cyan-400/25 opacity-75" />
          <div className="relative p-1 bg-cyan-500/10 rounded-md border border-cyan-500/30">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
        
        {/* Terminal Header tag */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 font-extrabold tracking-wider shrink-0 uppercase">
          <span>[ LIVE AI MONITOR ]</span>
        </div>

        {/* Console line message text */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="font-mono text-xs text-cyan-500 font-bold shrink-0">&gt;</span>
          <p className={`text-xs font-mono font-semibold text-slate-200 tracking-wide transition-all duration-300 truncate ${fade ? "opacity-100 translate-y-0 text-cyan-300" : "opacity-0 -translate-y-0.5"}`}>
            {messages[index]}
          </p>
        </div>
      </div>
    </div>
  );
}
