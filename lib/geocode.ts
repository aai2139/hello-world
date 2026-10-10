import "server-only";

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

export async function addApproximateCoordinates(stops: SidequestStop[]) {
  const locatedStops: SidequestStop[] = [];

  for (const [index, stop] of stops.entries()) {
    if (index > 0) await wait(1_100);

    try {
      const location = stop.mapQuery ? await geocode(stop.mapQuery) : null;
      locatedStops.push(location ? { ...stop, ...location } : stop);
    } catch (error) {
      console.error("Could not geocode sidequest stop", error);
      locatedStops.push(stop);
    }
  }

  return locatedStops;
}
