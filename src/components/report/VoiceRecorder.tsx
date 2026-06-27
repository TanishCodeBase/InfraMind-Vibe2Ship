"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingAvailable, setRecordingAvailable] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecordingAvailable(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-IN"; // English (India) works great for Indian accents

      rec.onstart = () => {
        setIsRecording(true);
        setSpeechError("");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setSpeechError(`Voice capture error: ${event.error}. Please type manually.`);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    } else {
      setRecordingAvailable(false);
    }
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!recordingAvailable || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!recordingAvailable) return <div />;

  return (
    <div className="flex flex-col gap-1 items-end">
      <button
        type="button"
        onClick={toggleRecording}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border",
          isRecording
            ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse shadow-md shadow-red-500/10"
            : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
        )}
      >
        {isRecording ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5" />}
        <span>{isRecording ? "Listening..." : "Dictate (Voice)"}</span>
      </button>

      {speechError && (
        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {speechError}
        </p>
      )}
    </div>
  );
}
