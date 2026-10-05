# NYC Sidequests

NYC Sidequests is a community feed of AI-generated New York micro-adventures. Anyone can browse fresh and top-rated plans. Google-authenticated users can generate new sidequests with Gemini and rate each plan **Worth it** or **Skip it**.

## Product behavior

- Public, shareable sidequest feed and detail pages
- Gemini-generated title, hook, three-stop itinerary, and budget note
- Five generation attempts per authenticated user per rolling hour
- One editable rating per user and sidequest
- Private profiles, vote ownership, and generation audit data enforced with Supabase RLS
- Server-only generation and public-feed data access so clients cannot forge AI content or expose creator IDs and saved prompts

## Local setup

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env.local` and provide:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-3.8-flash
```

`SUPABASE_SERVICE_ROLE_KEY` and `GEMINI_API_KEY` are server secrets. Never prefix them with `NEXT_PUBLIC_` or expose them to browser code.

Run [`supabase/migrations/202610050001_nyc_sidequests.sql`](supabase/migrations/202610050001_nyc_sidequests.sql) in the Supabase SQL Editor. The migration creates the sidequest, vote, and quota tables; installs aggregate triggers; enables RLS; replaces policies on the app tables; and locks the retired `tasks` table.

The existing `avatars` Storage bucket should remain public because existing profiles store public avatar URLs. The migration restricts avatar writes and deletes to the authenticated user’s folder. Review and remove any older permissive avatar write policies in the Supabase dashboard if they exist.

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint
npx tsc --noEmit
npm run build
```

The build script uses Next.js 16's supported webpack build mode because Turbopack's CSS worker cannot bind its internal port in some restricted grading and CI environments.

Before submission, test with two accounts and an Incognito window:

1. Confirm a signed-out visitor can browse but is sent to Google login when creating or rating.
2. Generate a sidequest and confirm the exact prompt, model name, user, and output are saved in `sidequests`.
3. Rate from a second account, switch the vote, and confirm there is still one `votes` row and the aggregate counts change correctly.
4. Confirm one user cannot read or mutate another user’s profile or vote through the Supabase API.
5. Confirm direct browser inserts into `sidequests`, `generation_attempts`, and the retired `tasks` table fail.
6. Confirm the sixth generation attempt within a rolling hour is rejected.

## Vercel deployment

1. Commit and push the completed code.
2. Import or link the GitHub repository in Vercel.
3. Add the four required environment variables above to the Production environment. `GEMINI_MODEL` is optional.
4. Add `https://<your-vercel-domain>/auth/callback` to the Supabase Auth redirect URL allowlist. Keep the local callback for development.
5. Deploy the exact submission commit and run the verification flow against its immutable Vercel deployment URL.
6. In **Vercel → Project Settings → Deployment Protection**, disable protection for the submitted deployment.
7. Open the immutable deployment URL in Incognito Mode before submitting it. Record that URL together with the Git commit SHA.

## Data model and RLS

- `sidequests`: browser users can select only their own rows. Inserts and public presentation reads use a minimal server-only service-role client.
- `votes`: authenticated users can select, insert, and update only their own rows. A database trigger owns the public counters.
- `generation_attempts`: inaccessible to browser roles and used by an atomic service-role function for quota claims.
- `profiles`: authenticated users can select, insert, and update only their own row.
- `tasks`: RLS enabled with no browser policies because the table is no longer used.

The public UI receives only the generated content, normalized inputs, aggregate counts, and creation date. It does not receive creator IDs, profile records, model prompts, or individual voters.
