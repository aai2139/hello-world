import "server-only";

import type { GeneratedStop } from "@/lib/gemini";
import type { SidequestStop } from "@/lib/sidequests";

type NominatimResult = {
  lat?: string;
  lon?: string;
};

const NYC_VIEWBOX = "-74.259,40.917,-73.700,40.477";

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function geocode(query: string) {
  const params = new URLSearchParams({
    q: `${query}, New York City, NY`,
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
    },
  );

  if (!response.ok) return null;
  const results = (await response.json()) as NominatimResult[];
  const latitude = Number(results[0]?.lat);
  const longitude = Number(results[0]?.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

export async function addExactCoordinates(stops: GeneratedStop[]) {
  const locatedStops: SidequestStop[] = [];
  let lookupIndex = 0;

  for (const stop of stops) {
    const places = [];
    for (const place of stop.places) {
      if (lookupIndex > 0) await wait(1_100);
      lookupIndex += 1;
      try {
        const location = await geocode(`${place.mapQuery}, ${place.address}`);
        if (location) places.push({ ...place, ...location });
      } catch (error) {
        console.error("Could not geocode sidequest place", error);
      }
    }
    if (places.length === 0) {
      throw new Error(`No exact map location could be found for ${stop.label}.`);
    }
    locatedStops.push({ ...stop, places });
  }

  return locatedStops;
}
