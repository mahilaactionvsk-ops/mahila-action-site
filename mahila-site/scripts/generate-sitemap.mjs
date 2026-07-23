// Generates dist/sitemap.xml and dist/robots.txt from the same ROUTES list
// used by the prerender script and the <Seo> component — one source of
// truth, so a route added to src/config/routes.ts automatically appears
// (or doesn't, if noindex) in both.
//
// Run this BEFORE scripts/prerender.mjs, since prerender.mjs deletes
// dist-server/ once it's done reading from it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const serverEntry = path.join(root, "dist-server", "entry-server.js");

if (!fs.existsSync(serverEntry)) {
  console.error("dist-server/entry-server.js not found — run `vite build --ssr src/entry-server.tsx --outDir dist-server` first.");
  process.exit(1);
}

const { ROUTES, absoluteUrl, SITE_URL } = await import(`file://${serverEntry}`);

const today = new Date().toISOString().slice(0, 10);

const urlEntries = ROUTES.filter((r) => !r.noindex)
  .map(
    (r) => `  <url>
    <loc>${absoluteUrl(r.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${r.path === "/" ? "1.0" : "0.7"}</priority>
  </url>`
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf8");

const robots = `User-agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`;
fs.writeFileSync(path.join(distDir, "robots.txt"), robots, "utf8");

// GitHub Pages runs everything through Jekyll by default, which ignores
// files/folders starting with "_" — Vite doesn't emit any, but this is the
// standard safety net and costs nothing to include.
fs.writeFileSync(path.join(distDir, ".nojekyll"), "");

console.log(`✔ Wrote sitemap.xml (${ROUTES.filter((r) => !r.noindex).length} URLs), robots.txt, and .nojekyll`);
