import Link from "next/link";
import { redirect } from "next/navigation";
import SidequestCard from "@/app/sidequest-card";
import { getExploreLocations, getPublicSidequests, type ExploreSort } from "@/lib/sidequest-data";
import { BUDGET_OPTIONS, isBudget, isVibe, type Sidequest, VIBE_OPTIONS, type VoteValue } from "@/lib/sidequests";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams: Promise<{ sort?: string; budget?: string; vibe?: string; location?: string; search?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const sort: ExploreSort = params.sort === "top" || params.sort === "discussed" ? params.sort : "fresh";
  const budget = params.budget && isBudget(params.budget) ? params.budget : undefined;
  const vibe = params.vibe && isVibe(params.vibe) ? params.vibe : undefined;
  const location = params.location?.trim().slice(0, 60) || undefined;
  const search = params.search?.trim().slice(0, 80) || undefined;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/");

  let sidequests: Sidequest[] = [];
  let locations: string[] = [];
  let setupError = false;
  try {
    [sidequests, locations] = await Promise.all([
      getPublicSidequests({ sort, budget, vibe, location, search }),
      getExploreLocations(),
    ]);
  } catch (error) {
    console.error("Could not load public sidequests", error);
    setupError = true;
  }

  const votes = new Map<string, VoteValue>();
  if (sidequests.length > 0) {
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
            <p className="hero-copy">Pick your corner of New York. Get a cohesive mapped itinerary, then see whether the community rates the route worth it.</p>
            <div className="hero-actions">
              <Link className="primary-button" href="/create">
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
        </div>

        <form className="explore-filters" action="/" method="get">
          <label className="filter-search">
            <span>Search</span>
            <input name="search" defaultValue={search} placeholder="Quest, stop, or neighborhood" />
          </label>
          <label>
            <span>Sort</span>
            <select name="sort" defaultValue={sort}>
              <option value="fresh">Fresh</option>
              <option value="top">Top rated</option>
              <option value="discussed">Most discussed</option>
            </select>
          </label>
          <label>
            <span>Location</span>
            <select name="location" defaultValue={location ?? ""}>
              <option value="">Anywhere</option>
              {locations.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Budget</span>
            <select name="budget" defaultValue={budget ?? ""}>
              <option value="">Any budget</option>
              {BUDGET_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Vibe</span>
            <select name="vibe" defaultValue={vibe ?? ""}>
              <option value="">Any vibe</option>
              {VIBE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <button className="primary-button filter-submit" type="submit">Apply</button>
          {(search || location || budget || vibe || sort !== "fresh") && <Link className="clear-filters" href="/#feed">Clear</Link>}
        </form>

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
            <Link className="primary-button" href="/create">Create the first one</Link>
          </div>
        ) : (
          <div className="feed-grid">
            {sidequests.map((sidequest) => (
              <SidequestCard
                key={sidequest.id}
                sidequest={sidequest}
                currentVote={votes.get(sidequest.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
