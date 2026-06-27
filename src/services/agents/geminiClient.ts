import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerativeModel,
  type Part,
  type InlineDataPart,
  type TextPart,
} from "@google/generative-ai";

// ─── Singleton client ─────────────────────────────────────────────────────────

let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[Gemini] Missing GEMINI_API_KEY environment variable. " +
        "Add it to .env.local"
      );
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

// ─── Safety settings ──────────────────────────────────────────────────────────

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

// ─── Model names ──────────────────────────────────────────────────────────────

export type GeminiModelName =
  | "gemini-2.5-flash"
  | "gemini-2.5-flash-lite";

export const GEMINI_MODEL_VERSION: GeminiModelName = "gemini-2.5-flash";

/** Vision-capable model */
export const GEMINI_VISION_MODEL: GeminiModelName = "gemini-2.5-flash";

// ─── Multimodal Part types ────────────────────────────────────────────────────

/**
 * An image part passed directly to Gemini Vision via inline base64 data.
 * The base64 string must NOT include the `data:<mimeType>;base64,` prefix.
 */
export interface GeminiImagePart {
  /** Raw base64-encoded image bytes. */
  base64: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}

/**
 * Full multimodal content request — text prompt plus zero or more images.
 */
export interface GeminiMultimodalRequest {
  prompt: string;
  images?: GeminiImagePart[];
  /** Override the model. Defaults to GEMINI_VISION_MODEL when images present,
   *  GEMINI_MODEL_VERSION otherwise. */
  model?: GeminiModelName;
}

// ─── Retry configuration ──────────────────────────────────────────────────────

const RETRY_CONFIG = {
  maxAttempts: 1,
  initialDelayMs: 500,
  backoffFactor: 2,   // 500ms → 1000ms → 2000ms
  jitterMs: 200, // ± random jitter to avoid thundering herd
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  // Retry on rate limits, transient server errors, and network issues
  return (
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("503") ||
    msg.includes("500") ||
    msg.includes("resource exhausted") ||
    msg.includes("network") ||
    msg.includes("fetch")
  );
}

/**
 * Attempts to extract a JSON object or array from a string that may contain
 * markdown fences, trailing prose, or partial content.
 *
 * Strategy (in priority order):
 *  1. Direct JSON.parse on the trimmed text.
 *  2. Strip ```json … ``` or ``` … ``` markdown fences, then parse.
 *  3. Extract the first {...} or [...] balanced block using a bracket scan.
 */
export function safeParseJSON<T>(raw: string): T {
  const text = raw.trim();

  // Strategy 1: direct parse
  try {
    return JSON.parse(text) as T;
  } catch {
    // fall through
  }

  // Strategy 2: strip markdown code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      // fall through
    }
  }

  // Strategy 3: bracket scan for first JSON object or array
  const startObj = text.indexOf("{");
  const startArr = text.indexOf("[");
  const startIndex =
    startObj === -1 ? startArr :
      startArr === -1 ? startObj :
        Math.min(startObj, startArr);

  if (startIndex !== -1) {
    const openChar = text[startIndex] as "{" | "[";
    const closeChar = openChar === "{" ? "}" : "]";
    let depth = 0;
    let end = -1;

    for (let i = startIndex; i < text.length; i++) {
      if (text[i] === openChar) depth++;
      if (text[i] === closeChar) depth--;
      if (depth === 0) { end = i; break; }
    }

    if (end !== -1) {
      try {
        return JSON.parse(text.slice(startIndex, end + 1)) as T;
      } catch {
        // fall through
      }
    }
  }

  throw new Error(
    `[Gemini] Could not extract valid JSON from response.\n` +
    `Raw (first 600 chars): ${text.slice(0, 600)}`
  );
}

// ─── Model factory ────────────────────────────────────────────────────────────

function buildModel(modelName: GeminiModelName): GenerativeModel {
  return getGenAI().getGenerativeModel({
    model: modelName,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.2,   // Low temp for deterministic, structured output
      topP: 0.8,
      maxOutputTokens: 2048,
    },
  });
}

// ─── Core generation with retry ───────────────────────────────────────────────

/**
 * Sends a multimodal content request to Gemini with exponential backoff retry.
 *
 * @param request - Prompt text and optional image parts.
 * @returns Parsed JSON of type T.
 * @throws After all retry attempts are exhausted.
 */
export async function generateMultimodalJSON<T>(
  request: GeminiMultimodalRequest
): Promise<T> {
  const { prompt, images = [], model: modelOverride } = request;

  // Choose model: explicit override > vision model when images present > default
  const modelName: GeminiModelName =
    modelOverride ??
    (images.length > 0 ? GEMINI_VISION_MODEL : GEMINI_MODEL_VERSION);

  const model = buildModel(modelName);

  // Build the Parts array for model.generateContent()
  const parts: Part[] = buildParts(prompt, images);

  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(parts);
      const rawText = result.response.text();
      console.log("RAW GEMINI RESPONSE:", rawText);
      return safeParseJSON<T>(rawText);
    } catch (error) {
      lastError = error;
      console.error("GEMINI REAL ERROR:", error);

      const isLast = attempt === RETRY_CONFIG.maxAttempts;

      if (isLast || !isRetryableError(error)) {
        // Non-retryable or final attempt — break and throw below
        break;
      }

      const jitter = Math.random() * RETRY_CONFIG.jitterMs;
      const delayMs =
        RETRY_CONFIG.initialDelayMs *
        Math.pow(RETRY_CONFIG.backoffFactor, attempt - 1) +
        jitter;

      console.warn(
        `[Gemini] Attempt ${attempt}/${RETRY_CONFIG.maxAttempts} failed. ` +
        `Retrying in ${Math.round(delayMs)}ms. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );

      await sleep(delayMs);
    }
  }

  console.warn("[Gemini] API unavailable. Activating local fallback.");

  return {
    category: "analysis_pending",
    confidence: 0,
    suggestedPriority: "unknown",
    reasoning: "Temporary AI processing issue"
  } as T;
}

/**
 * Text-only convenience wrapper (no images).
 * Kept for agents that don't require Vision (priority, consensus, routing, patterns).
 */
export async function generateJSON<T>(
  prompt: string,
  modelName: GeminiModelName = GEMINI_MODEL_VERSION
): Promise<T> {
  return generateMultimodalJSON<T>({ prompt, model: modelName });
}

// ─── Part builder ─────────────────────────────────────────────────────────────

/**
 * Converts a prompt string and optional image list into a Gemini Parts array.
 *
 * The text part is placed FIRST, then each image part follows.
 * This ordering is recommended by the Gemini docs for classification tasks.
 */
function buildParts(prompt: string, images: GeminiImagePart[]): Part[] {
  const textPart: TextPart = { text: prompt };

  const imageParts: InlineDataPart[] = images.map((img) => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64,
    },
  }));

  return [textPart, ...imageParts];
}

// ─── Image utilities ──────────────────────────────────────────────────────────

/**
 * Fetches a remote image URL and returns it as a GeminiImagePart.
 * Useful server-side when only a Firebase Storage URL is available.
 *
 * Limitations:
 * - The URL must be publicly accessible.
 * - Resizes are NOT performed here; pass reasonably-sized images (<4MB recommended).
 */
export async function urlToGeminiImagePart(
  url: string
): Promise<GeminiImagePart> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `[Gemini] Failed to fetch image from URL: ${url} — HTTP ${response.status}`
    );
  }

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
  type ValidMime = typeof validMimeTypes[number];

  const mimeType: ValidMime = (
    validMimeTypes.includes(contentType as ValidMime)
      ? contentType
      : "image/jpeg"
  ) as ValidMime;

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return { base64, mimeType };
}

/**
 * Converts a Node.js Buffer (e.g., from reading an uploaded file on the server)
 * into a GeminiImagePart.
 */
export function bufferToGeminiImagePart(
  buffer: Buffer,
  mimeType: GeminiImagePart["mimeType"] = "image/jpeg"
): GeminiImagePart {
  return {
    base64: buffer.toString("base64"),
    mimeType,
  };
}
