"use client";

import React, { useState, useEffect } from "react";
import { FileText, Send, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ImageUploader, type UploadedImage } from "./ImageUploader";
import { VoiceRecorder } from "./VoiceRecorder";
import { LocationPicker } from "./LocationPicker";
import { AIReadinessIndicator } from "./AIReadinessIndicator";

const CATEGORIES = [
  { value: "pothole", label: "Pothole", icon: "⚠️", color: "text-amber-500", desc: "Hazardous road holes or craters" },
  { value: "water_leak", label: "Water Leak", icon: "💧", color: "text-blue-500", desc: "Burst pipes or leaking mains" },
  { value: "broken_streetlight", label: "Broken Streetlight", icon: "💡", color: "text-yellow-500", desc: "Non-functional public streetlights" },
  { value: "garbage_overflow", label: "Garbage Overflow", icon: "🗑️", color: "text-green-500", desc: "Overflowing municipal waste bins" },
  { value: "damaged_road", label: "Damaged Road", icon: "🛣️", color: "text-orange-500", desc: "Cracked tarmac or structural road decay" },
  { value: "sewage", label: "Sewage Overflow", icon: "🚰", color: "text-purple-500", desc: "Open drains or overflowing sewage lines" },
  { value: "fallen_tree", label: "Fallen Tree", icon: "🌳", color: "text-emerald-500", desc: "Debris blocking walkways or roads" },
  { value: "illegal_dumping", label: "Illegal Dumping", icon: "🚫", color: "text-red-500", desc: "Unauthorised dumping of industrial/commercial waste" },
  { value: "damaged_footpath", label: "Damaged Footpath", icon: "🚶", color: "text-pink-500", desc: "Broken tiles or paving stones on pavements" },
  { value: "other", label: "Other Civic Issue", icon: "📋", color: "text-gray-500", desc: "Other public infrastructure concerns" },
];

interface ReportFormProps {
  onSubmit: (data: {
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
  }) => void;
  theme: "light" | "dark";
  isSubmitting: boolean;
}

export function ReportForm({ onSubmit, theme, isSubmitting }: ReportFormProps): JSX.Element {
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Location states
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleLocationChange = (fields: {
    latitude: number;
    longitude: number;
    address: string;
    locality: string;
    city: string;
    stateName: string;
    pincode: string;
  }) => {
    setLatitude(fields.latitude);
    setLongitude(fields.longitude);
    setAddress(fields.address);
    setLocality(fields.locality);
    setCity(fields.city);
    setStateName(fields.stateName);
    setPincode(fields.pincode);
  };

  const handleTranscript = (text: string) => {
    setDescription(prev => prev ? `${prev} ${text}` : text);
  };

  const isAiReady = title.trim().length >= 4 && description.trim().length >= 10 && latitude !== null && images.length >= 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAiReady || isSubmitting || !isOnline || latitude === null || longitude === null) return;

    onSubmit({
      title,
      description,
      category,
      images,
      location: {
        latitude,
        longitude,
        address,
        locality,
        city,
        stateName,
        pincode,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="bg-slate-900/60 border-slate-800/80 shadow-xl glass text-slate-100 overflow-hidden relative noise">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

        <CardHeader className="border-b border-slate-800/60 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Issue Report Details
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">All fields processed dynamically through Gemini Vision models.</CardDescription>
            </div>

            <AIReadinessIndicator isAiReady={isAiReady} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <ImageUploader images={images} onChange={setImages} />

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="issue-title" className="text-sm font-semibold text-slate-200">
                Step 2: Issue Title
              </label>
              <input
                type="text"
                id="issue-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a brief summary (e.g., Large pothole near circle)"
                className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg px-4 py-2.5 text-slate-100 text-sm focus:border-blue-500 transition-colors outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="issue-description" className="text-sm font-semibold text-slate-200">
                  Step 3: Issue Description
                </label>
                <VoiceRecorder onTranscript={handleTranscript} />
              </div>

              <div className="relative">
                <textarea
                  id="issue-description"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail. If you dictated, the text will append here..."
                  className="w-full bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 text-slate-100 text-sm focus:border-blue-500 transition-colors outline-none resize-none"
                />
                <div className="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-semibold font-mono">
                  {description.length} chars
                </div>
              </div>
            </div>
          </div>

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            address={address}
            locality={locality}
            city={city}
            stateName={stateName}
            pincode={pincode}
            onLocationChange={handleLocationChange}
            theme={theme}
          />
        </CardContent>

        <CardFooter className="bg-slate-950/20 border-t border-slate-800/60 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Submit to simulate local image scaling and the multi-agent AI verification routing pipeline.</span>
          </div>

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            disabled={!isAiReady || isSubmitting || !isOnline}
            className={cn(
              "w-full sm:w-auto px-8 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300",
              (!isAiReady || !isOnline) && "opacity-40 cursor-not-allowed hover:shadow-none"
            )}
          >
            <Send className="w-4 h-4 text-white" />
            <span>Submit Report to AI Console</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
