import { serverTimestamp } from "firebase/firestore";
import {
  generateMultimodalJSON,
  urlToGeminiImagePart,
  GEMINI_VISION_MODEL,
  type GeminiImagePart,
} from "./geminiClient";
import { CLASSIFIER_PROMPT } from "@/lib/prompts";
import type { AIClassification, IssueCategory, IssuePriority } from "@/types/issue";
import type {
  AgentClassifyRequest,
  AgentClassifyResponse,
  AgentClassifyImageData,
} from "@/types/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_CATEGORIES: readonly IssueCategory[] = [
  "pothole",
  "water_leak",
  "broken_streetlight",
  "garbage_overflow",
  "damaged_road",
  "sewage",
  "fallen_tree",
  "illegal_dumping",
  "damaged_footpath",
  "other",
];

const VALID_PRIORITIES: readonly IssuePriority[] = [
  "critical",
  "high",
  "medium",
  "low",
];

/**
 * Maximum number of images passed to Gemini per classification request.
 * Gemini 2.0 Flash supports up to 16 inline images per request.
 * We cap at 5 to align with the upload limit and keep token cost low.
 */
const MAX_VISION_IMAGES = 5;

// ─── Classifier Agent ─────────────────────────────────────────────────────────

/**
 * Classifies a civic issue using Gemini Vision.
 *
 * When `request.imageData` is provided, each image's base64 bytes are passed
 * directly to Gemini Vision as `inlineData` Parts — allowing the model to
 * analyse actual photo content (cracks, water, damaged surfaces, etc.)
 * rather than relying on text descriptions.
 *
 * When `request.imageData` is absent but `request.imageURLs` are present,
 * the agent falls back to fetching the images from their public URLs and
 * converting them to inline data automatically.
 *
 * Falls back to text-only classification if no image data is available at all.
 *
 * Called server-side from /api/agents/classify.
 */
export async function runClassifierAgent(
  request: AgentClassifyRequest
): Promise<AIClassification> {
  const imageParts = await resolveImageParts(request);
  const hasImages = imageParts.length > 0;

  const prompt = buildPrompt(request, hasImages);

  const response = await generateMultimodalJSON<AgentClassifyResponse>({
    prompt,
    images: imageParts,
    model: GEMINI_VISION_MODEL,
  });

  validateResponse(response);

  return {
    category: sanitiseCategory(response.category),
    confidence: clamp(response.confidence, 0, 1),
    suggestedPriority: sanitisePriority(response.suggestedPriority),
    tags: sanitiseTags(response.tags),
    reasoning: response.reasoning?.trim() ?? "",
    processedAt: serverTimestamp() as unknown as import("firebase/firestore").Timestamp,
    modelVersion: GEMINI_VISION_MODEL,
  };
}

// ─── Image resolution ─────────────────────────────────────────────────────────

/**
 * Resolves image parts in priority order:
 *   1. Inline base64 data already in the request  (fastest, no extra fetch)
 *   2. Public Firebase Storage URLs               (requires network fetch)
 *   3. Empty array (text-only fallback)
 *
 * Images that fail to load are skipped with a warning rather than
 * aborting the whole classification.
 */
async function resolveImageParts(
  request: AgentClassifyRequest
): Promise<GeminiImagePart[]> {
  // Priority 1: caller already supplied base64 data
  if (request.imageData && request.imageData.length > 0) {
    return request.imageData
      .slice(0, MAX_VISION_IMAGES)
      .map((img: AgentClassifyImageData): GeminiImagePart => ({
        base64: img.base64,
        mimeType: img.mimeType,
      }));
  }

  // Priority 2: fetch from public URLs
  if (request.imageURLs.length > 0) {
    const urlsToFetch = request.imageURLs.slice(0, MAX_VISION_IMAGES);
    const settled = await Promise.allSettled(
      urlsToFetch.map((url) => urlToGeminiImagePart(url))
    );

    const parts: GeminiImagePart[] = [];
    for (let i = 0; i < settled.length; i++) {
      const result = settled[i];
      if (result.status === "fulfilled") {
        parts.push(result.value);
      } else {
        console.warn(
          `[ClassifierAgent] Could not fetch image ${i + 1} from URL ` +
          `"${urlsToFetch[i]}": ${result.reason instanceof Error ? result.reason.message : String(result.reason)}. ` +
          `Skipping this image.`
        );
      }
    }
    return parts;
  }

  // Priority 3: no images
  return [];
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Builds the classification prompt.
 *
 * When images are present, the prompt instructs Gemini to analyse the attached
 * photos visually. When absent, it informs the model it must classify from
 * text only, adjusting its confidence expectations accordingly.
 */
function buildPrompt(
  req: AgentClassifyRequest,
  hasImages: boolean
): string {
  const imageContext = hasImages
    ? `${req.imageURLs.length} photo(s) are attached below. ` +
    `Analyse them carefully — look for visual evidence of the issue type ` +
    `(cracks, flooding, broken fixtures, waste accumulation, etc.).`
    : `No photos are available. Classify from the text description only. ` +
    `Reflect reduced certainty in the confidence score.`;

  const inputPayload = JSON.stringify({
    userSelectedCategory: req.category,
    title: req.title,
    description: req.description,
    locationCity: req.locationCity,
    imageContext,
  },
    null,
    2
  );

  return [
    CLASSIFIER_PROMPT,
    "",
    "─── Input ───────────────────────────────────────────────────────────────────",
    inputPayload,
    "",
    hasImages
      ? "Analyse the attached image(s) above alongside the text to classify this civic issue."
      : "No images attached. Classify from text only.",
  ].join("\n");
}

// ─── Validation & sanitisation ────────────────────────────────────────────────

function validateResponse(r: AgentClassifyResponse): void {
  if (!r || typeof r !== "object") {
    throw new Error("[ClassifierAgent] Response is not an object");
  }

  if (typeof r.confidence !== "number") {
    throw new Error("[ClassifierAgent] Missing or non-numeric confidence score");
  }

  // Don't hard fail on Gemini malformed tags.
  // sanitiseTags() handles cleanup safely.

  if (typeof r.reasoning !== "string") {
    throw new Error("[ClassifierAgent] reasoning must be a string");
  }
}

/**
 * Returns a valid IssueCategory, defaulting to "other" for unrecognised values.
 * Allows the agent to remain operational even if the model hallucinates a label.
 */
function sanitiseCategory(raw: string): IssueCategory {
  const normalised = raw?.toLowerCase().trim() as IssueCategory;
  return (VALID_CATEGORIES as readonly string[]).includes(normalised)
    ? normalised
    : "other";
}

/**
 * Returns a valid IssuePriority, defaulting to "medium" for unrecognised values.
 */
function sanitisePriority(raw: string): IssuePriority {
  const normalised = raw?.toLowerCase().trim() as IssuePriority;
  return (VALID_PRIORITIES as readonly string[]).includes(normalised)
    ? normalised
    : "medium";
}

/**
 * Ensures tags are an array of non-empty strings, limited to 10 items.
 */
function sanitiseTags(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .map((t) => t.trim().toLowerCase())
    .slice(0, 10);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
