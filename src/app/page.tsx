"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Zap,
  Shield,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Star,
  Bot,
  Globe,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Bot,
    title: "AI-Powered Classification",
    description:
      "Gemini AI automatically classifies, prioritises, and routes your report to the right department in seconds.",
    color: "text-brand-500",
    bg: "bg-brand-500/10",
  },
  {
    icon: MapPin,
    title: "Live Issue Map",
    description:
      "Explore a real-time heat map of civic issues across your city. Filter by category, priority, and status.",
    color: "text-civic-green",
    bg: "bg-civic-green/10",
  },
  {
    icon: Shield,
    title: "Duplicate Detection",
    description:
      "Our consensus AI prevents duplicate reports by clustering related issues and merging community voices.",
    color: "text-civic-purple",
    bg: "bg-civic-purple/10",
  },
  {
    icon: BarChart3,
    title: "Pattern Analytics",
    description:
      "AI detects hotspots, seasonal trends, and infrastructure patterns for proactive governance.",
    color: "text-civic-amber",
    bg: "bg-civic-amber/10",
  },
  {
    icon: Zap,
    title: "Instant Routing",
    description:
      "Reports are automatically dispatched to the correct municipal department with SLA tracking.",
    color: "text-civic-red",
    bg: "bg-civic-red/10",
  },
  {
    icon: Users,
    title: "Community Verification",
    description:
      "Citizens verify each other's reports through upvotes, increasing credibility and priority scores.",
    color: "text-civic-blue",
    bg: "bg-civic-blue/10",
  },
] as const;

const STATS = [
  { value: "10K+", label: "Issues Reported", icon: Globe },
  { value: "94%", label: "Resolution Rate", icon: CheckCircle2 },
  { value: "4.2h", label: "Avg. Response", icon: Zap },
  { value: "50+", label: "Cities Active", icon: TrendingUp },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "The pothole outside my apartment was fixed within 48 hours of reporting on InfraMind. Incredible!",
    name: "Priya Sharma",
    role: "Citizen, Bengaluru",
    rating: 5,
  },
  {
    quote:
      "As a ward officer, InfraMind's pattern analysis helped us prioritise drainage work before the monsoon.",
    name: "Rajesh Kumar",
    role: "Ward Officer, Mumbai",
    rating: 5,
  },
  {
    quote:
      "Finally an app that actually routes complaints to the right department automatically. Game changer.",
    name: "Anika Patel",
    role: "Citizen, Hyderabad",
    rating: 5,
  },
] as const;

const AI_AGENTS = [
  { name: "Classifier", desc: "Category & tags", color: "bg-brand-500" },
  { name: "Priority", desc: "Urgency scoring", color: "bg-civic-red" },
  { name: "Consensus", desc: "Duplicate detection", color: "bg-civic-purple" },
  { name: "Router", desc: "Department assignment", color: "bg-civic-amber" },
  { name: "Pattern", desc: "Hotspot detection", color: "bg-civic-green" },
] as const;

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavBar(): JSX.Element {
  const { isAuthenticated, signIn, logout, authUser, isInitializing } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "glass border-b border-border/50 shadow-sm" : "bg-transparent"
      )}
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group" aria-label="InfraMind home">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow duration-300">
              <Layers className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-gradient">{APP_NAME}</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors duration-200">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors duration-200">
              How It Works
            </Link>
            <Link href="#testimonials" className="hover:text-foreground transition-colors duration-200">
              Stories
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {false ? (
              <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[120px]">
                  {authUser?.displayName?.split(" ")[0]}
                </span>
                <Button
                  id="nav-go-to-feed"
                  variant="gradient"
                  size="sm"
                  asChild
                >
                  <Link href="/feed">Go to Feed</Link>
                </Button>
                <Button
                  id="nav-logout"
                  variant="ghost"
                  size="sm"
                  onClick={() => void logout()}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                id="nav-sign-in"
                variant="gradient"
                size="sm"
                onClick={() => void signIn()}
              >
                Sign In with Google
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection(): JSX.Element {
  const { isAuthenticated, signIn, isSigningIn } = useAuth();
  const router = useRouter();

  const handleCTA = () => {
    if (isAuthenticated) {
      router.push("/report");
    } else {
      void signIn();
    }
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      aria-labelledby="hero-heading"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-background pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(217 80% 50% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(217 80% 50% / 1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-0 inset-x-0 h-[70vh] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 50% -10%, hsl(217 91% 50% / 0.18), transparent)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, hsl(262 80% 58% / 0.08), transparent 70%)",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Announcement badge */}
        <div className="animate-fade-in mb-8 inline-flex items-center gap-2 rounded-full border border-brand-200/50 dark:border-brand-800/50 bg-brand-50/80 dark:bg-brand-950/50 px-4 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
          </span>
          Powered by Google Gemini 2.5 Flash · Maps Platform · Firebase
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="animate-fade-in delay-100 mx-auto max-w-4xl text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6"
        >
          Fix Your City with{" "}
          <span className="text-gradient">AI-Powered</span>
          <br className="hidden sm:block" />
          Civic Reporting
        </h1>

        {/* Subheading */}
        <p className="animate-fade-in delay-200 mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
          Report potholes, water leaks, broken streetlights, and more. Our AI
          automatically classifies, prioritises, and routes every issue to the
          right authority — turning citizen voices into faster resolutions.
        </p>

        {/* CTA buttons */}
        <div className="animate-fade-in delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button
            id="hero-report-cta"
            variant="gradient"
            size="xl"
            onClick={handleCTA}
            isLoading={isSigningIn}
            loadingText="Signing in..."
            className="animate-pulse-glow w-full sm:w-auto"
          >
            <MapPin className="w-5 h-5" aria-hidden="true" />
            {isAuthenticated ? "Report an Issue" : "Get Started Free"}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Button>
          <Button
            id="hero-map-cta"
            variant="outline"
            size="xl"
            asChild
            className="w-full sm:w-auto"
          >
            <Link href="/map">
              <Globe className="w-5 h-5" aria-hidden="true" />
              Explore Live Map
            </Link>
          </Button>
        </div>

        {/* Stats strip */}
        <div className="animate-fade-in delay-400 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1 glass rounded-xl p-4"
            >
              <Icon className="w-5 h-5 text-brand-500 mb-1" aria-hidden="true" />
              <span className="text-2xl font-extrabold text-foreground">{value}</span>
              <span className="text-xs text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
        <div className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-muted-foreground" />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection(): JSX.Element {
  return (
    <section
      id="features"
      className="py-24 sm:py-32"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="info" className="mb-4">Platform Features</Badge>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4"
          >
            Everything cities need to{" "}
            <span className="text-gradient">work smarter</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-lg">
            InfraMind combines citizen reporting with AI intelligence to create
            a feedback loop that actually repairs infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, color, bg }, i) => (
            <Card
              key={title}
              className={cn(
                "group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default border-border/50",
                "animate-fade-in"
              )}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}
            >
              <CardHeader>
                <div
                  className={cn(
                    "inline-flex w-12 h-12 rounded-xl items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110",
                    bg
                  )}
                  aria-hidden="true"
                >
                  <Icon className={cn("w-6 h-6", color)} />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection(): JSX.Element {
  const steps = [
    {
      step: "01",
      title: "Citizen Reports",
      description:
        "Snap a photo, drop a pin on the map, and describe the issue. InfraMind accepts reports in seconds.",
      color: "from-brand-500 to-brand-600",
    },
    {
      step: "02",
      title: "AI Agents Process",
      description:
        "Five specialised Gemini AI agents classify the issue, score its priority, detect duplicates, and assign a department.",
      color: "from-purple-500 to-purple-600",
    },
    {
      step: "03",
      title: "Authority Acts",
      description:
        "The right municipal department receives an alert with full context, SLA countdown, and location map.",
      color: "from-civic-green to-emerald-600",
    },
    {
      step: "04",
      title: "Community Verifies",
      description:
        "Citizens verify resolution with before/after photos. XP and badges reward active reporters.",
      color: "from-civic-amber to-orange-500",
    },
  ] as const;

  return (
    <section
      id="how-it-works"
      className="py-24 sm:py-32 bg-muted/30 dark:bg-muted/10"
      aria-labelledby="hiw-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">How It Works</Badge>
          <h2
            id="hiw-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4"
          >
            From pothole to{" "}
            <span className="text-gradient">resolution</span>
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground text-lg">
            A fully automated pipeline that takes your report from submission to
            resolution — no manual intervention required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {/* Connector line */}
          <div
            className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-brand-500 via-purple-500 to-civic-amber"
            aria-hidden="true"
          />

          {steps.map(({ step, title, description, color }) => (
            <div key={step} className="relative flex flex-col items-center text-center group">
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br shadow-lg mb-5 text-white font-black text-xl transition-transform duration-300 group-hover:scale-110",
                  color
                )}
              >
                {step}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* AI Agents pipeline */}
        <div className="glass rounded-2xl p-8 max-w-3xl mx-auto">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            AI Agent Pipeline
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {AI_AGENTS.map(({ name, desc, color }, i) => (
              <React.Fragment key={name}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-4 py-2.5 text-white text-sm font-semibold shadow-md",
                      color
                    )}
                  >
                    <Bot className="w-4 h-4" aria-hidden="true" />
                    {name}
                  </div>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
                {i < AI_AGENTS.length - 1 && (
                  <div className="flex items-center self-start mt-3" aria-hidden="true">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection(): JSX.Element {
  return (
    <section
      id="testimonials"
      className="py-24 sm:py-32"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="warning" className="mb-4">Community Stories</Badge>
          <h2
            id="testimonials-heading"
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4"
          >
            Real people, real{" "}
            <span className="text-gradient">change</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map(({ quote, name, role, rating }) => (
            <Card key={name} className="glass border-border/50 hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-6">
                {/* Stars */}
                <div className="flex gap-0.5 mb-4" aria-label={`${rating} out of 5 stars`}>
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-civic-amber text-civic-amber"
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="text-foreground text-sm leading-relaxed mb-4">
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <div>
                  <p className="font-semibold text-sm text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection(): JSX.Element {
  const { isAuthenticated, signIn, isSigningIn } = useAuth();

  return (
    <section
      className="py-24 sm:py-32"
      aria-labelledby="cta-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-border/50">
          {/* Gradient background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "var(--brand-gradient)" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
            aria-hidden="true"
          />

          <div className="relative text-center px-8 py-20 sm:py-28">
            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4"
            >
              Be the change your city needs
            </h2>
            <p className="mx-auto max-w-xl text-white/80 text-lg mb-10">
              Join thousands of citizens already making their cities better with
              InfraMind. Your first report takes less than 60 seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Button
                  id="cta-report"
                  size="xl"
                  className="bg-white text-brand-600 hover:bg-white/90 font-bold shadow-xl w-full sm:w-auto"
                  asChild
                >
                  <Link href="/report">
                    <MapPin className="w-5 h-5" aria-hidden="true" />
                    Report an Issue Now
                  </Link>
                </Button>
              ) : (
                <Button
                  id="cta-signin"
                  size="xl"
                  className="bg-white text-brand-600 hover:bg-white/90 font-bold shadow-xl w-full sm:w-auto"
                  onClick={() => void signIn()}
                  isLoading={isSigningIn}
                  loadingText="Signing in…"
                >
                  <MapPin className="w-5 h-5" aria-hidden="true" />
                  Start Reporting Free
                </Button>
              )}
              <Button
                id="cta-explore"
                variant="outline"
                size="xl"
                className="bg-transparent border-white/40 text-white hover:bg-white/10 w-full sm:w-auto"
                asChild
              >
                <Link href="/feed">
                  Explore Live Feed
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer(): JSX.Element {
  return (
    <footer className="border-t border-border/50 bg-muted/20 dark:bg-muted/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 shadow-md">
              <Layers className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-gradient">{APP_NAME}</span>
            </span>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation" className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/feed" className="hover:text-foreground transition-colors">Feed</Link>
            <Link href="/map" className="hover:text-foreground transition-colors">Map</Link>
          </nav>

          {/* Copyright */}
          <div className="text-right flex flex-col items-center md:items-end gap-1 text-xs text-muted-foreground">
            <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Built on Google AI Ecosystem</span>
            <span className="font-mono text-[10px]">Gemini · Firebase · Maps Platform</span>
            <p className="text-[10px] mt-1">
              © {new Date().getFullYear()} InfraMind. Built for a smarter India.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage(): JSX.Element {
  return (
    <>
      <NavBar />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
