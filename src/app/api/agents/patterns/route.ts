import { type NextRequest, NextResponse } from "next/server";
import { runPatternAgent } from "@/services/agents/patternAgent";
import { getIssues } from "@/services/firebase/firestoreService";
import { buildSuccessResponse, buildErrorResponse, getErrorMessage } from "@/lib/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

console.log("PATTERNS API HIT");
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as { city?: string; timeRangeDays?: number };
    const timeRangeDays = body.timeRangeDays ?? 30;

    const { issues } = await getIssues(
      body.city ? { city: body.city } : {},
      200
    );

    const result = await runPatternAgent(issues, timeRangeDays);
    return NextResponse.json(buildSuccessResponse(result), { status: 200 });
  } catch (error) {
    console.error("[/api/agents/patterns]", error);
    return NextResponse.json(
      buildErrorResponse("AGENT_ERROR", getErrorMessage(error)),
      { status: 500 }
    );
  }
}
