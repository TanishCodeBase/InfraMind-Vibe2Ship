import { generateJSON } from "./geminiClient";
import { AUTHORITY_ROUTING_PROMPT } from "@/lib/prompts";
import { CATEGORY_DEPARTMENT_MAP } from "@/types/authority";
import type { AgentRoutingRequest, AgentRoutingResponse } from "@/types/api";
import type { Authority } from "@/types/authority";

// ─── Authority Routing Agent ──────────────────────────────────────────────────

/**
 * Determines the best authority/department to handle an issue.
 * Uses a deterministic fallback (category → department map) when
 * no AI-suitable authorities are found.
 */
export async function runAuthorityAgent(
  request: AgentRoutingRequest,
  availableAuthorities: Authority[]
): Promise<AgentRoutingResponse> {
  // If no authorities configured, use deterministic fallback
  if (availableAuthorities.length === 0) {
    const departmentCode = CATEGORY_DEPARTMENT_MAP[request.category] ?? "GENERAL";
    return {
      authorityId:    "unassigned",
      departmentCode,
      reasoning:      `No authorities configured for ${request.city}. Assigned to ${departmentCode} by category rule.`,
    };
  }

  // Filter to authorities that match the city
  const cityAuthorities = availableAuthorities.filter(
    (a) => a.city.toLowerCase() === request.city.toLowerCase()
  );

  if (cityAuthorities.length === 0) {
    const departmentCode = CATEGORY_DEPARTMENT_MAP[request.category] ?? "GENERAL";
    return {
      authorityId:    "unassigned",
      departmentCode,
      reasoning:      `No authority found in ${request.city}. Department code from category rule.`,
    };
  }

  const prompt = buildPrompt(request, cityAuthorities);
  const response = await generateJSON<AgentRoutingResponse>(prompt);
  validateResponse(response, cityAuthorities);

  return response;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildPrompt(req: AgentRoutingRequest, authorities: Authority[]): string {
  return [
    AUTHORITY_ROUTING_PROMPT,
    "",
    "Input:",
    JSON.stringify({
      category:    req.category,
      city:        req.city,
      ward:        req.ward ?? null,
      priority:    req.priority,
      description: "",
      availableAuthorities: authorities.map((a) => ({
        id:                 a.id,
        name:               a.name,
        departmentCode:     a.departmentCode,
        handlesCategories:  a.handlesCategories,
        city:               a.city,
        wards:              a.wards,
      })),
    }),
  ].join("\n");
}

function validateResponse(r: AgentRoutingResponse, authorities: Authority[]): void {
  const validIds = authorities.map((a) => a.id);
  if (!validIds.includes(r.authorityId) && r.authorityId !== "unassigned") {
    // Fall back to first matching department code
    const dept = CATEGORY_DEPARTMENT_MAP[r.authorityId] ?? "GENERAL";
    r.authorityId = authorities.find((a) => a.departmentCode === dept)?.id ?? "unassigned";
  }
}
