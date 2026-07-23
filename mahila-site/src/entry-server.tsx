import { StaticRouter } from "react-router";
import { renderToString } from "react-dom/server";
import App from "./app/App";
import { BASE_PATH, SITE_NAME } from "./config/site";
import { getRouteMeta, absoluteUrl, ogImageUrl, ROUTES } from "./config/routes";
import { getPageJsonLd } from "./lib/jsonld";

const basename = BASE_PATH === "/" ? undefined : BASE_PATH.replace(/\/$/, "");

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function buildHead(pathname: string): string {
  const meta = getRouteMeta(pathname);
  const jsonLdBlocks = getPageJsonLd(meta);

  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="robots" content="${meta.noindex ? "noindex, nofollow" : "index, follow"}" />`,
    `<link rel="canonical" href="${absoluteUrl(meta.path)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${absoluteUrl(meta.path)}" />`,
    `<meta property="og:image" content="${ogImageUrl(meta)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${ogImageUrl(meta)}" />`,
    ...jsonLdBlocks.map((ld) => `<script type="application/ld+json">${JSON.stringify(ld)}</script>`),
  ];
  return tags.join("\n    ");
}

export function render(url: string) {
  const location = basename ? `${basename}${url === "/" ? "" : url}` : url;
  const html = renderToString(
    <StaticRouter location={location} basename={basename}>
      <App />
    </StaticRouter>
  );
  const head = buildHead(url);
  return { html, head };
}

// Re-exported so scripts/prerender.mjs and scripts/generate-sitemap.mjs can
// reuse the exact same route list + URL builder without hand-maintaining a
// second copy.
export { ROUTES, absoluteUrl };
export { SITE_URL } from "./config/site";
