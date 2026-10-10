import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { Budget, Sidequest, SidequestStop, Vibe } from "@/lib/sidequests";

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
  worth_it_count: number;
  skip_it_count: number;
  created_at: string;
};

const PUBLIC_COLUMNS =
  "id, neighborhood, budget, budget_min_cents, budget_max_cents, party_size, vibe, title, hook, stops, budget_note, worth_it_count, skip_it_count, created_at";

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
    stops: row.stops,
    budgetNote: row.budget_note,
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
