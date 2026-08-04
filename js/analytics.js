/**
 * Vercel Web Analytics for static HTML (no Next/React).
 * Equivalent of: import { inject } from '@vercel/analytics'; inject();
 *
 * Enable Analytics in the Vercel project dashboard, then redeploy so
 * /_vercel/insights/script.js is available in production.
 */

function inject() {
  if (typeof window === "undefined") return;

  window.va =
    window.va ||
    function () {
      (window.vaq = window.vaq || []).push(arguments);
    };

  const onVercel = /\.vercel\.app$/i.test(location.hostname);

  const src = onVercel
    ? "/_vercel/insights/script.js"
    : "https://cdn.vercel-insights.com/v1/script.debug.js";

  if (document.querySelector(`script[src="${src}"]`)) return;

  const script = document.createElement("script");
  script.defer = true;
  script.src = src;
  script.dataset.sdkn = "@vercel/analytics/html";
  script.onerror = () => {
    console.info(
      "[Vercel Analytics] Script failed to load. Enable Web Analytics in the Vercel dashboard and redeploy.",
    );
  };
  document.head.appendChild(script);
}

/** Optional custom event helper. */
export function trackEvent(name, data = {}) {
  if (typeof window.va === "function") {
    window.va("event", { name, data });
  }
}

inject();
