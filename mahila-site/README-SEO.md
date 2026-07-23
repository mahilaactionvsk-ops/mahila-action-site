# Mahila Action — Static SEO Build + Express/SQLite Backend

This documents everything changed from the original Figma-exported app. Read
this before you build or deploy.

## ⚠️ Important: I could not run `npm install` or `npm run build` here

This was written in a sandboxed environment with no network access, so none
of this has been compiled or run. Before you trust it, run locally:

```bash
npm install
npm run build   # runs build:client, build:ssr, build:sitemap, build:prerender in sequence
npm run preview
```

Watch the terminal for TypeScript/build errors and for any
`⚠️ Prerender failed for "/x"` warnings from `scripts/prerender.mjs` — those
name the exact route to fix (usually a component touching `window`/`document`
outside a `useEffect`). Open an issue-style note back to me with the error
and I'll fix it.

## What changed, and why

### 1. Backend: Supabase → Express + SQLite (`/server`)
Per your request, all Supabase auth/DB calls are gone. `/server` is a new
Express API using `better-sqlite3` and a JWT-in-httpOnly-cookie session for
admin auth (`bcryptjs` for password hashing). See `server/README.md` for
setup, endpoints, and the production checklist.

**This must be deployed separately from the frontend** — GitHub Pages only
serves static files, it cannot run Node. Deploy `/server` to Render, Railway,
Fly.io, or a VPS, then set `VITE_API_URL` (frontend) to that URL.

Frontend files that talk to the API:
- `src/lib/api.ts` — thin fetch wrapper (credentials included for the cookie)
- `src/lib/backend.ts` — auth + public form submissions (replaces old `supabase.ts`)
- `src/lib/content.ts`, `src/lib/data.ts` — same exported function names as
  before, so `App.tsx`'s call sites needed almost no changes

### 2. Routing: `page` state → React Router
`App.tsx` used a single `useState<Page>` to switch between page components —
there were no real URLs. It's now driven by `react-router` (`useLocation` /
`useNavigate`), with real routes: `/`, `/about`, `/stories`, `/events`,
`/donate`, `/contact`, `/admin`. The existing page components (`HomePage`,
`AboutPage`, etc.) were kept as-is — only the switching mechanism changed —
so this stayed a fairly surgical edit rather than a full rewrite.

### 3. Static pre-rendering for GitHub Pages (no Next.js)
- `src/entry-client.tsx` — browser entry, hydrates instead of blowing away
  prerendered markup
- `src/entry-server.tsx` — Node/SSR entry, used only at build time
- `scripts/prerender.mjs` — after `vite build` (client) and
  `vite build --ssr` (server bundle), renders every route in
  `src/config/routes.ts` to a real HTML string via `react-dom/server` and
  writes `dist/<route>/index.html`. A route that fails to render falls back
  to the plain client-render shell instead of failing the whole build.
- This is genuinely static: view-source on any built page shows real content
  and meta tags, not an empty `<div id="root">`.

### 4. SEO
- `src/config/routes.ts` — single source of truth for every route's title/
  description/OG image/noindex flag. Add a route here and it automatically
  gets a sitemap entry, prerendered meta tags, and `<Seo>` handling.
- `src/app/components/seo/Seo.tsx` — sets title/description/canonical/OG/
  Twitter/JSON-LD on client-side navigation (keeps meta tags in sync as the
  user clicks around, since it's still an SPA after the first load)
- `src/lib/jsonld.ts` — Organization, WebSite, BreadcrumbList, Article, Event
  structured data helpers
- `scripts/generate-sitemap.mjs` — writes `dist/sitemap.xml`, `dist/robots.txt`
  (with the sitemap URL and `Disallow: /admin`), and `dist/.nojekyll`

### 5. Core Web Vitals / images
- `loading="eager" fetchPriority="high"` on the homepage's main hero image
  (LCP candidate) and page-banner images on other pages; `loading="lazy"
  decoding="async"` on every other image
- `vite.config.ts`: `assetsInlineLimit: 4096` (small images inline, larger
  ones ship as separate cacheable/hashed files), `cssCodeSplit: true`
- Font-flash mitigation already in `index.html` (`size-adjust` fallback face)
- **Not done, and I want to be upfront about it:** the ~44MB of images under
  `src/imports/` are still PNGs, not converted to WebP/AVIF, because that
  needs an image-processing library (`sharp`) I couldn't install here. Once
  you can run `npm install`, the highest-value next step is converting those
  to WebP and re-pointing the `import img... from "@/imports/..."` lines —
  ask me to do this once you've got `npm install` working locally and I can
  write the conversion script and do the import rewiring.

### 6. Accessibility
Most images already had meaningful `alt` text (spot-checked, not exhaustively
audited) — decorative background images correctly use `alt=""` since their
content is conveyed by visible overlaid text. I did not do a full WCAG audit
(keyboard nav, focus states, color contrast, ARIA on custom widgets like the
carousel/modals) — flag specific components if you want those checked.

## Before you deploy — checklist

1. **`src/config/site.ts`** — set `GITHUB_USERNAME` and `GITHUB_REPO` to your
   real values (this drives canonical URLs, sitemap, OG tags, and the Vite
   `base` path all at once)
2. **`server/.env`** — copy from `.env.example`, set a real `JWT_SECRET`,
   `CORS_ORIGIN` (your GH Pages URL), `COOKIE_SECURE=true` once on HTTPS
3. **`.env.local`** (frontend root) — copy from `.env.example`, set
   `VITE_API_URL` to your deployed API
4. Create your admin user: `cd server && npm run create-admin -- "you@org.org" "a-strong-password"`
5. `public/og-default.jpg` and `public/favicon.svg` are placeholders —
   replace with real brand assets
6. Push to `main` — `.github/workflows/deploy.yml` builds and deploys to
   GitHub Pages automatically (set the `VITE_API_URL` repo variable in
   Settings → Secrets and variables → Actions → Variables first)
7. In repo Settings → Pages, set source to "GitHub Actions"

## Known gaps / good next steps

- Image format conversion (PNG → WebP/AVIF) — see above
- Full accessibility audit (contrast, focus rings, ARIA on custom widgets)
- Rate limiting beyond the login endpoint (consider adding to public form
  endpoints too, to deter spam submissions)
- The admin CMS stores images as base64 data URLs directly in SQLite TEXT
  columns (this matches the original Supabase design) — fine for a small
  site, but if the content library grows, moving to real file storage +
  URLs would be better for both DB size and image loading performance
