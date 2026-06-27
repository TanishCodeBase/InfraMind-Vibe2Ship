"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChange, signInWithGoogle, signOut } from "@/services/firebase/authService";
import { upsertUserDocument, getUserById } from "@/services/firebase/firestoreService";
import type { AuthUser, AuthStatus, AppUser } from "@/types/user";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Firebase Auth user (minimal shape) */
  authUser: AuthUser | null;
  /** Full Firestore user document */
  appUser: AppUser | null;
  /** Current auth loading / authenticated / unauthenticated status */
  status: AuthStatus;
  /** True while either auth state or user document is loading */
  isLoading: boolean;
  /** True during initial Firebase session lookup */
  isInitializing: boolean;
  /** True during Google Sign-In popup execution */
  isSigningIn: boolean;
  /** True when user is fully authenticated and profile loaded */
  isAuthenticated: boolean;
  /** Trigger Google Sign-In popup */
  signIn: () => Promise<void>;
  /** Sign out and clear state */
  logout: () => Promise<void>;
  /** Manually refresh the Firestore user document */
  refreshUser: () => Promise<void>;
}

// ─── Context creation ─────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  // Derive helpers
  const isLoading = isInitializing;
  const status: AuthStatus = isInitializing
    ? "loading"
    : authUser !== null
      ? "authenticated"
      : "unauthenticated";
  const isAuthenticated = !isInitializing && authUser !== null;

  // Load the full Firestore document after auth state changes
  const loadAppUser = useCallback(async (user: AuthUser): Promise<void> => {
    //console.log("LOADING FIRESTORE USER:", user.uid);

    try {
      const profile = await upsertUserDocument(user.uid, {
        email: user.email ?? "",
        displayName: user.displayName ?? "Anonymous",
        photoURL: user.photoURL,
        phoneNumber: null,
      });
      setAppUser(profile);
    } catch (error) {
      console.error("[AuthProvider] Failed to load user document:", error);
      setAppUser(null);
    }
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      try {
        if (user) {
          setAuthUser(user);
          await loadAppUser(user);
        } else {
          setAuthUser(null);
          setAppUser(null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsInitializing(false);
      }
    });

    return () => unsubscribe();
  }, [loadAppUser]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const signIn = useCallback(async (): Promise<void> => {
    setIsSigningIn(true);

    try {
      await signInWithGoogle();

      // DO NOTHING HERE
      // onAuthStateChanged will handle everything

    } catch (error) {
      console.error("[AuthProvider] Sign-in failed:", error);
      throw error;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await signOut();
    } finally {
      setAuthUser(null);
      setAppUser(null);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!authUser) return;
    try {
      const profile = await getUserById(authUser.uid);
      setAppUser(profile);
    } catch (error) {
      console.error("[AuthProvider] Failed to refresh user:", error);
    }
  }, [authUser]);

  // ─── Context value ───────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    authUser,
    appUser,
    status,
    isLoading,
    isInitializing,
    isSigningIn,
    isAuthenticated,
    signIn,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("[useAuth] must be used inside <AuthProvider>. Wrap your app with AuthProvider.");
  }
  return context;
}
