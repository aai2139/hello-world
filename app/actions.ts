"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateSidequest } from "@/lib/gemini";
import { isBudget, isVibe, type VoteValue } from "@/lib/sidequests";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export type CreateSidequestState = {
  error?: string;
};

export type VoteResult = {
  error?: string;
  worthItCount?: number;
  skipItCount?: number;
  value?: VoteValue;
};

function generationErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("not configured")) return message;
  if (message.includes("429") || message.toLowerCase().includes("quota")) {
    return "The AI generator is busy right now. Please try again in a few minutes.";
  }
  if (message.includes("incomplete") || message.includes("unreadable")) return message;
  return "We could not generate that sidequest. Try a different idea in a moment.";
}

export async function createSidequest(
  _previousState: CreateSidequestState,
  formData: FormData,
): Promise<CreateSidequestState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in before creating a sidequest." };
  }

  const neighborhood = String(formData.get("neighborhood") ?? "")
    .replace(/\s+/g, " ")
    .trim();
  const budget = String(formData.get("budget") ?? "");
  const vibe = String(formData.get("vibe") ?? "");

  if (neighborhood.length < 2 || neighborhood.length > 60) {
    return { error: "Enter a neighborhood or area between 2 and 60 characters." };
  }
  if (!isBudget(budget) || !isVibe(vibe)) {
    return { error: "Choose a valid budget and vibe." };
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch (error) {
    return { error: generationErrorMessage(error) };
  }

  const { data: attemptId, error: quotaError } = await admin.rpc(
    "claim_generation_slot",
    { request_user_id: user.id },
  );

  if (quotaError) {
    console.error("Could not claim a generation slot", quotaError);
    return { error: "The generation service is not ready. Check the database setup." };
  }
  if (!attemptId) {
    return { error: "You have used all 5 generations for this hour. Try again later." };
  }

  let generated;
  try {
    generated = await generateSidequest({ neighborhood, budget, vibe });
  } catch (error) {
    console.error("Gemini generation failed", error);
    return { error: generationErrorMessage(error) };
  }

  const { data: sidequest, error: insertError } = await admin
    .from("sidequests")
    .insert({
      creator_id: user.id,
      neighborhood,
      budget,
      vibe,
      title: generated.title,
      hook: generated.hook,
      stops: generated.stops,
      budget_note: generated.budgetNote,
      prompt_text: generated.promptText,
      model_name: generated.modelName,
    })
    .select("id")
    .single();

  if (insertError || !sidequest) {
    console.error("Could not save generated sidequest", insertError);
    return { error: "Your sidequest was generated but could not be saved. Please try again." };
  }

  await admin
    .from("generation_attempts")
    .update({ succeeded: true })
    .eq("id", attemptId)
    .eq("user_id", user.id);

  revalidatePath("/");
  revalidatePath("/dashboard");
  redirect(`/sidequests/${sidequest.id}`);
}

export async function castVote(
  sidequestId: string,
  value: VoteValue,
): Promise<VoteResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sidequestId)) {
    return { error: "That sidequest is invalid." };
  }
  if (value !== 1 && value !== -1) {
    return { error: "Choose Worth it or Skip it." };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to rate sidequests." };
  }

  const admin = createAdminSupabaseClient();
  const { data: target } = await admin
    .from("sidequests")
    .select("id")
    .eq("id", sidequestId)
    .eq("status", "published")
    .maybeSingle();

  if (!target) {
    return { error: "That sidequest is no longer available." };
  }

  const { error } = await supabase.from("votes").upsert(
    {
      sidequest_id: sidequestId,
      user_id: user.id,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sidequest_id,user_id" },
  );

  if (error) {
    console.error("Vote failed", error);
    return { error: "Your rating did not save. Please try again." };
  }

  const { data: counts, error: countError } = await admin
    .from("sidequests")
    .select("worth_it_count, skip_it_count")
    .eq("id", sidequestId)
    .single();

  if (countError || !counts) {
    return { error: "Your rating saved, but the totals could not refresh." };
  }

  revalidatePath("/");
  revalidatePath(`/sidequests/${sidequestId}`);

  return {
    value,
    worthItCount: counts.worth_it_count,
    skipItCount: counts.skip_it_count,
  };
}
