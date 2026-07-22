import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./app/App";
import "./styles/index.css";

// import.meta.env.BASE_URL reflects Vite's actually-resolved base for the
// current run — "/" in dev, the GitHub Pages repo path in production build —
// so this always matches how the page was really served, unlike importing
// the static BASE_PATH constant (which is production-only).
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || undefined;

const app = (
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);

const rootEl = document.getElementById("root")!;

// Prerendered pages ship real markup inside #root (see scripts/prerender.mjs),
// so hydrate instead of blowing it away with a fresh client render — that's
// what makes this a real static HTML page rather than a blank-shell SPA.
if (rootEl.children.length > 0) {
  hydrateRoot(rootEl, app);
} else {
  createRoot(rootEl).render(app);
}
