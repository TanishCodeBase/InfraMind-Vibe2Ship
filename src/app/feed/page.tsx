"use client";

import React, { useState, useEffect } from "react";
import { List, Sparkles, Map, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

import { Navbar } from "@/components/layout/Navbar";
import { FeedFilters } from "@/components/feed/FeedFilters";
import { IssueCard } from "@/components/feed/IssueCard";
import { IssueDetailsModal } from "@/components/feed/IssueDetailsModal";
import { getIssues } from "@/services/firebase/firestoreService";
import type { Issue, IssueFilters } from "@/types/issue";
import { Button } from "@/components/ui/button";
import { LiveActivityTicker } from "@/components/feed/LiveActivityTicker";


export default function FeedPage(): JSX.Element {
  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [city, setCity] = useState("");

  // Data States
  const [issues, setIssues] = useState<Issue[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Fetch issues from Firestore
  const fetchIssues = async (isLoadMore = false) => {
    setIsLoading(true);
    try {
      const filters: IssueFilters = {};
      if (category) filters.category = category as any;
      if (status) filters.status = status as any;
      if (priority) filters.priority = priority as any;
      if (city) filters.city = city;

      const result = await getIssues(filters, 10, isLoadMore ? lastDoc : undefined);
      const fetched = result.issues;

      if (isLoadMore) {
        setIssues((prev) => [...prev, ...fetched]);
      } else {
        setIssues(fetched);
      }

      setLastDoc(result.lastDoc);
      setHasMore(fetched.length >= 10);
    } catch (err) {
      console.error("Firestore query error:", err);
      if (!isLoadMore) {
        setIssues([]);
        setLastDoc(null);
        setHasMore(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch issues on filter changes (only for real Firestore mode)
  useEffect(() => {
    fetchIssues(false);
  }, [category, status, priority, city]);

  // Initial load
  useEffect(() => {
    fetchIssues(false);
  }, []);

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategory("");
    setStatus("");
    setPriority("");
    setCity("");
  };

  // Apply filters locally (handles text search & hybrid Firestore + fallback mock dataset)
  const activeIssuesList = issues;
  const displayedIssues = activeIssuesList.filter((issue) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        issue.title.toLowerCase().includes(q) ||
        issue.description.toLowerCase().includes(q) ||
        issue.location.address.toLowerCase().includes(q) ||
        issue.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    // Always filter client-side to keep mock data & hybrid lists consistent with active filters
    if (category && issue.category !== category) return false;
    if (status && issue.status !== status) return false;
    if (priority && issue.priority !== priority) return false;
    if (city && !issue.location.city.toLowerCase().includes(city.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col noise relative overflow-x-hidden pt-16">
      {/* Background Lights */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 font-mono uppercase tracking-widest text-[10px] mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              Real-Time Civic Monitor
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-none">
              Public Incident <span className="text-gradient">Feed</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Browse issues reported by your community. Track automatic AI classifications, priority levels, and municipal department dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-slate-800 text-slate-400 hover:text-white" asChild>
              <Link href="/map">
                <Map className="w-4 h-4 mr-1.5" />
                View Map
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

        {/* Live Activity Ticker */}
        <LiveActivityTicker />

        {/* Filters */}
        <FeedFilters

          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          category={category}
          setCategory={setCategory}
          status={status}
          setStatus={setStatus}
          priority={priority}
          setPriority={setPriority}
          city={city}
          setCity={setCity}
          onClearFilters={handleClearFilters}
        />

        {/* Feed Listing Grid */}
        {isLoading && issues.length === 0 ? (

          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-sm">Loading incident reports...</p>
          </div>
        ) : displayedIssues.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {displayedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} onViewDetails={setSelectedIssue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
            <List className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <h3 className="font-bold text-white mb-1">No reports found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Try adjusting your search queries or clearing active filters to find incidents.
            </p>
          </div>
        )}

        {/* Load More Pagination */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => fetchIssues(true)}
              className="border-slate-800 text-slate-400 hover:text-white"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Load More Issues
            </Button>
          </div>
        )}
      </main>

      <IssueDetailsModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} />

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4">
          <p>© 2026 InfraMind Civic Solutions. Live AI Dispatch Feed.</p>
        </div>
      </footer>
    </div>
  );
}
