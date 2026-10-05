import Link from "next/link";
import SidequestCard from "@/app/sidequest-card";
import { getPublicSidequests } from "@/lib/sidequest-data";
import type { Sidequest, VoteValue } from "@/lib/sidequests";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ sort?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { sort: sortParam } = await searchParams;
  const sort = sortParam === "top" ? "top" : "fresh";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sidequests: Sidequest[] = [];
  let setupError = false;
  try {
    sidequests = await getPublicSidequests(sort);
  } catch (error) {
    console.error("Could not load public sidequests", error);
    setupError = true;
  }

  const votes = new Map<string, VoteValue>();
  if (user && sidequests.length > 0) {
    const { data } = await supabase
      .from("votes")
      .select("sidequest_id, value")
      .in("sidequest_id", sidequests.map((sidequest) => sidequest.id));
    for (const vote of data ?? []) {
      votes.set(vote.sidequest_id, vote.value as VoteValue);
    }
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Crowdsourced chaos. AI-planned weekends.</p>
            <h1>Trade the dorm for a New York sidequest.</h1>
            <p className="hero-copy">Pick a neighborhood and a vibe. AI plots three stops, then the community decides whether the plan is actually worth it.</p>
            <div className="hero-actions">
              <Link className="primary-button" href={user ? "/create" : "/login?next=/create"}>
                Generate a sidequest
              </Link>
              <a className="secondary-button" href="#feed">See what&apos;s trending</a>
            </div>
          </div>
          <div className="hero-stamp" aria-label="Made for curious Columbia students">
            <span>MADE FOR</span>
            <strong>CURIOUS<br />NEW YORKERS</strong>
            <small>EST. 2026 · MORNINGSIDE HEIGHTS</small>
          </div>
        </div>
      </section>

      <section className="page feed-section" id="feed">
        <div className="feed-heading">
          <div>
            <p className="eyebrow">Community field notes</p>
            <h2>Choose your next detour</h2>
          </div>
          <div className="sort-tabs" aria-label="Sort sidequests">
            <Link className={sort === "fresh" ? "active" : ""} href="/?sort=fresh#feed">Fresh</Link>
            <Link className={sort === "top" ? "active" : ""} href="/?sort=top#feed">Top this week</Link>
          </div>
        </div>

        {setupError ? (
          <div className="empty-state">
            <span aria-hidden="true">🗺️</span>
            <h3>The map is waiting for setup</h3>
            <p>Apply the Supabase migration and add the server environment variables to start publishing sidequests.</p>
          </div>
        ) : sidequests.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">🗽</span>
            <h3>No sidequests yet</h3>
            <p>Be the first person to send the community somewhere unexpected.</p>
            <Link className="primary-button" href={user ? "/create" : "/login?next=/create"}>Create the first one</Link>
          </div>
        ) : (
          <div className="feed-grid">
            {sidequests.map((sidequest) => (
              <SidequestCard
                key={sidequest.id}
                sidequest={sidequest}
                currentVote={votes.get(sidequest.id)}
                isLoggedIn={Boolean(user)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
