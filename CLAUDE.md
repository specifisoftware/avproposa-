# AVProposal

AV (Audio/Video) proposal generator. Users log in, fill a form, and download a PDF.

## Stack

- **Next.js 14** — App Router, TypeScript, Tailwind CSS
- **Supabase** (`@supabase/ssr`) — auth + proposals/blog/faq/banners tables
- **Cloudflare R2** — company logo + equipment photo storage (S3-compatible)
- **html2canvas + jsPDF** — client-side PDF generation

## Project structure

```
app/
  page.tsx                    # Marketing landing / home page (public)
  auth/page.tsx               # Login / Register (public)
  proposal/page.tsx           # Main proposal form + live preview (protected)
  lander/page.tsx             # Placeholder lander page
  blog/page.tsx               # Blog index (public)
  blog/[slug]/page.tsx        # Blog post detail (public)
  faq/page.tsx                # FAQ hub index (public)
  faq/[slug]/page.tsx         # FAQ item detail (public)
  faq/FAQHub.tsx              # FAQ hub client component
  faq/[slug]/CopyLinkButton.tsx
  sitemap.ts                  # Auto-generated sitemap
  layout.tsx                  # Root layout
  api/upload/route.ts         # POST: upload logo to Cloudflare R2
  api/proposals/route.ts      # GET: count today's proposals | POST: record download
  admin/layout.tsx            # Admin shell: auth guard (is_admin), sidebar nav
  admin/page.tsx              # Redirect → /admin/users
  admin/users/page.tsx        # User management
  admin/blog/page.tsx         # Blog post list + create
  admin/blog/[id]/page.tsx    # Blog post editor
  admin/banners/page.tsx      # Side-banner management
  admin/faq/page.tsx          # Q&A item list + create + bulk upload modal
  admin/faq/[id]/page.tsx     # Q&A item editor
  admin/faq/categories/page.tsx # FAQ category management
components/
  Navbar.tsx                  # Top bar — logo, user email, daily limit badge, logout
  ProposalPreview.tsx         # Right-side live preview (also captured for PDF); renders Classic or Modern template
  RoomCard.tsx                # Per-room card with equipment rows + per-item photo upload
  BlogIframe.tsx              # Renders blog post HTML+CSS in a sandboxed iframe
  SideBanner.tsx              # Displays an R2-hosted banner image with optional link
lib/
  supabase.ts                 # createClient() — browser Supabase client via @supabase/ssr
types/
  proposal.ts                 # ProposalData, Room, EquipmentItem, ProposalTemplate, CURRENCIES + helpers
  blog.ts                     # BlogPost type
  qa.ts                       # QAItem type
middleware.ts                 # Auth guard: /proposal and /admin require session
supabase/migrations/
  001_create_proposals.sql    # proposals table + RLS
  002_admin_blog.sql          # blog_posts table + profiles.is_admin
  003_banners.sql             # banners table
  004_blog_cover_image.sql    # adds cover_image to blog_posts
  005_qa_hub.sql              # qa_items table
  006_qa_categories.sql       # qa_categories table
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

Run all migrations in `supabase/migrations/` in order (001 → 006) in the Supabase SQL Editor.

Key tables:
- `proposals` — download events only (id, user_id, created_at, date); no proposal content persisted
- `profiles` — one row per user; `is_admin: boolean` gates the admin panel
- `blog_posts` — title, slug, html_content, css_content, cover_image, published
- `banners` — image_url, link_url for SideBanner ads
- `qa_items` — question, slug, answer, category, published, position
- `qa_categories` — category definitions for FAQ hub

RLS policies are enabled — users can only read/insert their own rows. Admin routes check `profiles.is_admin` client-side in `admin/layout.tsx`.

**Important:** Disable "Confirm email" in Supabase → Authentication → Providers → Email for easier onboarding.

## Cloudflare R2 setup

- Bucket name: `avproposal`
- Public Development URL enabled → `https://pub-80a2efeab35a40eaa2cf45b2bd84fb0e.r2.dev`
- API Token permissions: Object Read & Write on `avproposal` bucket

Logo and equipment photo uploads use base64 for instant local preview, then upload to R2 in the background. Banner images are also stored in R2.

**html2canvas caveat:** `objectFit` CSS is not supported by html2canvas. For images that must render correctly in the PDF, use a fixed-size flex wrapper (`display:flex, alignItems:center, justifyContent:center`) with `maxWidth/maxHeight` on the `<img>` instead of `objectFit`.

## Daily limit logic

- Free tier: 1 PDF download per user per day
- On download: POST `/api/proposals` inserts a row (server enforces limit with 429)
- If limit reached: Download button is replaced with "Upgrade to Specifi" CTA
- Limit badge in navbar updates live

## PDF generation

html2canvas captures `#proposal-preview` div at 2× scale, jsPDF converts to A4.
Multi-page support: canvas is split across pages if content exceeds one page height.

The preview is cloned into an off-screen container at exactly 794 px (A4 at 96 dpi) before capture so scroll position and panel width never affect the output.

## Proposal templates

Two templates selectable per proposal in the form:

- **Classic** — white background, blue/purple gradient accent line, blue-bordered "Prepared For" block, dark navy Grand Total box.
- **Modern** — full-width dark navy header (logo left, PROPOSAL right), blue/purple gradient bar, "Prepared For" in a blue-tinted card, dark room header rows with cyan totals, blue gradient Grand Total box, signature lines, dark footer.

`ProposalPreview.tsx` exports a single default component that switches between `ClassicPreview` and `ModernPreview` based on `data.template`.

Template is stored in `ProposalData.template: ProposalTemplate` ('classic' | 'modern').

## Equipment photos

Each `EquipmentItem` has an optional `imageUrl?: string`. In `RoomCard`, a camera-icon button opens a file picker per row; the image is previewed instantly via base64 and uploaded to R2 in the background.

In the preview/PDF, photos render as **200×200 px** flex-wrapper + `maxWidth/maxHeight` (not `objectFit`) so they display correctly in html2canvas. The photo column is only shown when at least one item in any room has a photo (`hasAnyPhoto` flag).

## Currency

`ProposalData.currency: string` (default `'USD'`). The `CURRENCIES` constant in `types/proposal.ts` lists the supported options: USD, EUR, GBP, AED, AZN, CAD, AUD, SAR, QAR, TRY.

`formatCurrency(amount, currency?)` uses `Intl.NumberFormat` with the selected currency code. All prices in the form sidebar, live preview, and PDF reflect the selected currency.

## Admin panel

Protected by `admin/layout.tsx` — checks `profiles.is_admin`; redirects to `/auth` if not logged in or `/proposal` if not admin. Sidebar nav includes: Users, Blog Posts, Banners, Q&A Hub, Categories.

## Blog

Blog posts store raw HTML + CSS (authored in the admin editor). `BlogIframe.tsx` renders them in a sandboxed iframe to isolate styles. Posts have a `cover_image` (R2 URL) and a `published` flag.

## FAQ / Q&A Hub

Q&A items have a slug, category, position (for ordering), and `published` flag. Categories are managed separately. Public pages live at `/faq` and `/faq/[slug]`.

### Bulk upload

The admin FAQ list page (`/admin/faq`) has a **Bulk Upload** button that opens a modal supporting CSV and TXT (tab- or pipe-separated) files. The parser:
- Auto-detects a header row and maps columns by name (`question`/`title`/`q`, `answer`/`a`, `category`/`cat`/`tag`), falling back to positional order (col 1, 2, 3)
- Shows a live preview table with per-row include/exclude checkboxes before inserting
- Auto-generates slugs via `slugify()` and increments on collision with existing slugs
- Lets the admin set published/draft status for all imported rows in one toggle

Expected CSV format:
```
question,answer,category
"How does X work?","It works by doing Y","General"
```

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
- **Home / Blog / Auth / FAQ** — single-column on mobile, expand at `sm:` / `lg:`.

When adding any new page or component, verify it on a 375 px viewport before committing.

## Deployment

GitHub repo: `https://github.com/specifisoftware/avproposa-`
Hosting: Vercel (auto-deploys on push to `main`)

## Sitemap

`app/sitemap.ts` — dynamically generated, `revalidate = 0`.

| URL pattern | changeFrequency | priority |
|---|---|---|
| `/` | weekly | 1.0 |
| `/blog` | weekly | 0.8 |
| `/faq` | weekly | 0.8 |
| `/blog/[slug]` | monthly | 0.7 |
| `/faq/[slug]` | weekly | 0.8 |
