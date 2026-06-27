"use client";

import React from "react";
import { 
  X, 
  MapPin, 
  Brain, 
  Calendar, 
  Building, 
  Activity, 
  FileText,
  User,
  Shield,
  Clock,
  Image as ImageIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Issue } from "@/types/issue";
import { cn } from "@/lib/utils";

interface IssueDetailsModalProps {
  issue: Issue | null;
  onClose: () => void;
}

// Stable hashing selector for fallback image variants
const getStableIndex = (id: string, count: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % count;
};

const getFallbackImage = (category: string, id: string) => {
  const hashVal = getStableIndex(id, 12);
  switch (category) {
    case "pothole":
    case "damaged_road":
    case "damaged_footpath": {
      const idx = (hashVal % 3) + 1;
      return `/assets/issues/pothole${idx}.png`;
    }
    case "garbage_overflow":
    case "illegal_dumping": {
      const idx = (hashVal % 3) + 1;
      return `/assets/issues/garbage${idx}.png`;
    }
    case "broken_streetlight": {
      const idx = (hashVal % 2) + 1;
      return `/assets/issues/broken_streetlight${idx}.png`;
    }
    case "sewage": {
      const idx = (hashVal % 3) + 1;
      return `/assets/issues/sewage${idx}.png`;
    }
    case "water_leak": {
      const idx = (hashVal % 2) + 1;
      return `/assets/issues/water_leak${idx}.png`;
    }
    default:
      return `/assets/issues/pothole1.png`;
  }
};

export function IssueDetailsModal({ issue, onClose }: IssueDetailsModalProps): JSX.Element | null {
  if (!issue) return null;

  const formatCategory = (cat: string) => {
    return cat
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTimelineEventIcon = (type: string) => {
    switch (type) {
      case "created":
        return <User className="w-4 h-4 text-blue-400" />;
      case "ai_processed":
        return <Brain className="w-4 h-4 text-purple-400" />;
      case "assigned":
      case "status_changed":
        return <Activity className="w-4 h-4 text-amber-400" />;
      case "resolved":
        return <Shield className="w-4 h-4 text-emerald-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-450" />;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "resolved":
        return "success";
      case "rejected":
        return "destructive";
      case "assigned":
      case "in_progress":
        return "info";
      case "under_review":
        return "purple";
      case "duplicate":
        return "secondary";
      case "pending":
      default:
        return "warning";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/85 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col noise">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <FileText className="w-4.5 h-4.5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white max-w-[200px] sm:max-w-md truncate">
                {issue.title}
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">TICKET ID: {issue.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Images Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center relative">
                <img 
                  src={(issue.imageURLs && issue.imageURLs.length > 0) ? issue.imageURLs[0] : getFallbackImage(issue.category, issue.id)} 
                  alt={issue.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              {issue.imageURLs && issue.imageURLs.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {issue.imageURLs.slice(1, 5).map((url, idx) => (
                    <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* Citizen Info */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-2">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase block font-bold">REPORTED BY</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-700">
                    {issue.reporterName ? issue.reporterName[0].toUpperCase() : "C"}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-100 block">
                      {issue.isAnonymous ? "Anonymous Citizen" : issue.reporterName}
                    </span>
                    <span className="text-[10px] text-gray-200 block flex items-center gap-1 font-mono font-medium">
                      <Calendar className="w-3 h-3 text-blue-400" />
                      {formatDate(issue.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Description & Location */}
            <div className="md:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={getStatusBadgeVariant(issue.status)}>
                  {issue.status.replace("_", " ").toUpperCase()}
                </Badge>
                <Badge variant="outline" className="border-slate-800 text-slate-300 capitalize font-medium">
                  {issue.source} client
                </Badge>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Issue Description</h3>
                <p className="text-sm text-white/80 leading-relaxed bg-slate-950/20 border border-slate-800/40 p-4 rounded-xl font-normal">
                  {issue.description}
                </p>
              </div>

              {/* Location info */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono">Location Information</h3>
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-slate-200 font-medium">
                    <MapPin className="w-4 h-4 text-cyan-405 shrink-0 mt-0.5" />
                    <span>{issue.location.address}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-slate-800/80 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold block mb-0.5">LOCALITY / WARD</span>
                      <span className="font-bold text-slate-100">{issue.location.locality || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-450 font-bold block mb-0.5">CITY / STATE</span>
                      <span className="font-bold text-slate-100">
                        {issue.location.city}, {issue.location.state} {issue.location.pincode}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-450 font-bold block mb-0.5">COORDINATES</span>
                      <span className="font-mono text-[10px] text-slate-350 block font-semibold">
                        Lat: {issue.location.geoPoint.lat.toFixed(6)} | Lng: {issue.location.geoPoint.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI analysis pipeline */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono mb-4 flex items-center gap-1.5">
              <Brain className="w-4.5 h-4.5 text-cyan-400" />
              Gemini AI Pipeline Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Classifier */}
              <div className="bg-blue-950/15 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 font-mono">1. CLASSIFIER</span>
                  <Badge variant="success" className="text-[10px] px-1.5 py-0">
                    {issue.aiClassification ? `${Math.round(issue.aiClassification.confidence * 100)}% Conf` : "90% Conf"}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-350 font-bold block">PREDICTED CATEGORY</span>
                    <span className="font-bold text-slate-100">
                      {formatCategory(issue.aiClassification?.category || issue.category)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-350 font-bold block">REASONING</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed italic">
                      "{issue.aiClassification?.reasoning || "Incident auto-categorized based on description indicators."}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Scorer */}
              <div className="bg-blue-950/15 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 font-mono">2. PRIORITY SCORER</span>
                  <Badge variant={issue.priority === "critical" ? "critical" : "warning"} className="text-[10px] px-1.5 py-0 font-bold">
                    {issue.aiPriorityScore?.score || (issue.priority === "critical" ? 92 : issue.priority === "high" ? 78 : 55)}/100
                  </Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-350 font-bold block">CALCULATED LEVEL</span>
                    <span className="font-bold text-slate-100 capitalize">{issue.priority}</span>
                  </div>
                  <div className="space-y-1 border-t border-slate-800/80 pt-2 text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Severity Factor:</span>
                      <span className="font-mono text-slate-200 font-bold">{issue.priority === "critical" ? "9/10" : "7/10"}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Affected Population:</span>
                      <span className="font-mono text-slate-200 font-bold">8/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Router */}
              <div className="bg-blue-950/15 border border-blue-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-400 font-mono">3. ROUTING & DISPATCH</span>
                  <span className="text-[10px] text-slate-400 font-mono font-medium">SLA: 48 Hrs</span>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-350 font-bold block">ASSIGNED DEPARTMENT</span>
                    <span className="font-bold text-blue-200 block truncate">
                      {issue.routing?.departmentCode || (issue.category === "pothole" || issue.category === "damaged_road" ? "PWD" : "MUNICIPAL")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-355 block font-medium">DISPATCH STATUS</span>
                    <span className="text-cyan-300 font-bold flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-cyan-400" />
                      Routed & Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline tracker */}
          <div className="border-t border-slate-800 pt-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide font-mono mb-4 flex items-center gap-1.5">
              <Activity className="w-4.5 h-4.5 text-cyan-400" />
              SLA Resolution Timeline
            </h3>

            <div className="relative pl-6 border-l border-slate-800 space-y-6 ml-3 py-2">
              {issue.timeline && issue.timeline.length > 0 ? (
                issue.timeline.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative">
                    <div className="absolute -left-[35px] top-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center">
                      {getTimelineEventIcon(evt.type)}
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <span className="text-xs font-bold text-slate-100">
                          {evt.description}
                        </span>
                        <span className="text-[10px] text-gray-200 font-mono font-medium">
                          {formatDate(evt.timestamp)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 capitalize">
                        Actor: {evt.actor.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-xs py-2 italic">No timeline events recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0">
          <Button variant="outline" size="sm" onClick={onClose} className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900">
            Close Panel
          </Button>
        </div>
      </div>
    </div>
  );
}
