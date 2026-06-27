import { loadGoogleMaps } from "./locationService";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  types: string[];
}

// ─── Autocomplete ─────────────────────────────────────────────────────────────

let autocompleteService: google.maps.places.AutocompleteService | null = null;
let placesService: google.maps.places.PlacesService | null = null;

async function getAutocompleteService(): Promise<google.maps.places.AutocompleteService> {
  if (!autocompleteService) {
    await loadGoogleMaps();
    autocompleteService = new google.maps.places.AutocompleteService();
  }
  return autocompleteService;
}

async function getPlacesService(): Promise<google.maps.places.PlacesService> {
  if (!placesService) {
    await loadGoogleMaps();
    // PlacesService requires a DOM element or Map instance
    const div = document.createElement("div");
    placesService = new google.maps.places.PlacesService(div);
  }
  return placesService;
}

/**
 * Returns address autocomplete predictions for a partial text input.
 * Biased toward India.
 */
export async function getPlacePredictions(
  input: string
): Promise<PlacePrediction[]> {
  if (input.trim().length < 2) return [];

  const service = await getAutocompleteService();

  return new Promise((resolve, reject) => {
    service.getPlacePredictions(
      {
        input,
        componentRestrictions: { country: "in" },
        types: ["geocode", "establishment"],
      },
      (predictions, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK &&
          status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          reject(new Error(`Places API error: ${status}`));
          return;
        }
        resolve(
          (predictions ?? []).map((p) => ({
            placeId:       p.place_id,
            description:   p.description,
            mainText:      p.structured_formatting.main_text,
            secondaryText: p.structured_formatting.secondary_text,
          }))
        );
      }
    );
  });
}

/**
 * Fetches place details (including lat/lng) for a given placeId.
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails> {
  const service = await getPlacesService();

  return new Promise((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ["place_id", "name", "formatted_address", "geometry", "types"],
      },
      (place, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !place ||
          !place.geometry?.location
        ) {
          reject(new Error(`Place details error: ${status}`));
          return;
        }
        resolve({
          placeId:          place.place_id ?? placeId,
          name:             place.name ?? "",
          formattedAddress: place.formatted_address ?? "",
          lat:              place.geometry.location.lat(),
          lng:              place.geometry.location.lng(),
          types:            place.types ?? [],
        });
      }
    );
  });
}
