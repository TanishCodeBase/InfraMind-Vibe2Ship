"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Zap, Brain, CheckCircle2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { APP_NAME } from "@/lib/constants";

export default function AboutPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col noise relative overflow-x-hidden pt-16">
      {/* Background Lighting Effects */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl z-10 relative">
        {/* Back Link */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild className="text-slate-400 hover:text-white">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20 mb-2">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            About <span className="text-gradient">{APP_NAME}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A next-generation municipal AI command center and citizen-engagement platform powered by Gemini AI.
          </p>
        </div>

        {/* Vision & Concept */}
        <div className="grid gap-8 md:grid-cols-2 mb-16">
          <Card className="bg-slate-900/60 border-slate-800 shadow-xl glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                The Core Vision
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-4">
              <p>
                InfraMind bridges the gap between citizens and local authorities by leveraging cutting-edge Artificial Intelligence. Our mission is to make urban infrastructure management autonomous, transparent, and incredibly fast.
              </p>
              <p>
                By using Gemini Vision models, reports submitted by citizens are parsed, cataloged, and assigned to municipal teams instantly, skipping weeks of traditional bureaucratic routing.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-800 shadow-xl glass">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                Autonomous Dispatch
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300 space-y-4">
              <p>
                Our multi-agent AI verification routing pipeline handles classification, priority scoring, duplicate detection, and department assignment dynamically.
              </p>
              <p>
                Municipal dashboards allow city authorities to track active issues on a real-time geocoded incident map, view AI classification insights, and verify citizen upvotes before sending field crews.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features / Benefits */}
        <div className="space-y-6 mb-16">
          <h2 className="text-xl font-bold text-white mb-4">Key Innovation Highlights</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Decentralized Trust",
                desc: "Verified citizen reports authenticated via Firebase and upvoted by the local community."
              },
              {
                icon: Brain,
                title: "Gemini Vision AI",
                desc: "Multimodal image analysis detects issue type, severity, and provides immediate department dispatch."
              },
              {
                icon: CheckCircle2,
                title: "Live Operations Map",
                desc: "GIS tracking of city issues with interactive filters for authorities and citizens alike."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 border border-slate-900 rounded-lg p-5 space-y-2">
                <item.icon className="w-6 h-6 text-blue-400 mb-2" />
                <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-8 z-10 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
          <div className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Built on Google AI Ecosystem</div>
          <div className="font-mono text-[10px] text-slate-500">Gemini · Firebase · Maps Platform</div>
          <div>© {new Date().getFullYear()} {APP_NAME}. Built for a smarter India.</div>
        </div>
      </footer>
    </div>
  );
}
