import type { Timestamp } from "firebase/firestore";

// ─── Role & Permissions ───────────────────────────────────────────────────────

export type UserRole = "citizen" | "authority" | "admin" | "moderator";

export interface UserPermissions {
  canReport: boolean;
  canVerify: boolean;
  canAssign: boolean;
  canResolve: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModerate: boolean;
}

// ─── Gamification ─────────────────────────────────────────────────────────────

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  iconURL: string;
  awardedAt: Timestamp;
}

export interface UserStats {
  reportsSubmitted: number;
  reportsVerified: number;
  reportsResolved: number;
  upvotesGiven: number;
  upvotesReceived: number;
  commentsPosted: number;
  streakDays: number;
  lastActiveAt: Timestamp;
}

export interface UserXP {
  total: number;
  level: number;
  levelName: string;
  nextLevelThreshold: number;
  breakdown: {
    reporting: number;
    verification: number;
    engagement: number;
    quality: number;
  };
}

// ─── Notification Preferences ────────────────────────────────────────────────

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  reportUpdates: boolean;
  communityActivity: boolean;
  weeklyDigest: boolean;
  nearbyIssues: boolean;
  nearbyRadiusKm: number;
}

// ─── Core User Document ───────────────────────────────────────────────────────

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole;
  permissions: UserPermissions;
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;

  // Linked authority (if role === "authority")
  authorityId?: string;
  departmentCode?: string;

  // Location preference
  preferredCity?: string;
  preferredState?: string;

  // Gamification
  stats: UserStats;
  xp: UserXP;
  badges: UserBadge[];

  // Preferences
  notifications: NotificationPreferences;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSignInAt: Timestamp;
  profileCompletedAt?: Timestamp;
}

// ─── Session / Auth State ─────────────────────────────────────────────────────

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAnonymous: boolean;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// ─── Role-based permission map ────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  citizen: {
    canReport: true,
    canVerify: true,
    canAssign: false,
    canResolve: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canModerate: false,
  },
  moderator: {
    canReport: true,
    canVerify: true,
    canAssign: false,
    canResolve: false,
    canManageUsers: false,
    canViewAnalytics: true,
    canModerate: true,
  },
  authority: {
    canReport: false,
    canVerify: true,
    canAssign: true,
    canResolve: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canModerate: false,
  },
  admin: {
    canReport: true,
    canVerify: true,
    canAssign: true,
    canResolve: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canModerate: true,
  },
};
