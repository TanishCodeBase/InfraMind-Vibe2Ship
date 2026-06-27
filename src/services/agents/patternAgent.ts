import { generateJSON } from "./geminiClient";
import { PATTERN_DETECTION_PROMPT } from "@/lib/prompts";
import type { Issue } from "@/types/issue";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PatternHotspot {
  lat: number;
  lng: number;
  radius: number;
  count: number;
  category: string;
}

export interface CategorySpike {
  category: string;
  currentCount: number;
  averageCount: number;
  changePercent: number;
}

export interface UnresolvedCluster {
  issueIds: string[];
  oldestAgeHours: number;
  category: string;
}

export interface PatternAnalysisResult {
  hotspots: PatternHotspot[];
  categorySpikes: CategorySpike[];
  unresolvedClusters: UnresolvedCluster[];
  insights: string[];
}

// ─── Pattern Agent ────────────────────────────────────────────────────────────

/**
 * Analyses a set of issues for geographic hotspots, category spikes,
 * unresolved clusters, and generates natural-language insights for
 * the authority dashboard.
 */
export async function runPatternAgent(
  issues: Issue[],
  timeRangeDays = 30
): Promise<PatternAnalysisResult> {
  if (issues.length === 0) {
    return {
      hotspots: [],
      categorySpikes: [],
      unresolvedClusters: [],
      insights: ["No issues found in the selected time range."],
    };
  }

  const prompt = buildPrompt(issues, timeRangeDays);
  const result = await generateJSON<PatternAnalysisResult>(prompt);
  return result;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildPrompt(issues: Issue[], timeRangeDays: number): string {
  const compactIssues = issues.slice(0, 200).map((issue) => ({
    id:           issue.id,
    category:     issue.category,
    lat:          issue.location.geoPoint.lat,
    lng:          issue.location.geoPoint.lng,
    priority:     issue.priority,
    createdAt:    issue.createdAt,
    resolvedAt:   issue.resolvedAt ?? null,
  }));

  return [
    PATTERN_DETECTION_PROMPT,
    "",
    "Input:",
    JSON.stringify({ issues: compactIssues, timeRangeDays }),
  ].join("\n");
}
