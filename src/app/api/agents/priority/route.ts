import { type NextRequest, NextResponse } from "next/server";
import { runPriorityAgent } from "@/services/agents/priorityAgent";
import { buildSuccessResponse, buildErrorResponse, getErrorMessage } from "@/lib/helpers";
import type { AgentPriorityRequest } from "@/types/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

console.log("PRIORITY API HIT");
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as AgentPriorityRequest;

    if (!body.issueId || !body.category || !body.createdAt) {
      return NextResponse.json(
        buildErrorResponse("INVALID_REQUEST", "issueId, category, and createdAt are required"),
        { status: 400 }
      );
    }

    const result = await runPriorityAgent(body);
    return NextResponse.json(buildSuccessResponse(result), { status: 200 });
  } catch (error) {
    console.error("[/api/agents/priority]", error);
    return NextResponse.json(
      buildErrorResponse("AGENT_ERROR", getErrorMessage(error)),
      { status: 500 }
    );
  }
}
