# Twynzo

Production-ready bilingual foundation for **[Twynzo](https://twynzo.com)**, an SEO-first social game platform. V1 ships Would You Rather free play, four decks, the ten-question Daily Majority Challenge, sharing, anonymous global voting, and English/Traditional Chinese content.

## Local development

```bash
git clone <repository-url> twynzo && cd twynzo
npm install
cp .env.example .env.local
# Fill in Supabase URL, service key and a long random ANON_ID_HMAC_SECRET
npx supabase db push
npm run import:questions
# Requires the production inventory (220+ eligible questions):
npm run generate:daily
npm run dev
```

Development free-play uses an honest, process-memory vote store when Supabase is absent. Production refuses this fallback. Daily submissions always require the transactional database functions.

## Architecture and correctness

- App Router server-renders landing copy and 40 question-library entries. Only game, Daily, language switching and analytics hydrate.
- Stable question UUIDs join reviewed `en` and `zh-Hant` localizations to one global total.
- `cast_question_vote` takes a transaction-scoped advisory lock, updates an existing preference rather than duplicating it, and guards non-negative totals.
- `submit_daily_prediction` snapshots the **prior** totals, makes zero/ties unscoreable, records the immutable attempt, then casts the preference. Repeats return the stored attempt.
- Daily identity uses a global UTC date. Streak display uses the player's local calendar date in local storage (`lastCompletedDate`, `currentStreak`, `bestStreak`). Same-day completion cannot increment twice.
- The generator publishes 90 days with 5 general, 3 funny and 2 hard questions and a strict 21-day exclusion. The 40-question development set is intentionally too small; it fails clearly until the documented production minimum of 220 eligible reviewed questions is present.
- APIs validate choices, locale and IDs, keep the service role server-only, and apply lightweight per-instance rate limiting. Anonymous IDs are HttpOnly first-party cookies HMACed before database storage. This deters casual abuse, but clearing cookies and distributed automation remain accepted limitations.

## Quality commands

```bash
npm test
npm run typecheck
npm run build
npm run test:e2e
```

## Supabase production setup

1. Create a Supabase project in the desired region.
2. Install/link the Supabase CLI and run `npx supabase db push`. The migration creates enums, tables, constraints, indexes, RLS policies and locked-down transaction functions. No dashboard table setup is needed.
3. Put the project URL, anon key, service-role key and a randomly generated HMAC secret in `.env.local`. Never prefix server secrets with `NEXT_PUBLIC_`.
4. Run `npm run import:questions`. Validation rejects duplicate keys/content, missing translations/options, invalid categories/locales/difficulty and overlong text.
5. Expand controlled source inventory to at least 220 daily-eligible reviewed bilingual questions, then run `npm run generate:daily`. Run this during a trusted release/cron process to keep at least 90 future UTC days scheduled.

The public anon role has read-only access to reviewed published content. It cannot directly write votes, totals or predictions. All writes go through Next server endpoints using the service role and database transactions.

## Vercel and domain deployment

1. Import this repository into Vercel with the Next.js framework preset.
2. Add every `.env.example` variable. Set `NEXT_PUBLIC_SITE_URL=https://twynzo.com`, use production Supabase credentials, use a long random `ANON_ID_HMAC_SECRET`, and leave ads off.
3. Run the production build and deploy. Vercel supplies HTTPS automatically after DNS verification.
4. Add both `twynzo.com` and `www.twynzo.com` in **Project → Domains**. Point the registrar records to Vercel as instructed. Keep `twynzo.com` primary; `next.config.ts` permanently redirects `www` to the canonical apex host.
5. Confirm `/sitemap.xml`, `/robots.txt`, all canonical links and both hreflang counterparts resolve on HTTPS before launch.

Static SEO shells are cache-friendly; vote routes are dynamic/no-store and return fresh totals. Hash states (`#daily`, `#party`) do not generate routes or alter canonicals.

## GA4, consent and Search Console

GA4 is disabled when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is empty. When enabled, the abstraction supports game, deck, Daily, share, party and language events; it never sends UUIDs, hashes, IPs or personal data. If the deployment jurisdiction requires consent, leave the ID unset until consent and load the isolated analytics component only after it is granted.

1. Create a GA4 web data stream for `https://twynzo.com` and set its measurement ID in Vercel.
2. Verify events in DebugView/Realtime, then republish.
3. Add a Google Search Console **Domain property** for `twynzo.com` and add the supplied DNS TXT record at the registrar.
4. Submit `https://twynzo.com/sitemap.xml`, inspect the root plus representative English and Chinese URLs, and monitor indexing/canonical selection.

## Measurement plan

- SEO: organic sessions.
- Activation: `game_start / SEO landing sessions`.
- Engagement: questions answered per session.
- Retention: Daily return rate.
- Viral: `share_click / daily_complete`.
- Key conversion: `daily_complete`.

## Launch checklist and assumptions

- Replace the development inventory with 300+ human-reviewed bilingual questions (220+ Daily eligible) before active SEO promotion.
- Have counsel review Privacy and Terms for the operating entity/jurisdiction; the pages accurately describe the technical V1 but are marked as launch templates.
- Keep ads disabled initially. `AdSlot` renders nothing unless enabled and must only be placed outside gameplay controls.
- Party mode is feature-configured for the single-device hash flow; no rooms, accounts, sockets or user content exist.
- Run accessibility, mobile browser and production Supabase smoke checks after deployment, and rotate exposed credentials immediately if ever leaked.
