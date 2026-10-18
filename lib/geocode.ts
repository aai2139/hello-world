import "server-only";

import type { GeneratedStop } from "@/lib/gemini";
import type { SidequestStop } from "@/lib/sidequests";
import {
  assertCompactWalkingRoute,
  distanceMiles,
  MAX_OPTION_DISTANCE_MILES,
  type RoutePoint,
} from "@/lib/route-quality";

type NominatimResult = {
  lat?: string;
  lon?: string;
};

type GeoapifyResult = {
  lat?: number;
  lon?: number;
  rank?: { confidence?: number };
};

const NYC_VIEWBOX = "-74.259,40.917,-73.700,40.477";
const GEOCODER_TIMEOUT_MS = 6_000;

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function geocodeWithGeoapify(query: string, bias?: RoutePoint) {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return null;
  const params = new URLSearchParams({
    text: query,
    format: "json",
    limit: "1",
    filter: "rect:-74.259,40.477,-73.700,40.917",
    bias: bias
      ? `proximity:${bias.longitude},${bias.latitude}`
      : "proximity:-73.9855,40.7580",
    apiKey,
  });
  const response = await fetch(`https://api.geoapify.com/v1/geocode/search?${params}`, {
    next: { revalidate: 60 * 60 * 24 * 30 },
    signal: AbortSignal.timeout(GEOCODER_TIMEOUT_MS),
  });
  if (!response.ok) return null;
  const body = await response.json() as { results?: GeoapifyResult[] };
  const result = body.results?.[0];
  const latitude = Number(result?.lat);
  const longitude = Number(result?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

async function geocodeWithNominatim(query: string) {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "1",
    countrycodes: "us",
    viewbox: NYC_VIEWBOX,
    bounded: "1",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        "User-Agent":
          "NYC-Sidequests/1.0 (https://github.com/aai2139/hello-world)",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "force-cache",
      signal: AbortSignal.timeout(GEOCODER_TIMEOUT_MS),
    },
  );

  if (!response.ok) return null;
  const results = (await response.json()) as NominatimResult[];
  const latitude = Number(results[0]?.lat);
  const longitude = Number(results[0]?.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

async function geocode(query: string, planningArea?: string, bias?: RoutePoint) {
  const contextualQuery = [query, planningArea, "New York City, NY"]
    .filter(Boolean)
    .join(", ");
  try {
    const geoapify = await geocodeWithGeoapify(contextualQuery, bias);
    if (geoapify) return geoapify;
  } catch (error) {
    console.error("Geoapify lookup failed; falling back to Nominatim", error);
  }
  return geocodeWithNominatim(contextualQuery);
}

function shouldCheckNeighborhoodCenter(planningArea: string) {
  return !/^(?:the )?(?:bronx|brooklyn|manhattan|queens|staten island)$/i.test(planningArea.trim()) &&
    !/\band\b/i.test(planningArea);
}

export async function addExactCoordinates(stops: GeneratedStop[], planningArea: string) {
  let lookupIndex = 0;
  const neighborhoodCenter = await geocode(planningArea);

  const locatePlace = async (place: GeneratedStop["places"][number]) => {
    try {
      if (!process.env.GEOAPIFY_API_KEY && lookupIndex > 0) await wait(1_100);
      lookupIndex += 1;
      let location = await geocode(place.mapQuery, planningArea, neighborhoodCenter ?? undefined);
      if (!location) {
        if (!process.env.GEOAPIFY_API_KEY) await wait(1_100);
        lookupIndex += 1;
        location = await geocode(place.address, planningArea, neighborhoodCenter ?? undefined);
      }
      return location ? { ...place, ...location } : null;
    } catch (error) {
      console.error("Could not geocode sidequest place", error);
      return null;
    }
  };

  const locateStop = async (stop: GeneratedStop, parallelPlaces: boolean) => {
    const placeResults = parallelPlaces
      ? await Promise.all(stop.places.map(locatePlace))
      : await (async () => {
          const results = [];
          for (const place of stop.places) results.push(await locatePlace(place));
          return results;
        })();
    const places = placeResults.filter((place): place is NonNullable<typeof place> => place !== null);
    if (places.length === 0) {
      const attemptedPlaces = stop.places.map((place) => place.mapQuery).join("; ");
      throw new Error(`No map location could be found for ${stop.label}: ${attemptedPlaces}.`);
    }
    const primaryPlace = places[0];
    const nearbyPlaces = places.filter(
      (place) => place === primaryPlace || distanceMiles(primaryPlace, place) <= MAX_OPTION_DISTANCE_MILES,
    );
    return { ...stop, places: nearbyPlaces };
  };

  let locatedStops: SidequestStop[];
  if (process.env.GEOAPIFY_API_KEY) {
    locatedStops = await Promise.all(stops.map((stop) => locateStop(stop, true)));
  } else {
    locatedStops = [];
    for (const stop of stops) locatedStops.push(await locateStop(stop, false));
  }

  assertCompactWalkingRoute(
    locatedStops.map((stop) => stop.places[0]),
    shouldCheckNeighborhoodCenter(planningArea) ? neighborhoodCenter : null,
  );

  return locatedStops;
}
