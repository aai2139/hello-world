import { redirect } from "next/navigation";
import ProfileForm from "@/app/profile/profile-form";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/profile");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="page narrow-page">
      <section className="create-intro">
        <p className="eyebrow">Your explorer card</p>
        <h1>Profile</h1>
        <p>Keep the basics current while you build your quest log.</p>
      </section>
      <div className="form-card">
        <ProfileForm
          userId={user.id}
          initialFirstName={profile?.first_name ?? ""}
          initialLastName={profile?.last_name ?? ""}
          initialAvatarUrl={profile?.avatar_url ?? ""}
        />
      </div>
    </main>
  );
}
