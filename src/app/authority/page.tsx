"use client";

import React, { useState, useEffect } from "react";
import { Award, Building2, AlertCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Timestamp } from "firebase/firestore";

import { Navbar } from "@/components/layout/Navbar";
import { DepartmentStats } from "@/components/authority/DepartmentStats";
import { IssueRow } from "@/components/authority/IssueRow";
import { IssueDetailsModal } from "@/components/feed/IssueDetailsModal";
import { getIssues, updateIssueStatus } from "@/services/firebase/firestoreService";
import type { Issue, IssueStatus, IssueCategory, IssueTimelineEvent } from "@/types/issue";
import { cn } from "@/lib/utils";
import { EnterpriseDashboard } from "@/components/authority/EnterpriseDashboard";
import { AiDispatchConsole } from "@/components/authority/AiDispatchConsole";

type DeptCode = "PWD" | "SWM" | "DJB" | "MSEB";

const DEPARTMENTS: { code: DeptCode; name: string; categories: IssueCategory[] }[] = [
  { code: "PWD", name: "Public Works Dept (Roads)", categories: ["pothole", "damaged_road", "damaged_footpath"] },
  { code: "SWM", name: "Solid Waste Management", categories: ["garbage_overflow", "illegal_dumping"] },
  { code: "DJB", name: "Jal Board (Water & Sewerage)", categories: ["water_leak", "sewage"] },
  { code: "MSEB", name: "Electricity & Streetlights", categories: ["broken_streetlight"] },
];

export default function AuthorityPage(): JSX.Element {
  const [selectedDept, setSelectedDept] = useState<DeptCode>("PWD");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Fetch issues
  const fetchDeptIssues = async () => {
    setIsLoading(true);
    try {
      // Fetch all recent issues, then filter by the department's categories on client for simplicity
      const result = await getIssues({}, 50);
      const fetched = result.issues;

      setIssues(fetched);
    } catch (err) {
      console.error("Firestore query error:", err);
      setIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeptIssues();
  }, []);

  // Filter issues belonging to the active department
  const activeDeptConfig = DEPARTMENTS.find((d) => d.code === selectedDept)!;
  const deptIssues = issues.filter((issue) => activeDeptConfig.categories.includes(issue.category));

  // Compute stats aggregates
  const total = deptIssues.length;
  const underReview = deptIssues.filter((i) => i.status === "under_review").length;
  const inProgress = deptIssues.filter((i) => i.status === "in_progress").length;
  const resolved = deptIssues.filter((i) => i.status === "resolved").length;

  // Handle status update in database & local state
  const handleStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    try {
      await updateIssueStatus(issueId, { status: newStatus });
      setIssues((prev) =>
        prev.map((issue) => {
          if (issue.id === issueId) {
            const now = Timestamp.now();
            const newEvent: IssueTimelineEvent = {
              id: `evt_${Date.now()}`,
              type: newStatus === "resolved" ? "resolved" : "status_changed",
              description: `Status updated to ${newStatus.replace("_", " ")} by official`,
              actor: "authority",
              actorId: selectedDept,
              timestamp: now,
            };
            return {
              ...issue,
              status: newStatus,
              timeline: [...(issue.timeline || []), newEvent],
              updatedAt: now,
              resolvedAt: newStatus === "resolved" ? now : issue.resolvedAt,
            };
          }
          return issue;
        })
      );
    } catch (err) {
      console.error("Failed to update status in database:", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col noise relative overflow-x-hidden pt-16">
      {/* Background Lights */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 px-3 py-1 font-mono uppercase tracking-widest text-[10px] mb-2.5">
              <Award className="w-3.5 h-3.5" />
              Official Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-none">
              Authority <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Municipal dispatch desk. Switch department filters below to review, track SLA timelines, and update resolution states.
            </p>
          </div>
          <button
            onClick={fetchDeptIssues}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg h-9 shrink-0 transition-colors"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            Sync Records
          </button>
        </div>

        {/* Enterprise Analytics Dashboard */}
        <EnterpriseDashboard />

        {/* AI Dispatch Command Center Console */}
        <AiDispatchConsole />

        {/* Department Switcher Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800 pb-4">
          {DEPARTMENTS.map((dept) => (
            <button
              key={dept.code}
              onClick={() => setSelectedDept(dept.code)}
              className={cn(
                "flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg border transition-all duration-200",
                selectedDept === dept.code
                  ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/10"
                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{dept.name}</span>
            </button>
          ))}
        </div>

        {/* Stats */}
        <DepartmentStats total={total} underReview={underReview} inProgress={inProgress} resolved={resolved} />

        {/* Dispatches Table Container */}
        {isLoading && deptIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <p className="text-sm">Loading department dispatches...</p>
          </div>
        ) : deptIssues.length > 0 ? (
          <div className="border border-slate-800 bg-slate-900/10 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-[10px] uppercase font-mono tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Title / Address</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Report Date</th>
                  <th className="py-3.5 px-4">Community Upvotes</th>
                  <th className="py-3.5 px-4">SLA Action Status</th>
                  <th className="py-3.5 px-4 text-right">Action Logs</th>
                </tr>
              </thead>
              <tbody>
                {deptIssues.map((issue) => (
                  <IssueRow
                    key={issue.id}
                    issue={issue}
                    onStatusChange={handleStatusChange}
                    onViewDetails={setSelectedIssue}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
            <Building2 className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-1">Queue Empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              No reports are currently assigned to {activeDeptConfig.name}.
            </p>
          </div>
        )}
      </main>

      <IssueDetailsModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4">
          <p>© 2026 InfraMind Authority Portal. Secure Department Console.</p>
        </div>
      </footer>
    </div>
  );
}
