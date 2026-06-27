import { Loader } from "@googlemaps/js-api-loader";

// ─── Singleton loader ─────────────────────────────────────────────────────────

let loader: Loader | null = null;
let googleMaps: typeof google.maps | null = null;

function getLoader(): Loader {
  if (!loader) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error(
        "[LocationService] Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable."
      );
    }
    loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geometry", "marker"],
    });
  }
  return loader;
}

/**
 * Loads the Google Maps JS SDK once, returns the global google.maps namespace.
 */
export async function loadGoogleMaps(): Promise<typeof google.maps> {
  if (googleMaps) return googleMaps;
  await getLoader().load();
  googleMaps = google.maps;
  return googleMaps;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReverseGeocodeResult {
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
}

// ─── Geolocation ─────────────────────────────────────────────────────────────

/**
 * Returns the user's current position using the browser Geolocation API.
 */
export async function getCurrentPosition(): Promise<GeolocationCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => reject(new Error(`Geolocation error: ${err.message}`)),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  });
}

// ─── Reverse geocoding ────────────────────────────────────────────────────────

/**
 * Reverse geocodes a lat/lng into a structured address using the Google Maps
 * Geocoding API.
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  const response = await geocoder.geocode({
    location: { lat, lng },
  });

  const result = response.results[0];
  if (!result) {
    throw new Error(`No geocoding results for (${lat}, ${lng})`);
  }

  const get = (type: string): string => {
    const component = result.address_components.find((c) =>
      c.types.includes(type)
    );
    return component?.long_name ?? "";
  };

  return {
    address:  result.formatted_address,
    locality: get("sublocality_level_1") || get("neighborhood") || get("locality"),
    city:     get("locality") || get("administrative_area_level_2"),
    state:    get("administrative_area_level_1"),
    pincode:  get("postal_code"),
  };
}

// ─── Forward geocoding ────────────────────────────────────────────────────────

export interface ForwardGeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

/**
 * Forward geocodes an address string to lat/lng.
 */
export async function forwardGeocode(
  address: string
): Promise<ForwardGeocodeResult> {
  await loadGoogleMaps();
  const geocoder = new google.maps.Geocoder();

  const response = await geocoder.geocode({ address });
  const result = response.results[0];

  if (!result) {
    throw new Error(`No geocoding results for "${address}"`);
  }

  return {
    lat: result.geometry.location.lat(),
    lng: result.geometry.location.lng(),
    formattedAddress: result.formatted_address,
  };
}
