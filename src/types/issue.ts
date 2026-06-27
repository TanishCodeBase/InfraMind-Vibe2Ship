import type { Timestamp } from "firebase/firestore";

// ─── Enumerations ─────────────────────────────────────────────────────────────

export type IssueCategory =
  | "pothole"
  | "water_leak"
  | "broken_streetlight"
  | "garbage_overflow"
  | "damaged_road"
  | "sewage"
  | "fallen_tree"
  | "illegal_dumping"
  | "damaged_footpath"
  | "other";

export type IssuePriority = "critical" | "high" | "medium" | "low";

export type IssueStatus =
  | "pending"
  | "under_review"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "rejected"
  | "duplicate";

export type IssueVerificationStatus =
  | "unverified"
  | "community_verified"
  | "authority_verified"
  | "disputed";

// ─── Location ─────────────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface IssueLocation {
  geoPoint: GeoPoint;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  ward?: string;
  zone?: string;
}

// ─── AI Analysis ──────────────────────────────────────────────────────────────

export interface AIClassification {
  category: IssueCategory;
  confidence: number; // 0-1
  suggestedPriority: IssuePriority;
  tags: string[];
  reasoning: string;
  processedAt: Timestamp;
  modelVersion: string;
}

export interface AIPriorityScore {
  score: number; // 0-100
  priority: IssuePriority;
  factors: {
    severity: number;
    affectedPopulation: number;
    recurrence: number;
    timeElapsed: number;
    communityUpvotes: number;
  };
  calculatedAt: Timestamp;
}

export interface AIConsensusResult {
  isDuplicate: boolean;
  duplicateOf?: string; // issue ID
  clusterSize: number;
  similarIssues: string[]; // issue IDs
  consensusAt: Timestamp;
}

// ─── Authority Routing ────────────────────────────────────────────────────────

export interface AuthorityRouting {
  authorityId: string;
  departmentCode: string;
  assignedAt: Timestamp;
  assignedBy: "ai" | "admin";
  escalated: boolean;
  escalatedAt?: Timestamp;
}

// ─── Community Engagement ────────────────────────────────────────────────────

export interface CommunityEngagement {
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: number;
  shareCount: number;
  upvotedBy: string[]; // user IDs
}

// ─── Timeline ────────────────────────────────────────────────────────────────

export interface IssueTimelineEvent {
  id: string;
  type:
    | "created"
    | "status_changed"
    | "comment_added"
    | "assigned"
    | "escalated"
    | "resolved"
    | "ai_processed";
  description: string;
  actor: "citizen" | "authority" | "ai_agent" | "system";
  actorId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
}

// ─── Core Issue Document ──────────────────────────────────────────────────────

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  verificationStatus: IssueVerificationStatus;

  // Reporter
  reportedBy: string; // user ID
  reporterName: string;
  reporterPhotoURL?: string;
  isAnonymous: boolean;

  // Media
  imageURLs: string[];
  videoURL?: string;

  // Location
  location: IssueLocation;

  // AI
  aiClassification?: AIClassification;
  aiPriorityScore?: AIPriorityScore;
  aiConsensus?: AIConsensusResult;

  // Authority
  routing?: AuthorityRouting;

  // Engagement
  engagement: CommunityEngagement;

  // Timeline
  timeline: IssueTimelineEvent[];

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt?: Timestamp;
  tags: string[];
  isPublic: boolean;
  source: "web" | "mobile";
}

// ─── Create Payload ───────────────────────────────────────────────────────────

export type CreateIssuePayload = Pick<
  Issue,
  | "title"
  | "description"
  | "location"
  | "imageURLs"
  | "isAnonymous"
  | "isPublic"
  | "source"
> & {
  videoURL?: string;
};

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface IssueFilters {
  category?: IssueCategory;
  status?: IssueStatus;
  priority?: IssuePriority;
  city?: string;
  ward?: string;
  reportedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
