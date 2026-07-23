// Runs after `vite build` (client) and `vite build --ssr` (server bundle).
// For every route in src/config/routes.ts, renders real HTML via
// react-dom/server and writes it to dist/<route>/index.html so GitHub Pages
// serves actual content-bearing HTML per URL (not just one empty SPA shell).
//
// If a single route throws during renderToString (e.g. a component touches
// `window`/`document` outside a useEffect), that route falls back to the
// plain client-rendered shell instead of failing the whole build — you'll
// see a warning below naming the route to go fix.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const serverDir = path.join(root, "dist-server");

const templatePath = path.join(distDir, "index.html");
if (!fs.existsSync(templatePath)) {
  console.error("dist/index.html not found — run `vite build` before this script.");
  process.exit(1);
}
const template = fs.readFileSync(templatePath, "utf8");

const serverEntry = path.join(serverDir, "entry-server.js");
if (!fs.existsSync(serverEntry)) {
  console.error("dist-server/entry-server.js not found — run `vite build --ssr src/entry-server.tsx --outDir dist-server` first.");
  process.exit(1);
}

const { render, ROUTES } = await import(`file://${serverEntry}`);

let successCount = 0;
let fallbackCount = 0;

for (const route of ROUTES) {
  let html = "";
  let head = "";
  try {
    const result = render(route.path);
    html = result.html;
    head = result.head;
  } catch (err) {
    fallbackCount++;
    console.warn(`⚠️  Prerender failed for "${route.path}" — shipping client-render fallback for this route.`);
    console.warn(`   ${err instanceof Error ? err.message : err}`);
  }

  const finalHtml = template
    .replace("<!--app-head-->", head || "")
    .replace("<!--app-html-->", html || "");

  const outDir = route.path === "/" ? distDir : path.join(distDir, route.path.replace(/^\//, ""));
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), finalHtml, "utf8");
  if (html) successCount++;
}

// GitHub Pages has no server-side rewrites, so unknown/deep-linked paths need
// a 404 that still boots the SPA (client router then decides what to show).
fs.writeFileSync(path.join(distDir, "404.html"), template.replace("<!--app-head-->", "").replace("<!--app-html-->", ""), "utf8");

fs.rmSync(serverDir, { recursive: true, force: true });

console.log(`✔ Prerendered ${successCount}/${ROUTES.length} routes${fallbackCount ? ` (${fallbackCount} used the client-render fallback — see warnings above)` : ""}.`);
