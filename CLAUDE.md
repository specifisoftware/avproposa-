# AVProposal

AV (Audio/Video) proposal generator. Users log in, fill a form, and download a PDF.

## Stack

- **Next.js 14** — App Router, TypeScript, Tailwind CSS
- **Supabase** (`@supabase/ssr`) — auth + proposals table
- **Cloudflare R2** — company logo storage (S3-compatible)
- **html2canvas + jsPDF** — client-side PDF generation

## Project structure

```
app/
  page.tsx              # Login / Register (public route)
  proposal/page.tsx     # Main proposal form + live preview (protected)
  api/upload/route.ts   # POST: upload logo to Cloudflare R2
  api/proposals/route.ts# GET: count today's proposals | POST: record download
components/
  Navbar.tsx            # Top bar — logo, user email, daily limit badge, logout
  ProposalForm.tsx      # (inline in proposal/page.tsx) — all form sections
  ProposalPreview.tsx   # Right-side live preview (also captured for PDF)
  RoomCard.tsx          # Per-room card with dynamic equipment rows
lib/
  supabase.ts           # createClient() — browser Supabase client via @supabase/ssr
types/
  proposal.ts           # ProposalData, Room, EquipmentItem types + helpers
middleware.ts           # Auth guard: /proposal requires session
supabase/migrations/
  001_create_proposals.sql  # Run in Supabase SQL Editor
```

## Environment variables

```env
# .env.local (never committed)
NEXT_PUBLIC_SUPABASE_URL=https://vobxckeoogpudjrffbwe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

R2_ACCOUNT_ID=d3483a85fb68d76e9885870d35ebd4cb
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=avproposal
R2_PUBLIC_URL=https://pub-80a2efeab35a40eaa2cf45b2bd84fb0e.r2.dev
```

All 7 variables must also be added in **Vercel → Project → Settings → Environment Variables**.

## Local dev

```bash
npm run dev       # starts on http://localhost:3000
npm run build     # production build check
```

After changing `.env.local`, always restart the dev server.

## Supabase setup

Run `supabase/migrations/001_create_proposals.sql` in the Supabase SQL Editor once.

The `proposals` table only tracks **download events** (id, user_id, created_at, date) — proposal content is local React state, not persisted in the database.

RLS policies are enabled — users can only read/insert their own rows.

**Important:** Disable "Confirm email" in Supabase → Authentication → Providers → Email for easier onboarding.

## Cloudflare R2 setup

- Bucket name: `avproposal`
- Public Development URL enabled → `https://pub-80a2efeab35a40eaa2cf45b2bd84fb0e.r2.dev`
- API Token permissions: Object Read & Write on `avproposal` bucket

Logo uploads use base64 for instant local preview, then replace with R2 CDN URL after background upload completes.

## Daily limit logic

- Free tier: 1 PDF download per user per day
- On download: POST `/api/proposals` inserts a row (server enforces limit with 429)
- If limit reached: Download button is replaced with "Upgrade to Specifi" CTA
- Limit badge in navbar updates live

## PDF generation

html2canvas captures `#proposal-preview` div at 2× scale, jsPDF converts to A4.
Multi-page support: canvas is split across pages if content exceeds one page height.

## Mobile-first design

**Mobile-friendliness is a core requirement.** Every page and component must work on screens ≥ 375 px wide.

Rules that must never be broken:
- All layouts use responsive Tailwind breakpoints (`sm:`, `md:`, `lg:`). No fixed pixel widths in layout.
- Touch targets are at least 44 px tall/wide.
- No horizontal overflow — use `overflow-x-auto` on tables/grids that can't reflow.
- Sticky elements account for the mobile navbar height (57 px).

Page-specific behaviour:
- **Proposal builder** — on mobile a Form / Preview tab switcher (`lg:hidden`) lets users toggle between the form and the live preview. The desktop two-column layout is preserved with `lg:flex`.
- **Admin panel** — sidebar is hidden on mobile; a hamburger button in the top bar slides it in as a fixed overlay (`fixed lg:relative`). Links close the drawer on tap.
- **Home / Blog / Auth** — single-column on mobile, expand at `sm:` / `lg:`.

When adding any new page or component, verify it on a 375 px viewport before committing.

## Deployment

GitHub repo: `https://github.com/specifisoftware/avproposa-`
Hosting: Vercel (auto-deploys on push to `main`)
