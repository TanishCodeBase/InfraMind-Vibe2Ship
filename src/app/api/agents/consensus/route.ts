import { type NextRequest, NextResponse } from "next/server";
import { runConsensusAgent } from "@/services/agents/consensusAgent";
import { getIssues } from "@/services/firebase/firestoreService";
import { buildSuccessResponse, buildErrorResponse, getErrorMessage } from "@/lib/helpers";
import type { AgentConsensusRequest } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

console.log("CONSENSUS API HIT");
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as AgentConsensusRequest;

    if (!body.issueId || !body.location) {
      return NextResponse.json(
        buildErrorResponse("INVALID_REQUEST", "issueId and location are required"),
        { status: 400 }
      );
    }

    // Fetch recent issues in the same category for comparison
    const { issues } = await getIssues({ category: body.category as never }, 100);

    const result = await runConsensusAgent(body, issues);
    return NextResponse.json(buildSuccessResponse(result), { status: 200 });
  } catch (error) {
    console.error("[/api/agents/consensus]", error);
    return NextResponse.json(
      buildErrorResponse("AGENT_ERROR", getErrorMessage(error)),
      { status: 500 }
    );
  }
}
