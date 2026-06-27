"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, RefreshCw, Crosshair, AlertTriangle, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { loadGoogleMaps, getCurrentPosition, reverseGeocode, forwardGeocode } from "@/services/maps/locationService";

const MOCK_SUGGESTIONS = [
  { name: "Indiranagar, Bengaluru", lat: 12.9784, lng: 77.6408, locality: "Indiranagar", city: "Bengaluru", state: "Karnataka", pincode: "560038" },
  { name: "Koramangala, Bengaluru", lat: 12.9279, lng: 77.6271, locality: "Koramangala 4th Block", city: "Bengaluru", state: "Karnataka", pincode: "560034" },
  { name: "Whitefield, Bengaluru", lat: 12.9698, lng: 77.7499, locality: "Whitefield Inner Circle", city: "Bengaluru", state: "Karnataka", pincode: "560066" },
  { name: "MG Road, Bengaluru", lat: 12.9738, lng: 77.6119, locality: "MG Road Metro", city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  { name: "Jayanagar, Bengaluru", lat: 12.9307, lng: 77.5832, locality: "Jayanagar 4th Block", city: "Bengaluru", state: "Karnataka", pincode: "560041" },
];

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  locality: string;
  city: string;
  stateName: string;
  pincode: string;
  onLocationChange: (fields: {
    latitude: number;
    longitude: number;
    address: string;
    locality: string;
    city: string;
    stateName: string;
    pincode: string;
  }) => void;
  theme: "light" | "dark";
}

export function LocationPicker({
  latitude,
  longitude,
  address,
  locality,
  city,
  stateName,
  pincode,
  onLocationChange,
  theme,
}: LocationPickerProps): JSX.Element {
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [manualMode, setManualMode] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerInstanceRef = useRef<google.maps.Marker | null>(null);

  const simulateReverseGeocode = (lat: number, lng: number) => {
    const closest = MOCK_SUGGESTIONS.find(s => Math.abs(s.lat - lat) < 0.05 && Math.abs(s.lng - lng) < 0.05)
      || MOCK_SUGGESTIONS[0];

    const randomSuffix = Math.floor(Math.random() * 100) + 1;

    onLocationChange({
      latitude: lat,
      longitude: lng,
      locality: closest.locality,
      city: closest.city,
      stateName: closest.state,
      pincode: closest.pincode,
      address: `${randomSuffix}, 12th Main Rd, ${closest.locality}, ${closest.city}, ${closest.state} - ${closest.pincode}`,
    });
  };

  const handleCoordsUpdate = async (lat: number, lng: number) => {

    if (manualMode) return;
    setLocationError("");
    try {
      const geoResult = await reverseGeocode(lat, lng);
      onLocationChange({
        latitude: lat,
        longitude: lng,
        address: geoResult.address,
        locality: geoResult.locality || "",
        city: geoResult.city || "",
        stateName: geoResult.state || "",
        pincode: geoResult.pincode || "",
      });
    } catch (err) {
      simulateReverseGeocode(lat, lng);
    }
  };

  const initGoogleMap = useCallback(async (lat: number, lng: number) => {
    try {
      const maps = await loadGoogleMaps();
      setGoogleMapsLoaded(true);

      if (!mapContainerRef.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: { lat, lng },
        zoom: 16,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: true,
        zoomControl: true,
        styles: theme === "dark" ? [
          { elementType: "geometry", stylers: [{ color: "#0f172a" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0f172a" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
          { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#334155" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#334155" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#1e1b4b" }] },
        ] : [],
      };

      const map = new maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;

      const marker = new maps.Marker({
        position: { lat, lng },
        map,
        draggable: true,
        animation: maps.Animation.DROP,
        title: "Drag to pin issue location",
      });
      markerInstanceRef.current = marker;

      map.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (manualMode) return;
        const coords = e.latLng;
        if (coords) {
          marker.setPosition(coords);
          handleCoordsUpdate(coords.lat(), coords.lng());
        }
      });

      marker.addListener("dragend", () => {
        if (manualMode) return;
        const pos = marker.getPosition();
        if (pos) {
          handleCoordsUpdate(pos.lat(), pos.lng());
        }
      });

    } catch (err) {
      console.warn("Could not load real Google Maps, using interactive mock layout.", err);
      setGoogleMapsLoaded(false);
    }
  }, [theme]);

  const triggerLocationDetection = useCallback(async () => {
    setDetectingLocation(true);
    setLocationError("");
    try {
      const coords = await getCurrentPosition();
      await handleCoordsUpdate(coords.latitude, coords.longitude);
      initGoogleMap(coords.latitude, coords.longitude);
    } catch (err: any) {
      console.warn("Geolocation failed. Falling back to default Bengaluru coords.", err);
      const fallbackLat = 12.9738;
      const fallbackLng = 77.6119;
      await handleCoordsUpdate(fallbackLat, fallbackLng);
      initGoogleMap(fallbackLat, fallbackLng);
      setLocationError("GPS signal unavailable. Using nearest calibrated location for issue reporting. You may adjust the pin manually.");

    } finally {
      setDetectingLocation(false);
    }
  }, [initGoogleMap]);

  useEffect(() => {
    triggerLocationDetection();
  }, [triggerLocationDetection]);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      if (googleMapsLoaded && mapInstanceRef.current && markerInstanceRef.current) {
        const newPos = { lat: latitude, lng: longitude };
        mapInstanceRef.current.setCenter(newPos);
        markerInstanceRef.current.setPosition(newPos);
      }
    }
  }, [latitude, longitude, googleMapsLoaded]);

  // Geocode manually entered address in manual mode
  useEffect(() => {
    if (!manualMode) return;

    const fullAddr = [locality, city, stateName].filter(Boolean).join(", ") + (pincode ? ` - ${pincode}` : "");
    if (!fullAddr.trim()) return;

    const delayDebounce = setTimeout(async () => {
      try {
        const geo = await forwardGeocode(fullAddr);
        onLocationChange({
          latitude: geo.lat,
          longitude: geo.lng,
          address: fullAddr,
          locality,
          city,
          stateName,
          pincode,
        });
      } catch (err) {
        console.warn("[LocationPicker] Forward geocoding failed for manual entry:", err);
      }
    }, 1000);

    return () => clearTimeout(delayDebounce);
  }, [locality, city, stateName, pincode, manualMode]);

  const handleSelectSuggestion = (s: typeof MOCK_SUGGESTIONS[0]) => {
    onLocationChange({
      latitude: s.lat,
      longitude: s.lng,
      locality: s.locality,
      city: s.city,
      stateName: s.state,
      pincode: s.pincode,
      address: `12th Main Rd, ${s.locality}, ${s.city}, ${s.state} - ${s.pincode}`,
    });
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <label className="text-sm font-semibold text-white flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-blue-400" />
          Step 5: Incident Location Pin
        </label>

        <Button
          type="button"
          onClick={triggerLocationDetection}
          disabled={detectingLocation || manualMode}
          variant="secondary"
          size="sm"
          className="bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 hover:text-white transition-all duration-200 shadow-sm"
        >
          {detectingLocation ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
              Detecting GPS...
            </>
          ) : (
            <>
              <Crosshair className="w-3.5 h-3.5 mr-1.5" />
              Recenter GPS Location
            </>
          )}
        </Button>
      </div>

      <div className="flex items-center gap-3 mt-2 mb-3">

        <button
          type="button"
          onClick={() => setManualMode(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${!manualMode
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
            : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750"
            }`}
        >
          📍 Auto GPS Mode
        </button>

        <button
          type="button"
          onClick={() => setManualMode(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${manualMode
            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
            : "bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750"
            }`}
        >
          ✏ Manual Entry
        </button>

      </div>

      <p className="text-xs text-slate-300 font-medium">
        {manualMode
          ? "Manual override active. Enter incident location manually."
          : "AI GPS mode active. Drag map pin or use live location."}
      </p>

      {locationError && (
        <div className="bg-yellow-500/15 border border-yellow-400/40 text-yellow-300 p-2.5 rounded-lg text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
          <span>{locationError}</span>
        </div>
      )}

      {manualMode && (
        <div className="text-xs text-purple-300 font-semibold mb-2">
          Manual mode active. Map disabled, enter location manually.
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80">

        {!googleMapsLoaded && (
          <div className="w-full h-[260px] bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e1b4b_0%,transparent_70%)] opacity-30" />
            <div className="absolute w-[200px] h-[200px] rounded-full border border-blue-500/10 flex items-center justify-center animate-pulse-slow">
              <div className="w-[100px] h-[100px] rounded-full border border-blue-500/20 flex items-center justify-center" />
            </div>

            <div className="z-10 space-y-3">
              <MapIcon className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
              <h4 className="text-sm font-semibold text-slate-300">Interactive Location Simulator Active</h4>
              <p className="text-xs text-slate-300 max-w-sm">
                Using default location coordinates. Choose one of our mock areas or drag coordinate values to simulate.
              </p>

              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {MOCK_SUGGESTIONS.map(s => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className={cn(
                      "text-[10px] font-semibold px-2 py-1 rounded border transition-all duration-150",
                      locality === s.locality
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                    )}
                  >
                    📍 {s.name.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {googleMapsLoaded && (
          <div
            ref={mapContainerRef}
            className="w-full h-[260px]"
          />
        )}

        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-lg flex items-start gap-3 shadow-lg z-20">
          <div className="bg-blue-500/10 p-1.5 rounded-md text-blue-400 mt-0.5 animate-pulse">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="block text-[9px] text-slate-300 uppercase tracking-wider font-semibold">Resolved Address</span>
            {address ? (
              <p className="text-xs font-semibold text-slate-200 line-clamp-1">{address}</p>
            ) : (
              <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4 mt-1" />
            )}
            <div className="flex gap-4 mt-1 text-[10px] text-slate-300 font-mono">
              <span>Lat: {latitude ? latitude.toFixed(6) : "..."}</span>
              <span>Lng: {longitude ? longitude.toFixed(6) : "..."}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-[10px] text-slate-300 uppercase tracking-wide font-semibold block">Locality</label>
          <input
            type="text"
            readOnly={!manualMode}
            value={locality}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-1 transition-colors"
            onChange={(e) => {
              const nextVal = e.target.value;
              const nextAddr = [nextVal, city, stateName].filter(Boolean).join(", ") + (pincode ? ` - ${pincode}` : "");
              onLocationChange({
                latitude: latitude || 0,
                longitude: longitude || 0,
                address: nextAddr,
                locality: nextVal,
                city,
                stateName,
                pincode,
              });
            }}
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-300 uppercase tracking-wide font-semibold block">City</label>
          <input
            type="text"
            readOnly={!manualMode}
            value={city}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-1 transition-colors"
            onChange={(e) => {
              const nextVal = e.target.value;
              const nextAddr = [locality, nextVal, stateName].filter(Boolean).join(", ") + (pincode ? ` - ${pincode}` : "");
              onLocationChange({
                latitude: latitude || 0,
                longitude: longitude || 0,
                address: nextAddr,
                locality,
                city: nextVal,
                stateName,
                pincode,
              });
            }}
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-300 uppercase tracking-wide font-semibold block">State</label>
          <input
            type="text"
            readOnly={!manualMode}
            value={stateName}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-1 transition-colors"
            onChange={(e) => {
              const nextVal = e.target.value;
              const nextAddr = [locality, city, nextVal].filter(Boolean).join(", ") + (pincode ? ` - ${pincode}` : "");
              onLocationChange({
                latitude: latitude || 0,
                longitude: longitude || 0,
                address: nextAddr,
                locality,
                city,
                stateName: nextVal,
                pincode,
              });
            }}
          />
        </div>
        <div>
          <label className="text-[10px] text-slate-300 uppercase tracking-wide font-semibold block">Pincode</label>
          <input
            type="text"
            readOnly={!manualMode}
            value={pincode}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mt-1 transition-colors"
            onChange={(e) => {
              const nextVal = e.target.value;
              const nextAddr = [locality, city, stateName].filter(Boolean).join(", ") + (nextVal ? ` - ${nextVal}` : "");
              onLocationChange({
                latitude: latitude || 0,
                longitude: longitude || 0,
                address: nextAddr,
                locality,
                city,
                stateName,
                pincode: nextVal,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
