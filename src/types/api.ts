// ─── Generic API shapes ───────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta;
}

// ─── Agent API request/response ───────────────────────────────────────────────

/**
 * A single image's raw data for multimodal Gemini Vision analysis.
 * Either base64 data (for server-side uploads) or a public URL can be
 * provided. The classifier prefers base64 when available.
 */
export interface AgentClassifyImageData {
  /** Base64-encoded image bytes (no data URI prefix). */
  base64: string;
  /** MIME type of the image — must be one accepted by Gemini Vision. */
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
}

export interface AgentClassifyRequest {
  issueId: string;
  title: string;
  description: string;
  /** Public download URLs — used for logging / audit only. */
  category?: string;
  imageURLs: string[];
  /**
   * Raw image data for multimodal Gemini Vision analysis.
   * Populated server-side after reading uploaded file buffers.
   * When present, Gemini Vision analyses actual pixel content.
   * Falls back to text-only classification when absent.
   */
  imageData?: AgentClassifyImageData[];
  locationCity: string;
}

export interface AgentClassifyResponse {
  category: string;
  confidence: number;
  suggestedPriority: string;
  tags: string[];
  reasoning: string;
}

export interface AgentPriorityRequest {
  issueId: string;
  category: string;
  description: string;
  locationCity: string;
  upvoteCount: number;
  createdAt: string; // ISO string
}

export interface AgentPriorityResponse {
  score: number;
  priority: string;
  factors: Record<string, number>;
}

export interface AgentConsensusRequest {
  issueId: string;
  title: string;
  description: string;
  location: { lat: number; lng: number };
  category: string;
}

export interface AgentConsensusResponse {
  isDuplicate: boolean;
  duplicateOf?: string;
  similarIssues: string[];
  clusterSize: number;
}

export interface AgentRoutingRequest {
  issueId: string;
  category: string;
  city: string;
  ward?: string;
  priority: string;
}

export interface AgentRoutingResponse {
  authorityId: string;
  departmentCode: string;
  reasoning: string;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadResponse {
  downloadURL: string;
  storagePath: string;
  contentType: string;
  sizeBytes: number;
}
