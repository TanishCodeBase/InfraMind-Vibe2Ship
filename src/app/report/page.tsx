"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Sparkles } from "lucide-react";
import { doc, collection, updateDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { APP_NAME, COLLECTIONS } from "@/lib/constants";
import { db, auth } from "@/lib/firebase";
import { createIssue } from "@/services/firebase/firestoreService";
import { uploadIssueImage } from "@/services/firebase/storageService";
import type { CreateIssuePayload } from "@/types/issue";

import { Navbar } from "@/components/layout/Navbar";
import { ReportForm } from "@/components/report/ReportForm";
import { AgentPipelineSimulator } from "@/components/report/AgentPipelineSimulator";
import { type UploadedImage } from "@/components/report/ImageUploader";
import { AiPipelineVisualizer } from "@/components/report/AiPipelineVisualizer";

export default function ReportPage(): JSX.Element {
  const router = useRouter();
  const { authUser } = useAuth();

  // Asynchronous submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [simulationResult, setSimulationResult] = useState<any>(null);

  // Handle successful form submission (real end-to-end backend integration)
  const handleFormSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    images: UploadedImage[];
    location: {
      latitude: number;
      longitude: number;
      address: string;
      locality: string;
      city: string;
      stateName: string;
      pincode: string;
    };
  }) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSimulationResult(null);

    try {
      setSubmitStep(1); // Compressing images

      // Verify user auth
      const user = auth.currentUser;
      if (!user) {
        throw new Error("You must be logged in to report an issue. Please sign in and try again.");
      }

      setSubmitStep(2); // Uploading to Storage
      const uploadPromises = data.images.map((img) => uploadIssueImage(img.file, user.uid));
      const uploadResponses = await Promise.all(uploadPromises);
      const imageUrls = uploadResponses.map((res) => res.downloadURL);

      setSubmitStep(3); // Creating issue record
      const issueRef = doc(collection(db, COLLECTIONS.ISSUES));
      const issueId = issueRef.id;

      const payload: CreateIssuePayload = {
        title: data.title,
        description: data.description,
        imageURLs: imageUrls,
        isAnonymous: false,
        isPublic: true,
        source: "web",
        location: {
          geoPoint: { lat: data.location.latitude, lng: data.location.longitude },
          address: data.location.address,
          locality: data.location.locality,
          city: data.location.city,
          state: data.location.stateName,
          pincode: data.location.pincode,
        },
      };

      await createIssue(
        issueId,
        payload,
        user.uid,
        user.displayName || "Citizen",
        user.photoURL || undefined
      );

      setSubmitStep(4); // Retrieving ID Token
      const token = await user.getIdToken();

      // Dispatch payload to backend endpoint
      const formData = new FormData();
      formData.append("issueId", issueId);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("locationCity", data.location.city);
      formData.append("imageURLs", JSON.stringify(imageUrls));

      data.images.forEach((img) => {
        formData.append("images", img.file);
      });

      setSubmitStep(5); // Sending to classifier agent
      const response = await fetch("/api/agents/classify", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Classification failed: ${response.statusText}`);
      }

      const resJson = await response.json();
      const classification = resJson.data; // Type: AIClassification

      setSubmitStep(6); // Classification complete
      await updateDoc(doc(db, COLLECTIONS.ISSUES, issueId), {
        category: classification.category,
        priority: classification.suggestedPriority,
        tags: classification.tags,
        status: "under_review",
        aiClassification: {
          category: classification.category,
          confidence: classification.confidence,
          suggestedPriority: classification.suggestedPriority,
          tags: classification.tags,
          reasoning: classification.reasoning,
          processedAt: serverTimestamp(),
          modelVersion: classification.modelVersion || "gemini-2.5-flash",
        },
        updatedAt: serverTimestamp(),
      });

      setSimulationResult({
        category: classification.category,
        confidence: classification.confidence,
        priority: classification.suggestedPriority,
        score: Math.round(classification.confidence * 100),
        department: classification.category === "pothole" || classification.category === "damaged_road"
          ? "PWD / Municipal Corporation"
          : classification.category === "water_leak"
          ? "Jal Nigam (Water Supply Board)"
          : classification.category === "sewage"
          ? "Sewerage Board"
          : classification.category === "broken_streetlight"
          ? "Electricity Board"
          : "Sanitation Department",
        ticketId: issueId,
        reasoning: classification.reasoning,
        tags: classification.tags,
      });
    } catch (err: any) {
      console.error("[ReportSubmissionError]", err);
      setErrorMessage(err.message || "An unexpected error occurred during dispatch. Please try again.");
      setSubmitStep(-1);
    }
  };

  const handleReset = () => {
    setIsSubmitting(false);
    setSubmitStep(0);
    setErrorMessage("");
    setSimulationResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col noise relative overflow-x-hidden pt-16">
      {/* Background Lighting Effects */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl relative z-10">
        <div className="fixed bottom-6 right-6 z-35 md:hidden">
          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              const titleInput = document.getElementById("issue-title");
              if (titleInput) titleInput.focus();
            }}
            variant="gradient"
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center animate-bounce"
            title="Return to top"
          >
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </Button>
        </div>

        <div className="mb-8 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 font-mono uppercase tracking-widest text-[10px] mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Live Reporting Console
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2 leading-none">
            Report Civic <span className="text-gradient">Infrastructure</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Capture, geolocate, and describe urban issues. Our multi-agent neural model handles classification, scoring, and dispatch automatically.
          </p>
        </div>

        <ReportForm onSubmit={handleFormSubmit} theme="dark" isSubmitting={isSubmitting} />

        <AiPipelineVisualizer />
      </main>

      <AgentPipelineSimulator
        isSubmitting={isSubmitting}
        submitStep={submitStep}
        errorMessage={errorMessage}
        simulationResult={simulationResult}
        onReset={handleReset}
        onViewFeed={() => router.push("/feed")}
      />

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="container mx-auto px-4">
          <p>© 2026 {APP_NAME}. Hackathon Live Pipeline. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
