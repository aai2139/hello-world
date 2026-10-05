import { redirect } from "next/navigation";
import LoginButton from "@/app/login-button";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next: nextParam } = await searchParams;
  const nextPath = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(nextPath);

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-art" aria-hidden="true">
          <span>1</span><span>2</span><span>3</span>
          <div className="route-line" />
        </div>
        <div className="login-copy">
          <p className="eyebrow">Your city is bigger than your syllabus</p>
          <h1>Sign in and go somewhere new.</h1>
          <p>Generate sidequests, rate the community&apos;s plans, and keep a log of the corners you want to explore.</p>
          <LoginButton nextPath={nextPath} />
          <small>We use Google only to identify your account and protect your ratings.</small>
        </div>
      </section>
    </main>
  );
}
