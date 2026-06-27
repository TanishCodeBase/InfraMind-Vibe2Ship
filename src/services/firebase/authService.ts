import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { AuthUser } from "@/types/user";

// ─── Provider ────────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");
googleProvider.setCustomParameters({ prompt: "select_account" });

// ─── Normalise Firebase User → AuthUser ───────────────────────────────────────

function normaliseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
    isAnonymous: user.isAnonymous,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initiates Google Sign-In via popup.
 * Returns the normalised AuthUser on success.
 */
export async function signInWithGoogle(): Promise<AuthUser | null> {
  try {
    //console.log("STARTING GOOGLE LOGIN");

    const result = await signInWithPopup(auth, googleProvider);

    //console.log("LOGIN SUCCESS:", result.user.uid);

    return normaliseUser(result.user);

  } catch (error: any) {

    // These are NOT real errors → user interrupted popup / duplicate popup
    if (
      error.code === "auth/cancelled-popup-request" ||
      error.code === "auth/popup-closed-by-user"
    ) {
      console.warn("Popup cancelled:", error.code);
      return null;   // IMPORTANT
    }

    // Real errors
    throw error;
  }
}

/**
 * Signs the current user out.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — always call it on cleanup.
 */
export function onAuthStateChange(
  callback: (user: AuthUser | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? normaliseUser(user) : null);
  });
}

/**
 * Returns the currently signed-in user as AuthUser, or null.
 */
export function getCurrentUser(): AuthUser | null {
  const user = auth.currentUser;
  return user ? normaliseUser(user) : null;
}

/**
 * Returns a fresh Firebase ID token for the current user.
 * Use this to authenticate API route calls.
 */
export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
