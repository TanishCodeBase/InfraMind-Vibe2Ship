import { type NextRequest, NextResponse } from "next/server";
import { runClassifierAgent } from "@/services/agents/classifierAgent";
import { urlToGeminiImagePart } from "@/services/agents/geminiClient";
import { buildSuccessResponse, buildErrorResponse, getErrorMessage } from "@/lib/helpers";
import type { AgentClassifyRequest, AgentClassifyImageData } from "@/types/api";
import { getAdminAuth } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

console.log("CLASSIFY API HIT");
// ─── POST /api/agents/classify ────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // ─── Authentication Guard ──────────────────────────────────────────────────
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        buildErrorResponse("UNAUTHORIZED", "Missing or invalid authorization token"),
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    try {
      const adminAuth = getAdminAuth();
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error("[/api/agents/classify] Token verification failed:", error);
      return NextResponse.json(
        buildErrorResponse("UNAUTHORIZED", "Invalid or expired authorization token"),
        { status: 401 }
      );
    }

    if (decodedToken.firebase?.sign_in_provider === "anonymous") {
      return NextResponse.json(
        buildErrorResponse("UNAUTHORIZED", "Anonymous users are not allowed to call the Gemini API"),
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";

    let body: AgentClassifyRequest;

    if (contentType.includes("multipart/form-data")) {
      // ── Multipart path: caller uploaded raw image files ─────────────────────
      // The form fields expected:
      //   issueId:     string
      //   title:       string
      //   description: string
      //   locationCity:string
      //   imageURLs:   JSON-encoded string[]  (for audit / Storage links)
      //   images:      File[] (0-5 image files)
      const form = await request.formData();

      const issueId = form.get("issueId") as string | null;
      const title = form.get("title") as string | null;
      const description = form.get("description") as string | null;
      const locationCity = form.get("locationCity") as string | null;

      if (!issueId || !title || !description || !locationCity) {
        return NextResponse.json(
          buildErrorResponse("INVALID_REQUEST", "issueId, title, description, and locationCity are required"),
          { status: 400 }
        );
      }

      const imageURLsRaw = form.get("imageURLs") as string | null;
      const imageURLs = imageURLsRaw ? (JSON.parse(imageURLsRaw) as string[]) : [];

      // Convert uploaded File objects to base64 GeminiImageParts
      const imageFiles = form.getAll("images") as File[];
      const processedFiles = imageFiles.slice(0, 5);

      // Validate all files BEFORE any arrayBuffer() conversion
      const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
      const maxSizeBytes = 5 * 1024 * 1024; // 5MB

      for (const file of processedFiles) {
        if (!allowedMimes.includes(file.type)) {
          return NextResponse.json(
            buildErrorResponse("INVALID_FILE_TYPE", `File type ${file.type || "unknown"} is not allowed. Only JPEG, PNG, and WebP images are permitted.`),
            { status: 400 }
          );
        }
        if (file.size > maxSizeBytes) {
          return NextResponse.json(
            buildErrorResponse("FILE_TOO_LARGE", `File size ${file.size} exceeds the 5MB limit.`),
            { status: 400 }
          );
        }
      }

      const imageData: AgentClassifyImageData[] = await Promise.all(
        processedFiles.map(async (file): Promise<AgentClassifyImageData> => {
          const arrayBuffer = await file.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const mimeType = file.type as AgentClassifyImageData["mimeType"];
          return { base64, mimeType };
        })
      );

      body = { issueId, title, description, imageURLs, imageData, locationCity };

    } else {
      // ── JSON path: caller passes imageURLs only (no raw files) ───────────────
      // The agent will fetch each URL and convert it to base64 internally.
      body = (await request.json()) as AgentClassifyRequest;

      if (!body.issueId || !body.title || !body.description) {
        return NextResponse.json(
          buildErrorResponse("INVALID_REQUEST", "issueId, title, and description are required"),
          { status: 400 }
        );
      }
    }

    const result = await runClassifierAgent(body);
    return NextResponse.json(buildSuccessResponse(result), { status: 200 });

  } catch (error) {
    console.error("[/api/agents/classify]", error);
    return NextResponse.json(
      buildErrorResponse("AGENT_ERROR", getErrorMessage(error)),
      { status: 500 }
    );
  }
}
