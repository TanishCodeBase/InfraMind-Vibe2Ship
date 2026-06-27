"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/providers/AuthProvider";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Google Icon SVG ──────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }): JSX.Element {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Login Form Content (using useSearchParams) ──────────────────────────────

function LoginContent(): JSX.Element {
  const { signIn, isAuthenticated, isInitializing, isSigningIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/feed";

  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isInitializing, redirectTo, router]);

  const handleSignIn = async () => {
    setError(null);
    setSigningIn(true);
    try {
      await signIn();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again.";
      // User cancelled the popup — don't show an error
      if (!message.toLowerCase().includes("cancelled") && !message.toLowerCase().includes("popup")) {
        setError(message);
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <Card className="glass border-border/50 shadow-2xl shadow-black/5">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg">Sign in to continue</CardTitle>
        <CardDescription>
          Use your Google account to get started instantly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <Button
          id="login-google-btn"
          variant="outline"
          size="lg"
          className="w-full font-semibold relative overflow-hidden group hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950 transition-all duration-200"
          onClick={() => void handleSignIn()}
          isLoading={signingIn || isSigningIn}
          loadingText="Signing in…"
          disabled={isInitializing || signingIn || isSigningIn}
        >
          <GoogleIcon className="w-5 h-5 mr-1" />
          Continue with Google
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground shrink-0">secure sign-in</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Benefits */}
        <ul className="space-y-2">
          {[
            "Report issues with AI-powered classification",
            "Track resolutions in real time",
            "Earn XP and badges for civic contributions",
          ].map((benefit) => (
            <li key={benefit} className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div
                className="flex-shrink-0 w-4 h-4 rounded-full bg-brand-500/15 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg viewBox="0 0 8 8" className="w-2.5 h-2.5 text-brand-500" fill="currentColor">
                  <path d="M2.5 5.5L1 4l-.5.5L2.5 6.5l4-4L6 2z" />
                </svg>
              </div>
              {benefit}
            </li>
          ))}
        </ul>

        {/* Terms */}
        <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Login Page Wrapper ──────────────────────────────────────────────────────

export default function LoginPage(): JSX.Element {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background p-4"
      aria-labelledby="login-heading"
    >
      {/* Background glows */}
      <div
        className="absolute top-0 inset-x-0 h-[50vh] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(217 91% 50% / 0.15), transparent)",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, hsl(262 80% 58% / 0.07), transparent 70%)",
        }}
        aria-hidden="true"
      />
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(217 80% 50% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(217 80% 50% / 1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group" aria-label="InfraMind home">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 shadow-xl shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow duration-300 animate-float">
              <Layers className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
          </Link>
          <h1
            id="login-heading"
            className="mt-4 text-2xl font-extrabold tracking-tight text-foreground"
          >
            Welcome to{" "}
            <span className="text-gradient">{APP_NAME}</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to report civic issues and track resolutions
          </p>
        </div>

        {/* Card */}
        <Suspense
          fallback={
            <Card className="glass border-border/50 shadow-2xl shadow-black/5 p-6 flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-8 h-8 animate-spin border-4 border-purple-500 border-t-transparent rounded-full mb-3" />
              <p className="text-sm font-mono">Initializing portal auth...</p>
            </Card>
          }
        >
          <LoginContent />
        </Suspense>

        {/* Back link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-2">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
