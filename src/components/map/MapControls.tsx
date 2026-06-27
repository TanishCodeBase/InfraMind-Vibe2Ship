"use client";

import React from "react";
import { Search, SlidersHorizontal, Eye, EyeOff, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IssueCategory, IssuePriority, IssueStatus } from "@/types/issue";

interface MapControlsProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  enableHeatmap: boolean;
  setEnableHeatmap: (val: boolean) => void;
  onClearFilters: () => void;
}

const CATEGORIES: { value: IssueCategory | ""; label: string }[] = [
  { value: "", label: "All Categories" },
  { value: "pothole", label: "Pothole" },
  { value: "water_leak", label: "Water Leak" },
  { value: "broken_streetlight", label: "Broken Streetlight" },
  { value: "garbage_overflow", label: "Garbage Overflow" },
  { value: "damaged_road", label: "Damaged Road" },
  { value: "sewage", label: "Sewage" },
  { value: "fallen_tree", label: "Fallen Tree" },
  { value: "illegal_dumping", label: "Illegal Dumping" },
  { value: "damaged_footpath", label: "Damaged Footpath" },
  { value: "other", label: "Other" },
];

const STATUSES: { value: IssueStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
  { value: "duplicate", label: "Duplicate" },
];

const PRIORITIES: { value: IssuePriority | ""; label: string }[] = [
  { value: "", label: "All Priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function MapControls({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  status,
  setStatus,
  priority,
  setPriority,
  enableHeatmap,
  setEnableHeatmap,
  onClearFilters,
}: MapControlsProps): JSX.Element {
  const hasActiveFilters = searchQuery || category || status || priority;

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 backdrop-blur-md mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Search and Dropdowns */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address/title..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Category Select */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-slate-950 text-slate-300">
                {cat.label}
              </option>
            ))}
          </select>

          {/* Status Select */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-2 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
          >
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value} className="bg-slate-950 text-slate-300">
                {st.label}
              </option>
            ))}
          </select>

          {/* Priority Select */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-2 py-1.5 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
          >
            {PRIORITIES.map((pr) => (
              <option key={pr.value} value={pr.value} className="bg-slate-950 text-slate-300">
                {pr.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right Side: Map Layer Toggles & Reset */}
        <div className="flex items-center justify-end gap-3.5 border-t md:border-t-0 border-slate-800/60 pt-3 md:pt-0 shrink-0">
          {/* Heatmap Toggle */}
          <Button
            variant={enableHeatmap ? "default" : "outline"}
            size="sm"
            onClick={() => setEnableHeatmap(!enableHeatmap)}
            className={enableHeatmap 
              ? "bg-blue-600 hover:bg-blue-500 text-white border-blue-500 text-xs h-8"
              : "border-slate-800 text-slate-400 hover:text-white text-xs h-8"
            }
          >
            <Layers className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            <span>Heatmap Overlay: {enableHeatmap ? "ON" : "OFF"}</span>
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-slate-400 hover:text-white h-8"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
