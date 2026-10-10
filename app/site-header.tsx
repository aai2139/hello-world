import Link from "next/link";
import LogoutButton from "@/app/logout-button";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function SiteHeader() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="NYC Sidequests home">
          <span className="brand-mark">NYC</span>
          <span className="brand-routes" aria-hidden="true">
            {"SIDEQUESTS".split("").map((letter, index) => (
              <span className={`route-badge route-badge-${index + 1}`} key={`${letter}-${index}`}>
                {letter}
              </span>
            ))}
          </span>
        </Link>
        <div className="nav-links">
          <Link href="/">Explore</Link>
          {user ? (
            <>
              <Link href="/create" className="nav-create">Create</Link>
              <Link href="/dashboard">My quests</Link>
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className="nav-create">Sign in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
