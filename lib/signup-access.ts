import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase-admin";

export async function isEmailAllowed(email: string | undefined) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  const domain = normalized.split("@").at(-1);
  if (!domain) return false;

  const admin = createAdminSupabaseClient();
  const [{ data: emailRule }, { data: domainRule }] = await Promise.all([
    admin.from("whitelisted_emails").select("id").eq("email", normalized).eq("is_enabled", true).maybeSingle(),
    admin.from("allowed_signup_domains").select("id").eq("domain", domain).eq("is_enabled", true).maybeSingle(),
  ]);
  return Boolean(emailRule || domainRule);
}
