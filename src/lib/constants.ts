import type { IssueCategory, IssuePriority, IssueStatus } from "@/types/issue";

// ─── Application constants ────────────────────────────────────────────────────

export const APP_NAME = "InfraMind" as const;
export const APP_TAGLINE = "AI-Powered Civic Infrastructure Reporting" as const;
export const APP_VERSION = "0.1.0" as const;

// ─── Firestore collection names ───────────────────────────────────────────────

export const COLLECTIONS = {
  USERS: "users",
  ISSUES: "issues",
  AUTHORITIES: "authorities",
  COMMENTS: "comments",
  NOTIFICATIONS: "notifications",
  ANALYTICS: "analytics",
  AGENT_LOGS: "agent_logs",
  PATTERNS: "patterns",
} as const;

// ─── Firebase Storage paths ───────────────────────────────────────────────────

export const STORAGE_PATHS = {
  ISSUE_IMAGES: "issues/images",
  ISSUE_VIDEOS: "issues/videos",
  USER_AVATARS: "users/avatars",
  AUTHORITY_LOGOS: "authorities/logos",
} as const;

// ─── Realtime Database paths ──────────────────────────────────────────────────

export const RTDB_PATHS = {
  ONLINE_USERS: "presence",
  LIVE_FEED: "live_feed",
  AGENT_STATUS: "agent_status",
  NOTIFICATIONS: "notifications",
} as const;

// ─── Issue category display config ────────────────────────────────────────────

export const ISSUE_CATEGORY_CONFIG: Record<
  IssueCategory,
  { label: string; icon: string; color: string }
> = {
  pothole:            { label: "Pothole",            icon: "⚠️",  color: "#f59e0b" },
  water_leak:         { label: "Water Leak",         icon: "💧",  color: "#3b82f6" },
  broken_streetlight: { label: "Broken Streetlight", icon: "💡",  color: "#eab308" },
  garbage_overflow:   { label: "Garbage Overflow",   icon: "🗑️",  color: "#84cc16" },
  damaged_road:       { label: "Damaged Road",       icon: "🛣️",  color: "#f97316" },
  sewage:             { label: "Sewage",             icon: "🚰",  color: "#8b5cf6" },
  fallen_tree:        { label: "Fallen Tree",        icon: "🌳",  color: "#22c55e" },
  illegal_dumping:    { label: "Illegal Dumping",    icon: "🚫",  color: "#ef4444" },
  damaged_footpath:   { label: "Damaged Footpath",   icon: "🚶",  color: "#ec4899" },
  other:              { label: "Other",              icon: "📋",  color: "#6b7280" },
};

// ─── Priority display config ──────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<
  IssuePriority,
  { label: string; color: string; bgColor: string; description: string }
> = {
  critical: {
    label: "Critical",
    color: "#ef4444",
    bgColor: "#fef2f2",
    description: "Immediate danger to public safety",
  },
  high: {
    label: "High",
    color: "#f97316",
    bgColor: "#fff7ed",
    description: "Significant inconvenience, urgent",
  },
  medium: {
    label: "Medium",
    color: "#eab308",
    bgColor: "#fefce8",
    description: "Moderate impact, schedule soon",
  },
  low: {
    label: "Low",
    color: "#22c55e",
    bgColor: "#f0fdf4",
    description: "Minor issue, address when possible",
  },
};

// ─── Status display config ────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  IssueStatus,
  { label: string; color: string; description: string }
> = {
  pending:            { label: "Pending",          color: "#6b7280", description: "Awaiting AI processing" },
  under_review:       { label: "Under Review",     color: "#3b82f6", description: "Being reviewed by AI agents" },
  assigned:           { label: "Assigned",         color: "#8b5cf6", description: "Assigned to authority" },
  in_progress:        { label: "In Progress",      color: "#f97316", description: "Authority working on it" },
  resolved:           { label: "Resolved",         color: "#22c55e", description: "Issue has been fixed" },
  rejected:           { label: "Rejected",         color: "#ef4444", description: "Not a valid civic issue" },
  duplicate:          { label: "Duplicate",        color: "#6b7280", description: "Already reported" },
};

// ─── Gamification XP values ───────────────────────────────────────────────────

export const XP_VALUES = {
  REPORT_SUBMITTED:     50,
  REPORT_VERIFIED_BY_COMMUNITY: 25,
  REPORT_RESOLVED:      100,
  UPVOTE_GIVEN:         5,
  COMMENT_POSTED:       10,
  STREAK_BONUS_PER_DAY: 15,
  QUALITY_REPORT_BONUS: 30,
} as const;

// ─── Pagination ───────────────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20 as const;
export const MAX_PAGE_SIZE = 100 as const;

// ─── File upload limits ───────────────────────────────────────────────────────

export const UPLOAD_LIMITS = {
  IMAGE_MAX_SIZE_MB: 10,
  VIDEO_MAX_SIZE_MB: 50,
  MAX_IMAGES_PER_ISSUE: 5,
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ACCEPTED_VIDEO_TYPES: ["video/mp4", "video/webm"],
} as const;

// ─── Map defaults ─────────────────────────────────────────────────────────────

export const MAP_DEFAULTS = {
  CENTER: { lat: 20.5937, lng: 78.9629 }, // India center
  ZOOM: 5,
  CITY_ZOOM: 12,
  ISSUE_ZOOM: 16,
} as const;

// ─── Protected routes ─────────────────────────────────────────────────────────

export const PROTECTED_ROUTES = [
  "/report",
  "/feed",
  "/dashboard",
  "/map",
  "/authority",
  "/leaderboard",
  "/profile",
] as const;

export const AUTH_ROUTES = ["/auth/login"] as const;
export const PUBLIC_ROUTES = ["/", "/about", "/contact"] as const;

// ─── API route prefixes ───────────────────────────────────────────────────────

export const API_ROUTES = {
  AGENTS: {
    CLASSIFY:  "/api/agents/classify",
    PRIORITY:  "/api/agents/priority",
    CONSENSUS: "/api/agents/consensus",
    ROUTING:   "/api/agents/routing",
    PATTERNS:  "/api/agents/patterns",
  },
  AUTH:    "/api/auth",
  REPORTS: "/api/reports",
  UPLOAD:  "/api/upload",
} as const;
