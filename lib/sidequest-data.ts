import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { Budget, Sidequest, SidequestCover, SidequestStop, Vibe } from "@/lib/sidequests";

type SidequestRow = {
  id: string;
  neighborhood: string;
  budget: Budget;
  budget_min_cents: number | null;
  budget_max_cents: number | null;
  party_size: number;
  vibe: Vibe;
  title: string;
  hook: string;
  stops: SidequestStop[];
  budget_note: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  cover_image_credit: string | null;
  cover_image_credit_url: string | null;
  cover_image_source: "local" | "wikimedia" | null;
  cover_image_key: string | null;
  content_version: number | null;
  worth_it_count: number;
  skip_it_count: number;
  created_at: string;
};

const PUBLIC_COLUMNS =
  "id, neighborhood, budget, budget_min_cents, budget_max_cents, party_size, vibe, title, hook, stops, budget_note, cover_image_url, cover_image_alt, cover_image_credit, cover_image_credit_url, cover_image_source, cover_image_key, content_version, worth_it_count, skip_it_count, created_at";

const LEGACY_COVER: SidequestCover = {
  src: "/nyc-skyline.jpg",
  alt: "The Manhattan skyline at golden hour",
  credit: "Michael Discenza · CC0",
  creditUrl: "https://commons.wikimedia.org/wiki/File:Skyline_of_Manhattan.jpg",
  source: "local",
  key: "local:nyc-skyline",
};

function normalizeStops(stops: SidequestStop[]) {
  return stops.map((stop) => {
    if (Array.isArray(stop.places) && stop.places.length > 0) return stop;
    if (
      stop.mapQuery &&
      Number.isFinite(stop.latitude) &&
      Number.isFinite(stop.longitude)
    ) {
      return {
        ...stop,
        places: [{
          name: stop.mapQuery,
          address: stop.mapQuery,
          mapQuery: stop.mapQuery,
          latitude: stop.latitude!,
          longitude: stop.longitude!,
        }],
      };
    }
    return { ...stop, places: [] };
  });
}

function toSidequest(row: SidequestRow): Sidequest {
  return {
    id: row.id,
    neighborhood: row.neighborhood,
    budget: row.budget,
    budgetMinCents: row.budget_min_cents,
    budgetMaxCents: row.budget_max_cents,
    partySize: row.party_size,
    vibe: row.vibe,
    title: row.title,
    hook: row.hook,
    stops: normalizeStops(row.stops),
    budgetNote: row.budget_note,
    cover: row.cover_image_url ? {
      src: row.cover_image_url,
      alt: row.cover_image_alt || `${row.neighborhood} in New York City`,
      credit: row.cover_image_credit || "Wikimedia Commons",
      creditUrl: row.cover_image_credit_url || "https://commons.wikimedia.org/",
      source: row.cover_image_source || "wikimedia",
      key: row.cover_image_key || row.cover_image_url,
    } : LEGACY_COVER,
    contentVersion: row.content_version ?? 1,
    worthItCount: row.worth_it_count,
    skipItCount: row.skip_it_count,
    createdAt: row.created_at,
  };
}

export async function getPublicSidequests(sort: "fresh" | "top" = "fresh") {
  const admin = createAdminSupabaseClient();
  let query = admin
    .from("sidequests")
    .select(PUBLIC_COLUMNS)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(sort === "top" ? 100 : 24);

  if (sort === "top") {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("created_at", weekAgo);
  }

  const { data, error } = await query;
  if (error) throw error;

  const sidequests = ((data ?? []) as SidequestRow[]).map(toSidequest);
  if (sort === "top") {
    sidequests.sort((a, b) => {
      const scoreDifference =
        b.worthItCount - b.skipItCount - (a.worthItCount - a.skipItCount);
      if (scoreDifference !== 0) return scoreDifference;
      const voteDifference =
        b.worthItCount + b.skipItCount - (a.worthItCount + a.skipItCount);
      if (voteDifference !== 0) return voteDifference;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  return sidequests.slice(0, 24);
}

export async function getPublicSidequest(id: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("sidequests")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data ? toSidequest(data as SidequestRow) : null;
}

export async function getOwnSidequests(userId: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("sidequests")
    .select(PUBLIC_COLUMNS)
    .eq("creator_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return ((data ?? []) as SidequestRow[]).map(toSidequest);
}

export async function getRemainingGenerations(userId: string) {
  const admin = createAdminSupabaseClient();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error } = await admin
    .from("generation_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", hourAgo);

  if (error) throw error;
  return Math.max(0, 5 - (count ?? 0));
}
