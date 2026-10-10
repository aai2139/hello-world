"use client";

import { useEffect, useMemo, useRef } from "react";
import type { SidequestStop } from "@/lib/sidequests";

type ItineraryMapProps = {
  stops: SidequestStop[];
};

export default function ItineraryMap({ stops }: ItineraryMapProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const locatedStops = useMemo(
    () =>
      stops.filter(
        (stop): stop is SidequestStop & { latitude: number; longitude: number } =>
          Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude),
      ),
    [stops],
  );

  useEffect(() => {
    if (!mapElement.current || locatedStops.length === 0) return;

    let disposed = false;
    let cleanup = () => {};

    void import("leaflet").then((leafletModule) => {
      if (disposed || !mapElement.current) return;
      const L = leafletModule.default;
      const map = L.map(mapElement.current, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      const points = locatedStops.map(
        (stop) => [stop.latitude, stop.longitude] as [number, number],
      );

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      }).addTo(map);

      locatedStops.forEach((stop, index) => {
        const icon = L.divIcon({
          className: "quest-map-marker-shell",
          html: `<span class="quest-map-marker">${index + 1}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        L.marker([stop.latitude, stop.longitude], { icon })
          .addTo(map)
          .bindPopup(`<strong>${escapeHtml(stop.label)}</strong>`);
      });

      if (points.length > 1) {
        L.polyline(points, {
          color: "#172118",
          weight: 4,
          opacity: 0.85,
          dashArray: "9 8",
        }).addTo(map);
      }

      if (points.length === 1) map.setView(points[0], 13);
      else map.fitBounds(L.latLngBounds(points), { padding: [38, 38] });

      cleanup = () => map.remove();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [locatedStops]);

  if (locatedStops.length === 0) return null;

  const directionsUrl = buildDirectionsUrl(locatedStops);

  return (
    <section className="route-card" aria-labelledby="route-heading">
      <div className="route-heading">
        <div>
          <p className="eyebrow">The route</p>
          <h2 id="route-heading">Follow the dots</h2>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="secondary-button">
          Open in Google Maps <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div ref={mapElement} className="quest-map" aria-label="Approximate itinerary route map" />
      <p className="map-note">Approximate locations and route order. Check live directions before heading out.</p>
    </section>
  );
}

function buildDirectionsUrl(
  stops: Array<SidequestStop & { latitude: number; longitude: number }>,
) {
  const params = new URLSearchParams({
    api: "1",
    origin: `${stops[0].latitude},${stops[0].longitude}`,
    destination: `${stops.at(-1)!.latitude},${stops.at(-1)!.longitude}`,
    travelmode: "walking",
  });

  if (stops.length > 2) {
    params.set(
      "waypoints",
      stops
        .slice(1, -1)
        .map((stop) => `${stop.latitude},${stop.longitude}`)
        .join("|"),
    );
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
