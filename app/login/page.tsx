import Image from "next/image";
import { redirect } from "next/navigation";
import LoginButton from "@/app/login-button";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next: nextParam, error } = await searchParams;
  const nextPath = nextParam?.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(nextPath);

  return (
    <main className="login-page">
      <section className="login-card">
        <figure className="login-art">
          <Image
            className="login-photo"
            src="/nyc-skyline.jpg"
            alt="The Manhattan skyline glowing at sunset"
            fill
            preload
            sizes="(max-width: 850px) 100vw, 43vw"
          />
          <div className="login-photo-shade" aria-hidden="true" />
          <figcaption className="login-photo-copy">
            <span>MANHATTAN · GOLDEN HOUR</span>
            <strong>Three stops.<br />One new corner of NYC.</strong>
          </figcaption>
          <a
            className="login-photo-credit"
            href="https://commons.wikimedia.org/wiki/File:Skyline_of_Manhattan.jpg"
            target="_blank"
            rel="noreferrer"
          >
            Photo: Michael Discenza · CC0
          </a>
        </figure>
        <div className="login-copy">
          <p className="eyebrow">Your city is bigger than your syllabus</p>
          <h1>Sign in and go somewhere new.</h1>
          <p>Generate sidequests, rate the community&apos;s plans, and keep a log of the corners you want to explore.</p>
          <LoginButton nextPath={nextPath} />
          {error === "not_allowed" && <p className="form-error" role="alert">This email is not approved for Sidequests. Ask an administrator to allow your domain or email address.</p>}
          <small>We use Google only to identify your account and protect your ratings.</small>
        </div>
      </section>
    </main>
  );
}
