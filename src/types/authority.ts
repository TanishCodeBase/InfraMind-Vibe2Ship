import type { Timestamp } from "firebase/firestore";

// ─── Department ───────────────────────────────────────────────────────────────

export type DepartmentCode =
  | "PWD"       // Public Works Department
  | "WATER"     // Water Supply Department
  | "ELEC"      // Electrical / Streetlights
  | "SWM"       // Solid Waste Management
  | "HEALTH"    // Health & Sanitation
  | "TRAFFIC"   // Traffic Management
  | "PARKS"     // Parks & Recreation
  | "DRAINAGE"  // Drainage & Sewage
  | "GENERAL";  // General Administration

export type AuthorityTier = "municipal" | "district" | "state";

export type AuthorityStatus = "active" | "inactive" | "suspended";

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface AuthorityContact {
  name: string;
  email: string;
  phone: string;
  designation: string;
}

// ─── SLA Policy ──────────────────────────────────────────────────────────────

export interface SLAPolicy {
  criticalHours: number;
  highHours: number;
  mediumHours: number;
  lowHours: number;
  escalationAfterHours: number;
}

// ─── Core Authority Document ─────────────────────────────────────────────────

export interface Authority {
  id: string;
  name: string;
  shortName: string;
  departmentCode: DepartmentCode;
  tier: AuthorityTier;
  status: AuthorityStatus;

  // Jurisdiction
  city: string;
  state: string;
  wards: string[];
  zones: string[];
  pinCodes: string[];

  // Contact
  primaryContact: AuthorityContact;
  emergencyContact?: AuthorityContact;
  publicEmail: string;
  publicPhone: string;
  website?: string;

  // Issue categories this authority handles
  handlesCategories: string[];

  // SLA
  slaPolicy: SLAPolicy;

  // Performance
  metrics: {
    totalAssigned: number;
    totalResolved: number;
    avgResolutionHours: number;
    slaComplianceRate: number;
    citizenSatisfactionScore: number;
  };

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Category → Department Routing Map ───────────────────────────────────────

export const CATEGORY_DEPARTMENT_MAP: Record<string, DepartmentCode> = {
  pothole: "PWD",
  damaged_road: "PWD",
  damaged_footpath: "PWD",
  fallen_tree: "PWD",
  water_leak: "WATER",
  broken_streetlight: "ELEC",
  garbage_overflow: "SWM",
  illegal_dumping: "SWM",
  sewage: "DRAINAGE",
  other: "GENERAL",
};
