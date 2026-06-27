"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AIReadinessIndicatorProps {
  isAiReady: boolean;
}

export function AIReadinessIndicator({ isAiReady }: AIReadinessIndicatorProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-full">
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-75",
            isAiReady ? "animate-ping bg-emerald-400" : "bg-slate-600"
          )}
        />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", isAiReady ? "bg-emerald-500" : "bg-slate-600")} />
      </span>
      <span className="text-[11px] font-semibold text-slate-300">
        {isAiReady ? "Ready for AI classification" : "Fill details for AI prep"}
      </span>
    </div>
  );
}
