import { generateJSON } from "./geminiClient";
import { CONSENSUS_PROMPT } from "@/lib/prompts";
import { serverTimestamp } from "firebase/firestore";
import type { AIConsensusResult } from "@/types/issue";
import type { AgentConsensusRequest, AgentConsensusResponse } from "@/types/api";
import { haversineDistanceKm } from "@/lib/helpers";
import type { Issue } from "@/types/issue";

// ─── Consensus Agent ──────────────────────────────────────────────────────────

/**
 * Determines if a new issue is a duplicate of or similar to existing issues.
 * Performs a pre-filter by distance before calling Gemini to reduce token cost.
 */
export async function runConsensusAgent(
  request: AgentConsensusRequest,
  candidateIssues: Issue[]
): Promise<AIConsensusResult> {
  // Pre-filter: only send issues within 1km to Gemini
  const nearby = candidateIssues
    .filter((issue) => {
      const distKm = haversineDistanceKm(
        request.location.lat,
        request.location.lng,
        issue.location.geoPoint.lat,
        issue.location.geoPoint.lng
      );
      return distKm <= 1;
    })
    .map((issue) => ({
      id:             issue.id,
      title:          issue.title,
      category:       issue.category,
      lat:            issue.location.geoPoint.lat,
      lng:            issue.location.geoPoint.lng,
      distanceMeters: Math.round(
        haversineDistanceKm(
          request.location.lat,
          request.location.lng,
          issue.location.geoPoint.lat,
          issue.location.geoPoint.lng
        ) * 1000
      ),
    }));

  if (nearby.length === 0) {
    return {
      isDuplicate:    false,
      duplicateOf:    undefined,
      clusterSize:    1,
      similarIssues:  [],
      consensusAt:    serverTimestamp() as unknown as import("firebase/firestore").Timestamp,
    };
  }

  const prompt = buildPrompt(request, nearby);
  const response = await generateJSON<AgentConsensusResponse>(prompt);

  return {
    isDuplicate:   response.isDuplicate,
    duplicateOf:   response.duplicateOf ?? undefined,
    clusterSize:   response.clusterSize,
    similarIssues: response.similarIssues,
    consensusAt:   serverTimestamp() as unknown as import("firebase/firestore").Timestamp,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

type NearbyIssue = {
  id: string;
  title: string;
  category: string;
  lat: number;
  lng: number;
  distanceMeters: number;
};

function buildPrompt(req: AgentConsensusRequest, nearby: NearbyIssue[]): string {
  return [
    CONSENSUS_PROMPT,
    "",
    "Input:",
    JSON.stringify({
      newIssue: {
        title:       req.title,
        description: req.description,
        category:    req.category,
        lat:         req.location.lat,
        lng:         req.location.lng,
      },
      existingIssues: nearby,
    }),
  ].join("\n");
}
