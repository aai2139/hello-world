import { chooseCoverImage } from "@/lib/cover-images";
import { generateSidequest } from "@/lib/gemini";
import { addExactCoordinates } from "@/lib/geocode";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { Budget, Vibe } from "@/lib/sidequests";

type BackfillRow = {
  id: string;
  neighborhood: string;
  budget: Budget;
  budget_min_cents: number | null;
  budget_max_cents: number | null;
  party_size: number;
  preferences: string | null;
  vibe: Vibe;
};

async function main() {
  if (process.argv.includes("--help")) {
    console.log("Usage: npm run backfill:sidequests -- [--execute] [--limit=NUMBER]");
    console.log("Without --execute, the command only lists quests that need upgrading.");
    return;
  }
  const execute = process.argv.includes("--execute");
  const requestedLimit = process.argv.find((argument) => argument.startsWith("--limit="));
  const limit = requestedLimit ? Math.max(1, Number(requestedLimit.split("=")[1])) : 1000;

  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
  .from("sidequests")
  .select("id, neighborhood, budget, budget_min_cents, budget_max_cents, party_size, preferences, vibe")
  .lt("content_version", 2)
  .order("created_at", { ascending: true })
  .limit(limit);

  if (error) throw error;
  const rows = (data ?? []) as BackfillRow[];

  if (!execute) {
    console.log(`Dry run: ${rows.length} sidequest(s) need the version 2 content upgrade.`);
    for (const row of rows) console.log(`- ${row.id} · ${row.neighborhood} · ${row.vibe}`);
    console.log("Run again with --execute to regenerate and update these rows.");
    return;
  }

  const { data: assignedCovers, error: coverError } = await admin
  .from("sidequests")
  .select("cover_image_key")
  .not("cover_image_key", "is", null);
  if (coverError) throw coverError;
  const usedCoverKeys = new Set(
  (assignedCovers ?? []).flatMap((row) => row.cover_image_key ? [row.cover_image_key] : []),
);

  let upgraded = 0;
  let failed = 0;
  for (const row of rows) {
  const fallbackRange = budgetRange(row.budget);
  const budgetMin = row.budget_min_cents === null ? fallbackRange[0] : row.budget_min_cents / 100;
  const budgetMax = row.budget_max_cents === null ? fallbackRange[1] : row.budget_max_cents / 100;
  try {
    const generated = await generateSidequest({
      neighborhood: row.neighborhood,
      budgetMin,
      budgetMax,
      partySize: row.party_size,
      preferences: row.preferences ?? "",
      vibe: row.vibe,
    });
    const stops = await addExactCoordinates(generated.stops);
    const cover = await chooseCoverImage({
      neighborhood: row.neighborhood,
      title: generated.title,
      vibe: row.vibe,
      stops,
    }, usedCoverKeys);
    const { error: updateError } = await admin
      .from("sidequests")
      .update({
        title: generated.title,
        hook: generated.hook,
        stops,
        budget_note: generated.budgetNote,
        prompt_text: generated.promptText,
        model_name: generated.modelName,
        cover_image_url: cover.src,
        cover_image_alt: cover.alt,
        cover_image_credit: cover.credit,
        cover_image_credit_url: cover.creditUrl,
        cover_image_source: cover.source,
        cover_image_key: cover.key,
        content_version: 2,
      })
      .eq("id", row.id)
      .lt("content_version", 2);
    if (updateError) throw updateError;
    usedCoverKeys.add(cover.key);
    upgraded += 1;
    console.log(`Upgraded ${row.id} · ${row.neighborhood}`);
  } catch (backfillError) {
    failed += 1;
    console.error(`Failed ${row.id} · ${row.neighborhood}`, backfillError);
  }
  }

  console.log(`Backfill complete: ${upgraded} upgraded, ${failed} failed.`);
  if (failed > 0) process.exitCode = 1;
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function budgetRange(budget: Budget): [number, number] {
  if (budget === "under-25") return [0, 25];
  if (budget === "25-50") return [25, 50];
  return [50, 100];
}
