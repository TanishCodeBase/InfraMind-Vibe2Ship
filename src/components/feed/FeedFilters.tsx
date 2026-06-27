"use client";

import React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IssueCategory, IssuePriority, IssueStatus } from "@/types/issue";

interface FeedFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  priority: string;
  setPriority: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
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

export function FeedFilters({
  searchQuery,
  setSearchQuery,
  category,
  setCategory,
  status,
  setStatus,
  priority,
  setPriority,
  city,
  setCity,
  onClearFilters,
}: FeedFiltersProps): JSX.Element {
  const hasActiveFilters = searchQuery || category || status || priority || city;

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-md mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-slate-300">
          <SlidersHorizontal className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider">Search & Filters</h2>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-xs text-slate-400 hover:text-white h-7 px-2"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues by title/desc..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* City Input */}
        <div className="md:col-span-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter by city..."
            className="w-full px-3 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Category Select */}
        <div className="md:col-span-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-2.5 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="bg-slate-950 text-slate-300">
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div className="md:col-span-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-2.5 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
          >
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value} className="bg-slate-950 text-slate-300">
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Select */}
        <div className="md:col-span-2">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-2.5 py-2 text-sm rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors cursor-pointer"
          >
            {PRIORITIES.map((pr) => (
              <option key={pr.value} value={pr.value} className="bg-slate-950 text-slate-300">
                {pr.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
