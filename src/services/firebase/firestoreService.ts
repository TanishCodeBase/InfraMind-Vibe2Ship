import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type QueryConstraint,
  type DocumentData,
  type WhereFilterOp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { COLLECTIONS, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { AppUser } from "@/types/user";
import type { Issue, CreateIssuePayload, IssueFilters } from "@/types/issue";
import type { Authority } from "@/types/authority";
import { ROLE_PERMISSIONS } from "@/types/user";

// ─── Generic helpers ──────────────────────────────────────────────────────────

function docToData<T>(
  snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): T | null {
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

// ─── User operations ──────────────────────────────────────────────────────────

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return docToData<AppUser>(snap);
}

export async function createUserDocument(
  uid: string,
  data: Pick<AppUser, "email" | "displayName" | "photoURL" | "phoneNumber">
): Promise<AppUser> {
  const now = serverTimestamp();

  // We write FieldValue sentinels to Firestore; the returned shape
  // will have real Timestamps after the first read. Cast accordingly.
  const newUserDoc = {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    phoneNumber: data.phoneNumber,
    role: "citizen" as const,
    permissions: ROLE_PERMISSIONS["citizen"],
    isVerified: false,
    isActive: true,
    isBanned: false,
    stats: {
      reportsSubmitted: 0,
      reportsVerified: 0,
      reportsResolved: 0,
      upvotesGiven: 0,
      upvotesReceived: 0,
      commentsPosted: 0,
      streakDays: 0,
      lastActiveAt: now,
    },
    xp: {
      total: 0,
      level: 1,
      levelName: "Observer",
      nextLevelThreshold: 200,
      breakdown: { reporting: 0, verification: 0, engagement: 0, quality: 0 },
    },
    badges: [] as AppUser["badges"],
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      reportUpdates: true,
      communityActivity: true,
      weeklyDigest: true,
      nearbyIssues: false,
      nearbyRadiusKm: 5,
    },
    createdAt: now,
    updatedAt: now,
    lastSignInAt: now,
  };

  await setDoc(doc(db, COLLECTIONS.USERS, uid), newUserDoc);
  return newUserDoc as unknown as AppUser;
}

export async function updateUserLastSignIn(uid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
    lastSignInAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function upsertUserDocument(
  uid: string,
  data: Pick<AppUser, "email" | "displayName" | "photoURL" | "phoneNumber">
): Promise<AppUser> {
  const existing = await getUserById(uid);
  if (existing) {
    await updateUserLastSignIn(uid);
    return existing;
  }
  return createUserDocument(uid, data);
}

// ─── Issue operations ─────────────────────────────────────────────────────────

export async function getIssueById(issueId: string): Promise<Issue | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.ISSUES, issueId));
  return docToData<Issue>(snap);
}

export async function createIssue(
  issueId: string,
  payload: CreateIssuePayload,
  reportedBy: string,
  reporterName: string,
  reporterPhotoURL?: string
): Promise<void> {
  // Firestore timestamp for top-level fields
  const serverNow = serverTimestamp();

  // Local JS date for array objects (Firestore does NOT allow serverTimestamp inside arrays)
  const localNow = new Date();

  await setDoc(doc(db, COLLECTIONS.ISSUES, issueId), {
    id: issueId,
    title: payload.title,
    description: payload.description,
    category: "other", // AI will overwrite this
    status: "pending",
    priority: "medium", // AI will overwrite this
    verificationStatus: "unverified",
    reportedBy,
    reporterName,
    reporterPhotoURL: reporterPhotoURL ?? null,
    isAnonymous: payload.isAnonymous,
    imageURLs: payload.imageURLs,
    videoURL: payload.videoURL ?? null,
    location: payload.location,
    aiClassification: null,
    aiPriorityScore: null,
    aiConsensus: null,
    routing: null,

    engagement: {
      upvoteCount: 0,
      downvoteCount: 0,
      commentCount: 0,
      viewCount: 0,
      shareCount: 0,
      upvotedBy: [],
    },

    // IMPORTANT FIX
    timeline: [
      {
        id: `evt_${Date.now()}`,
        type: "created",
        description: "Issue reported by citizen",
        actor: "citizen",
        actorId: reportedBy,
        timestamp: localNow,   // <-- changed from serverTimestamp()
      },
    ],

    // keep Firestore server timestamps here
    createdAt: serverNow,
    updatedAt: serverNow,

    resolvedAt: null,
    tags: [],
    isPublic: payload.isPublic,
    source: payload.source,
  });
}

export async function updateIssueStatus(
  issueId: string,
  updates: Partial<Pick<Issue, "status" | "priority" | "category" | "tags" | "routing">>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.ISSUES, issueId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getIssues(
  filters: IssueFilters = {},
  pageSize: number = DEFAULT_PAGE_SIZE,
  cursor?: DocumentSnapshot
): Promise<{ issues: Issue[]; lastDoc: QueryDocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [];

  if (filters.category)
    constraints.push(where("category", "==", filters.category));
  if (filters.status)
    constraints.push(where("status", "==", filters.status));
  if (filters.priority)
    constraints.push(where("priority", "==", filters.priority));
  if (filters.city)
    constraints.push(where("location.city", "==", filters.city));
  if (filters.reportedBy)
    constraints.push(where("reportedBy", "==", filters.reportedBy));

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(pageSize));

  if (cursor) constraints.push(startAfter(cursor));

  const q = query(collection(db, COLLECTIONS.ISSUES), ...constraints);
  const snapshot = await getDocs(q);

  const issues = snapshot.docs.map((d) => docToData<Issue>(d)!);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;

  return { issues, lastDoc };
}

export async function incrementIssueUpvote(
  issueId: string,
  userId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.ISSUES, issueId), {
    "engagement.upvoteCount": increment(1),
    "engagement.upvotedBy": userId, // arrayUnion handled separately
    updatedAt: serverTimestamp(),
  });
}

// ─── Authority operations ─────────────────────────────────────────────────────

export async function getAuthoritiesByCity(city: string): Promise<Authority[]> {
  const q = query(
    collection(db, COLLECTIONS.AUTHORITIES),
    where("city", "==", city),
    where("status", "==", "active")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToData<Authority>(d)!);
}

export async function getAuthorityById(id: string): Promise<Authority | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.AUTHORITIES, id));
  return docToData<Authority>(snap);
}
