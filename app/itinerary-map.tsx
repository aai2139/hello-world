"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SidequestPlace, SidequestStop } from "@/lib/sidequests";

type ItineraryMapProps = { stops: SidequestStop[] };

export default function ItineraryMap({ stops }: ItineraryMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mappedPlaces = useMemo(() => stops.flatMap((stop, stopIndex) =>
    stop.places.map((place, placeIndex) => ({ place, stopIndex, placeIndex }))), [stops]);
  const primaryPlaces = useMemo(() => stops.flatMap((stop) => stop.places.slice(0, 1)), [stops]);

  useEffect(() => {
    if (!mapElement.current || mappedPlaces.length === 0) return;
    let disposed = false;
    let cleanup = () => {};

    void import("leaflet").then((leafletModule) => {
      if (disposed || !mapElement.current) return;
      const L = leafletModule.default;
      const map = L.map(mapElement.current, { scrollWheelZoom: false, zoomControl: true });
      const points = mappedPlaces.map(({ place }) => [place.latitude, place.longitude] as [number, number]);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);

      mappedPlaces.forEach(({ place, stopIndex, placeIndex }) => {
        const markerLabel = placeIndex === 0
          ? String(stopIndex + 1)
          : `${stopIndex + 1}${String.fromCharCode(65 + placeIndex)}`;
        const icon = L.divIcon({
          className: `quest-map-marker-shell${placeIndex > 0 ? " alternative" : ""}`,
          html: `<span class="quest-map-marker">${markerLabel}</span>`,
          iconSize: [38, 34],
          iconAnchor: [19, 17],
        });
        const placeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, ${place.address}`)}`;
        L.marker([place.latitude, place.longitude], { icon })
          .addTo(map)
          .bindPopup(`<strong>${escapeHtml(place.name)}</strong><br><span>${escapeHtml(place.address)}</span><br><a href="${escapeHtml(placeUrl)}" target="_blank" rel="noreferrer">Open in Google Maps ↗</a>`);
      });

      if (primaryPlaces.length > 1) {
        L.polyline(primaryPlaces.map((place) => [place.latitude, place.longitude]), {
          color: "#172118",
          weight: 4,
          opacity: 0.85,
          dashArray: "9 8",
        }).addTo(map);
      }

      if (points.length === 1) map.setView(points[0], 14);
      else map.fitBounds(L.latLngBounds(points), { padding: [38, 38] });
      cleanup = () => map.remove();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [mappedPlaces, primaryPlaces]);

  if (mappedPlaces.length === 0) return null;
  const directionsUrl = buildDirectionsUrl(primaryPlaces);

  return (
    <section className="route-card" aria-labelledby="route-heading">
      <div className="route-heading">
        <div>
          <p className="eyebrow">The route</p>
          <h2 id="route-heading">Every place, pinned</h2>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="secondary-button">
          Route the primary picks <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div ref={mapElement} className="quest-map" aria-label="Map of every itinerary destination and recommendation" />
      <p className="map-note">The route connects each primary destination. Lettered markers are optional recommendations. Check live directions before heading out.</p>
    </section>
  );
}

function buildDirectionsUrl(stops: SidequestPlace[]) {
  const params = new URLSearchParams({
    api: "1",
    origin: `${stops[0].latitude},${stops[0].longitude}`,
    destination: `${stops.at(-1)!.latitude},${stops.at(-1)!.longitude}`,
    travelmode: "walking",
  });
  if (stops.length > 2) {
    params.set("waypoints", stops.slice(1, -1).map((stop) => `${stop.latitude},${stop.longitude}`).join("|"));
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
