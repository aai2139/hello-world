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
          <svg className="brand-skyline" viewBox="0 0 180 42" aria-hidden="true">
            <path d="M0 40V28h9V18h8v12h7V10h7v30h8V22h7v18h8V14h10v26h8V5h4V0h3v5h4v35h8V20h9v20h8V12h11v28h7V25h8v15h8V17h12v23h8V29h9v11Z" />
          </svg>
          <span className="brand-mark">NYC</span>
          <span>Sidequests</span>
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
