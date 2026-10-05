import Link from "next/link";
import { redirect } from "next/navigation";
import SidequestCard from "@/app/sidequest-card";
import { getOwnSidequests, getRemainingGenerations } from "@/lib/sidequest-data";
import type { VoteValue } from "@/lib/sidequests";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/dashboard");

  const [sidequests, remaining] = await Promise.all([
    getOwnSidequests(user.id),
    getRemainingGenerations(user.id),
  ]);

  const votes = new Map<string, VoteValue>();
  if (sidequests.length > 0) {
    const { data } = await supabase
      .from("votes")
      .select("sidequest_id, value")
      .in("sidequest_id", sidequests.map((sidequest) => sidequest.id));
    for (const vote of data ?? []) votes.set(vote.sidequest_id, vote.value as VoteValue);
  }

  return (
    <main className="page dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Your dispatches</p>
          <h1>My sidequests</h1>
          <p>Signed in as {user.email}</p>
        </div>
        <div className="dashboard-actions">
          <span className="quota-pill">{remaining} of 5 generations left this hour</span>
          <Link href="/create" className="primary-button">Make another</Link>
        </div>
      </div>

      {sidequests.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">🚇</span>
          <h2>Your quest log is empty</h2>
          <p>Pick a neighborhood and let AI plan your first city detour.</p>
          <Link href="/create" className="primary-button">Generate one</Link>
        </div>
      ) : (
        <div className="feed-grid">
          {sidequests.map((sidequest) => (
            <SidequestCard
              key={sidequest.id}
              sidequest={sidequest}
              currentVote={votes.get(sidequest.id)}
              isLoggedIn
            />
          ))}
        </div>
      )}
    </main>
  );
}
