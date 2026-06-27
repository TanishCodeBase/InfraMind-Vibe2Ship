import { generateJSON, GEMINI_MODEL_VERSION } from "./geminiClient";
import { PRIORITY_PROMPT } from "@/lib/prompts";
import { serverTimestamp } from "firebase/firestore";
import type { AIPriorityScore } from "@/types/issue";
import type { AgentPriorityRequest, AgentPriorityResponse } from "@/types/api";
import { differenceInHours, parseISO } from "date-fns";

// ─── Priority Agent ───────────────────────────────────────────────────────────

/**
 * Calculates a priority score for a civic issue using Gemini.
 * Called server-side from the /api/agents/priority route.
 */
export async function runPriorityAgent(
  request: AgentPriorityRequest
): Promise<AIPriorityScore> {
  const ageHours = differenceInHours(new Date(), parseISO(request.createdAt));
  const prompt = buildPrompt(request, ageHours);
  const response = await generateJSON<AgentPriorityResponse>(prompt);
  validateResponse(response);

  return {
    score:    Math.round(clamp(response.score, 0, 100)),
    priority: response.priority as AIPriorityScore["priority"],
    factors: {
      severity:          clamp(response.factors.severity ?? 0, 0, 100),
      affectedPopulation:clamp(response.factors.affectedPopulation ?? 0, 0, 100),
      recurrence:        clamp(response.factors.recurrence ?? 0, 0, 100),
      timeElapsed:       clamp(response.factors.timeElapsed ?? 0, 0, 100),
      communityUpvotes:  clamp(response.factors.communityUpvotes ?? 0, 0, 100),
    },
    calculatedAt: serverTimestamp() as unknown as import("firebase/firestore").Timestamp,
  };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildPrompt(req: AgentPriorityRequest, ageHours: number): string {
  return [
    PRIORITY_PROMPT,
    "",
    "Input:",
    JSON.stringify({
      category:                 req.category,
      description:              req.description,
      locationCity:             req.locationCity,
      upvoteCount:              req.upvoteCount,
      ageHours,
      previousReportsInArea:    0, // populated by calling route with DB lookup
    }),
  ].join("\n");
}

function validateResponse(r: AgentPriorityResponse): void {
  const validPriorities = ["critical","high","medium","low"];
  if (typeof r.score !== "number") {
    throw new Error(`[PriorityAgent] Missing score`);
  }
  if (!validPriorities.includes(r.priority)) {
    throw new Error(`[PriorityAgent] Invalid priority: ${r.priority}`);
  }
  if (!r.factors || typeof r.factors !== "object") {
    throw new Error(`[PriorityAgent] Missing factors`);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
