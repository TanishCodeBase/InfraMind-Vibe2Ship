"use client";

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner(): JSX.Element | null {
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

  if (isOnline) return null;

  return (
    <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 flex items-center justify-center gap-2 animate-bounce z-50 sticky top-0">
      <WifiOff className="w-4 h-4" />
      <span>Offline mode active. You can still compile report details, but dispatch is paused until internet is restored.</span>
    </div>
  );
}
