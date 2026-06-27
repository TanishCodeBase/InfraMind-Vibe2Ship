"use client";

import React, { useState } from "react";
import { Eye, Clock, Calendar, AlertTriangle, CheckCircle2, ChevronRight, ThumbsUp, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Issue, IssueStatus } from "@/types/issue";
import { cn } from "@/lib/utils";

interface IssueRowProps {
  issue: Issue;
  onStatusChange: (issueId: string, newStatus: IssueStatus) => Promise<void>;
  onViewDetails: (issue: Issue) => void;
}

export function IssueRow({
  issue,
  onStatusChange,
  onViewDetails,
}: IssueRowProps): JSX.Element {
  const [updating, setUpdating] = useState(false);

  const handleSelectStatus = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as IssueStatus;
    setUpdating(true);
    try {
      await onStatusChange(issue.id, val);
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Helper: Format category names nicely
  const formatCategory = (cat: string) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Date formatter
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Badge styles
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "critical":
        return "critical";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
      default:
        return "success";
    }
  };

  return (
    <tr className="border-b border-slate-800/80 hover:bg-slate-900/40 transition-colors text-xs text-slate-300">
      {/* Category & Thumbnail */}
      <td className="py-4 px-4 font-mono font-bold text-slate-400">
        <div className="flex items-center gap-2">
          {issue.imageURLs && issue.imageURLs.length > 0 ? (
            <img 
              src={issue.imageURLs[0]} 
              alt="" 
              className="w-8 h-8 rounded object-cover border border-slate-800 shrink-0" 
            />
          ) : (
            <div className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
              <span className="text-[7px] text-slate-600 font-mono">N/A</span>
            </div>
          )}
          <span>{formatCategory(issue.category)}</span>
        </div>
      </td>

      {/* Title & Locality */}
      <td className="py-4 px-4 max-w-[200px] sm:max-w-xs">
        <span className="font-bold text-white block truncate">{issue.title}</span>
        <span className="text-[10px] text-slate-500 block truncate mt-0.5">{issue.location.address}</span>
      </td>

      {/* Priority */}
      <td className="py-4 px-4">
        <Badge variant={getPriorityBadgeVariant(issue.priority)}>
          {issue.priority.toUpperCase()}
        </Badge>
      </td>

      {/* Date */}
      <td className="py-4 px-4 font-mono text-slate-500">{formatDate(issue.createdAt)}</td>

      {/* Upvotes */}
      <td className="py-4 px-4 font-mono">
        <div className="flex items-center gap-1.5 text-slate-500">
          <ThumbsUp className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span>{issue.engagement?.upvoteCount || 0}</span>
        </div>
      </td>

      {/* Status Selector */}
      <td className="py-4 px-4">
        {updating ? (
          <div className="h-7 w-28 bg-slate-950/60 rounded border border-slate-800 animate-pulse" />
        ) : (
          <select
            value={issue.status}
            onChange={handleSelectStatus}
            className={cn(
              "text-[11px] font-bold rounded py-1 px-2.5 bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-blue-500/50 cursor-pointer capitalize",
              issue.status === "resolved" && "text-emerald-400 border-emerald-500/25 bg-emerald-950/10",
              issue.status === "in_progress" && "text-amber-400 border-amber-500/25 bg-amber-950/10",
              issue.status === "under_review" && "text-purple-400 border-purple-500/25 bg-purple-950/10",
              issue.status === "rejected" && "text-red-400 border-red-500/25 bg-red-950/10"
            )}
          >
            <option value="under_review">Under Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        )}
      </td>

      {/* Details Trigger */}
      <td className="py-4 px-4 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(issue)}
          className="text-xs text-blue-400 hover:text-blue-300 hover:bg-slate-800 h-7 px-2.5 gap-1 font-semibold"
        >
          <span>SLA Logs</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      </td>
    </tr>
  );
}
