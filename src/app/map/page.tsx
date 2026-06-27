"use client";

import React, { useState, useEffect } from "react";
import { Compass, Sparkles, AlertCircle, Eye, Loader2, Plus, List } from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { IncidentMap } from "@/components/map/IncidentMap";
import { MapControls } from "@/components/map/MapControls";
import { IssueDetailsModal } from "@/components/feed/IssueDetailsModal";
import { getIssues } from "@/services/firebase/firestoreService";
import type { Issue, IssueFilters } from "@/types/issue";
import { Button } from "@/components/ui/button";

export default function MapPage(): JSX.Element {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [enableHeatmap, setEnableHeatmap] = useState(false);

  // Data States
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch issues from Firestore
  const fetchAllIssues = async () => {
    setIsLoading(true);
    try {
      const filters: IssueFilters = {};
      if (category) filters.category = category as any;
      if (status) filters.status = status as any;
      if (priority) filters.priority = priority as any;

      // Fetch a larger page size for maps (e.g. 50 issues) to populate markers nicely
      const result = await getIssues(filters, 50);
      const fetched = result.issues;

      setIssues(fetched);
    } catch (err) {
      console.error("Firestore query error:", err);
      setIssues([])
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch issues on filter changes
  useEffect(() => {
    fetchAllIssues();
  }, [category, status, priority]);

  // Initial load
  useEffect(() => {
    fetchAllIssues();
  }, []);

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategory("");
    setStatus("");
    setPriority("");
  };

  // Apply filters locally (handles text search & fallback mock dataset)
  const activeIssuesList = issues;
  const filteredIssues = activeIssuesList.filter((issue) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.location.address.toLowerCase().includes(q) ||
        issue.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (category && issue.category !== category) return false;
    if (status && issue.status !== status) return false;
    if (priority && issue.priority !== priority) return false;
    return true;
  });
  //console.log("FILTERED ISSUES:", filteredIssues.length);
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
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 font-mono uppercase tracking-widest text-[10px] mb-2.5">
              <Compass className="w-3.5 h-3.5" />
              SLA Geographical Router
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-none">
              Live Incident <span className="text-gradient">Map</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Visualize municipal issues geographically. Overlay heatmaps to identify density hotspots and track departmental routing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white" asChild>
              <Link href="/feed">
                <List className="w-4 h-4 mr-1.5" />
                View Feed
              </Link>
            </Button>
            <Button variant="gradient" asChild>
              <Link href="/report">
                <Plus className="w-4 h-4 mr-1.5" />
                Report Issue
              </Link>
            </Button>
          </div>
        </div>

        {/* Map Controls */}
        <MapControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={setCategory}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          enableHeatmap={enableHeatmap}
          setEnableHeatmap={setEnableHeatmap}
          onClearFilters={handleClearFilters}
        />

        {/* Map Section */}
        {isLoading && filteredIssues.length === 0 ? (
          <div className="w-full h-[520px] rounded-2xl border border-slate-800 bg-slate-900/10 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm">Initializing geographical overlays...</p>
          </div>
        ) : (
          <div className="relative">
            <IncidentMap
              issues={filteredIssues}
              selectedIssue={selectedIssue}
              setSelectedIssue={setSelectedIssue}
              enableHeatmap={enableHeatmap}
            />
            {/* View pipeline detail floating CTA button */}
            {selectedIssue && (
              <div className="absolute top-4 right-4 z-20">
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => setIsModalOpen(true)}
                  className="shadow-lg text-xs"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View Full SLA Timeline
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <IssueDetailsModal
        issue={isModalOpen ? selectedIssue : null}
        onClose={() => setIsModalOpen(false)}
      />

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4">
          <p>© 2026 InfraMind Civic Solutions. Live Geospatial Dispatch Map.</p>
        </div>
      </footer>
    </div>
  );
}
