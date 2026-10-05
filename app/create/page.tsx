import { redirect } from "next/navigation";
import CreateForm from "@/app/create/create-form";
import { getRemainingGenerations } from "@/lib/sidequest-data";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/create");

  let remaining: number | null = null;
  try {
    remaining = await getRemainingGenerations(user.id);
  } catch {
    // The migration or server key may not be installed yet.
  }

  return (
    <main className="page narrow-page">
      <section className="create-intro">
        <p className="eyebrow">Your weekend, remixed</p>
        <h1>Make a New York sidequest</h1>
        <p>Give the AI a corner of the city, a budget, and a vibe. The community will decide if the result is worth leaving the dorm for.</p>
        {remaining !== null && <span className="quota-pill">{remaining} of 5 generations left this hour</span>}
      </section>
      <div className="form-card">
        <CreateForm />
      </div>
    </main>
  );
}
