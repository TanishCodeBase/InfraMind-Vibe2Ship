import { type NextRequest, NextResponse } from "next/server";
import { runAuthorityAgent } from "@/services/agents/authorityAgent";
import { getAuthoritiesByCity } from "@/services/firebase/firestoreService";
import { buildSuccessResponse, buildErrorResponse, getErrorMessage } from "@/lib/helpers";
import type { AgentRoutingRequest } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

console.log("ROUTING API HIT");
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as AgentRoutingRequest;

    if (!body.issueId || !body.category || !body.city) {
      return NextResponse.json(
        buildErrorResponse("INVALID_REQUEST", "issueId, category, and city are required"),
        { status: 400 }
      );
    }

    const authorities = await getAuthoritiesByCity(body.city);
    const result = await runAuthorityAgent(body, authorities);
    return NextResponse.json(buildSuccessResponse(result), { status: 200 });
  } catch (error) {
    console.error("[/api/agents/routing]", error);
    return NextResponse.json(
      buildErrorResponse("AGENT_ERROR", getErrorMessage(error)),
      { status: 500 }
    );
  }
}
