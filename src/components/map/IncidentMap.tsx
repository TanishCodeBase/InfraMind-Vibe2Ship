"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Brain,
  Building,
  Calendar,
  Info,
  AlertCircle,
  Trash2,
  Lightbulb,
  Droplet,
  Wrench,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { loadGoogleMaps } from "@/services/maps/locationService";
import type { Issue } from "@/types/issue";
import { cn } from "@/lib/utils";

interface IncidentMapProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  setSelectedIssue: (issue: Issue | null) => void;
  enableHeatmap: boolean;
}

const getStableIndex = (id: string, count: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % count;
};

const getFallbackImage = (category: string, id: string) => {
  const hashVal = getStableIndex(id, 12);
  switch (category) {
    case "pothole":
    case "damaged_road":
    case "damaged_footpath": {
      const idx = (hashVal % 3) + 1;
      return `/assets/issues/pothole${idx}.png`;
    }
    case "garbage_overflow":
    case "illegal_dumping": {
      const idx = (hashVal % 3) + 1;
      return `/assets/issues/garbage${idx}.png`;
    }
    case "broken_streetlight": {
      const idx = (hashVal % 2) + 1;
      return `/assets/issues/broken_streetlight${idx}.png`;
    }
    case "sewage": {
      const idx = (hashVal % 3) + 1;
      return `/assets/issues/sewage${idx}.png`;
    }
    case "water_leak": {
      const idx = (hashVal % 2) + 1;
      return `/assets/issues/water_leak${idx}.png`;
    }
    default:
      return `/assets/issues/pothole1.png`;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "pothole":
    case "damaged_road":
    case "damaged_footpath":
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    case "garbage_overflow":
    case "illegal_dumping":
      return <Trash2 className="w-4 h-4 text-amber-400" />;
    case "broken_streetlight":
      return <Lightbulb className="w-4 h-4 text-yellow-400" />;
    case "sewage":
      return <Droplet className="w-4 h-4 text-purple-400" />;
    case "water_leak":
      return <Wrench className="w-4 h-4 text-blue-400" />;
    default:
      return <HelpCircle className="w-4 h-4 text-slate-400" />;
  }
};

export function IncidentMap({
  issues,
  selectedIssue,
  setSelectedIssue,
  enableHeatmap,
}: IncidentMapProps): JSX.Element {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapError, setMapError] = useState("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  const formatCategory = (cat: string) => {
    return cat.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const getSvgCoords = useCallback((lat: number, lng: number) => {
    if (issues.length === 0) return { x: 400, y: 250 };
    const lats = issues.map((i) => i.location.geoPoint.lat);
    const lngs = issues.map((i) => i.location.geoPoint.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 0.1;
    const lngRange = maxLng - minLng || 0.1;
    const x = 100 + ((lng - minLng) / lngRange) * 600;
    const y = 400 - ((lat - minLat) / latRange) * 300;
    return { x, y };
  }, [issues]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "#ef4444";
      case "high": return "#f59e0b";
      case "medium": return "#3b82f6";
      case "low": default: return "#10b981";
    }
  };

  const initMap = useCallback(async () => {
    if (mapInstanceRef.current) return;
    try {
      const maps = await loadGoogleMaps();
      setGoogleMapsLoaded(true);
      if (!mapContainerRef.current) return;

      const centerPos = {
        lat: 12.9716,
        lng: 77.5946,
      };
      const mapOptions: google.maps.MapOptions = {
        center: centerPos,
        zoom: 11,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
          { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#334155" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e1b4b" }] },
        ],
      };

      const map = new maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;
    } catch (err: any) {
      setGoogleMapsLoaded(false);
      setMapError("Google Maps API key missing/invalid. Interactive City Grid Simulator active.");
    }
  }, [issues]);

  useEffect(() => {
    if (!googleMapsLoaded || !mapInstanceRef.current) return;
    //console.log("MAP RECEIVED ISSUES:", issues.length, issues);
    const maps = google.maps;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    if (enableHeatmap) {
      issues.forEach((issue) => {
        const circle = new maps.Circle({
          strokeColor: getPriorityColor(issue.priority),
          strokeOpacity: 0.25,
          strokeWeight: 1,
          fillColor: getPriorityColor(issue.priority),
          fillOpacity: 0.15,
          map: mapInstanceRef.current,
          center: { lat: issue.location.geoPoint.lat, lng: issue.location.geoPoint.lng },
          radius: 1200,
        });
        circlesRef.current.push(circle);
      });
    }

    issues.forEach((issue) => {
      const pinColor = getPriorityColor(issue.priority);
      const marker = new maps.Marker({
        position: { lat: issue.location.geoPoint.lat, lng: issue.location.geoPoint.lng },
        map: mapInstanceRef.current,
        title: issue.title,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: selectedIssue?.id === issue.id ? 10 : 7,
          fillColor: pinColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: selectedIssue?.id === issue.id ? 2.5 : 1.5,
        },
      });

      marker.addListener("click", () => {
        setSelectedIssue(issue);
        mapInstanceRef.current?.panTo({ lat: issue.location.geoPoint.lat, lng: issue.location.geoPoint.lng });
      });
      markersRef.current.push(marker);
    });
    //console.log("MARKERS CREATED:", markersRef.current.length);
  }, [issues, googleMapsLoaded, selectedIssue, enableHeatmap, setSelectedIssue]);

  useEffect(() => {
    if (selectedIssue && googleMapsLoaded && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: selectedIssue.location.geoPoint.lat, lng: selectedIssue.location.geoPoint.lng });
      mapInstanceRef.current.setZoom(14);
    }
  }, [selectedIssue, googleMapsLoaded]);

  useEffect(() => { initMap(); }, [initMap]);

  const mainImage = selectedIssue?.imageURLs && selectedIssue.imageURLs.length > 0
    ? selectedIssue.imageURLs[0]
    : selectedIssue ? getFallbackImage(selectedIssue.category, selectedIssue.id) : null;

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 shadow-2xl">
      <div ref={mapContainerRef} className={cn("w-full h-full relative transition-opacity duration-500", !googleMapsLoaded && "opacity-0 absolute -z-10")} />

      {!googleMapsLoaded && (
        <div className="w-full h-full flex flex-col relative select-none bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
          <svg className="w-full h-full min-h-[520px] z-10" viewBox="0 0 800 500">
            <line x1="50" y1="100" x2="750" y2="100" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="50" y1="250" x2="750" y2="250" stroke="#192434" strokeWidth="4" />
            <line x1="50" y1="400" x2="750" y2="400" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="150" y1="50" x2="150" y2="450" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="400" y1="50" x2="400" y2="450" stroke="#192434" strokeWidth="4" />
            <line x1="650" y1="50" x2="650" y2="450" stroke="#1e293b" strokeWidth="2" strokeDasharray="5,5" />
            {enableHeatmap && issues.map((issue) => {
              const { x, y } = getSvgCoords(issue.location.geoPoint.lat, issue.location.geoPoint.lng);
              return <circle key={`h-${issue.id}`} cx={x} cy={y} r="45" fill={getPriorityColor(issue.priority)} fillOpacity="0.12" stroke={getPriorityColor(issue.priority)} strokeWidth="1" strokeOpacity="0.2" />;
            })}
            {issues.map((issue) => {
              const { x, y } = getSvgCoords(issue.location.geoPoint.lat, issue.location.geoPoint.lng);
              const isSelected = selectedIssue?.id === issue.id;
              return (
                <g key={`n-${issue.id}`} className="cursor-pointer" onClick={() => setSelectedIssue(issue)}>
                  <circle cx={x} cy={y} r={isSelected ? "16" : "10"} fill="none" stroke={getPriorityColor(issue.priority)} strokeWidth="2" className="animate-ping" opacity={isSelected ? "0.8" : "0.4"} />
                  <circle cx={x} cy={y} r={isSelected ? "8" : "5"} fill={getPriorityColor(issue.priority)} stroke="#ffffff" strokeWidth={isSelected ? "2" : "1"} />
                </g>
              );
            })}
          </svg>
          <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-2 rounded-lg max-w-[280px] shadow-lg flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-[10px] text-slate-400 leading-normal">
              <span className="font-bold text-slate-200 block">MAP SIMULATION MODE</span>
              Interactive City Grid enabled. Clicking coordinates highlights dispatch details.
            </div>
          </div>
        </div>
      )}

      {selectedIssue && mainImage && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-30 animate-fade-in">
          <Card className="glass border-cyan-500/25 bg-slate-950/95 text-slate-100 shadow-2xl relative overflow-hidden flex flex-col">
            {/* Top Image Banner */}
            <div className="h-28 w-full overflow-hidden relative border-b border-slate-850 shrink-0">
              <img src={mainImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <Badge variant={issuePriorityBadge(selectedIssue.priority)}>
                  {selectedIssue.priority.toUpperCase()}
                </Badge>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="absolute top-3 right-3 text-xs bg-slate-950/80 text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-800 font-mono">
                ✕ CLOSE
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Title & Location */}
              <div>
                <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                  {getCategoryIcon(selectedIssue.category)}
                  {selectedIssue.title}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{selectedIssue.location.address}</span>
                </div>
              </div>

              {/* Intelligence Stats Panel */}
              <div className="bg-blue-950/20 border border-blue-500/10 rounded-lg p-2.5 space-y-2 text-[11px]">
                <div className="flex items-center gap-1 text-cyan-400 text-[9px] font-mono tracking-wider uppercase font-bold border-b border-slate-800/60 pb-1 mb-1">
                  <Brain className="w-3.5 h-3.5 animate-pulse" />
                  <span>AI Incident Intelligence</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-medium">
                  <div>
                    <span className="text-[9px] text-slate-500 block">AI CATEGORY</span>
                    <span className="text-slate-200 capitalize font-bold">{formatCategory(selectedIssue.aiClassification?.category || selectedIssue.category)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">AI CONFIDENCE</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedIssue.aiClassification ? `${Math.round(selectedIssue.aiClassification.confidence * 100)}%` : "95%"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">ASSIGNED DEPT</span>
                    <span className="text-blue-300 font-bold truncate block">
                      {selectedIssue.routing?.departmentCode || (selectedIssue.category === "pothole" ? "PWD" : "BBMP")}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">SLA STATUS</span>
                    <span className="text-amber-400 font-bold capitalize truncate block">{selectedIssue.status.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function issuePriorityBadge(priority: string) {
  switch (priority) {
    case "critical": return "critical";
    case "high": return "warning";
    case "medium": return "info";
    case "low": default: return "success";
  }
}
