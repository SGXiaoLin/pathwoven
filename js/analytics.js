/**
 * Vercel Web Analytics + Speed Insights for static HTML (no Next/React).
 *
 * Equivalent of:
 *   import { Analytics } from "@vercel/analytics/next"
 *   import { SpeedInsights } from "@vercel/speed-insights/next"
 *
 * Enable both in the Vercel dashboard, then redeploy so these routes exist:
 *   /_vercel/insights/script.js
 *   /_vercel/speed-insights/script.js
 */

function onVercelHost() {
  return /\.vercel\.app$/i.test(location.hostname);
}

function ensureQueue(globalName, queueName) {
  window[globalName] =
    window[globalName] ||
    function () {
      (window[queueName] = window[queueName] || []).push(arguments);
    };
}

function appendScript(src, sdkName) {
  if (document.querySelector(`script[src="${src}"]`)) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = src;
  script.dataset.sdkn = sdkName;
  script.onerror = () => {
    console.info(
      `[Vercel] Failed to load ${src}. Enable the feature in the Vercel dashboard and redeploy.`,
    );
  };
  document.head.appendChild(script);
}

function injectAnalytics() {
  if (typeof window === "undefined") return;
  ensureQueue("va", "vaq");
  const src = onVercelHost()
    ? "/_vercel/insights/script.js"
    : "https://cdn.vercel-insights.com/v1/script.debug.js";
  appendScript(src, "@vercel/analytics/html");
}

function injectSpeedInsights() {
  if (typeof window === "undefined") return;
  ensureQueue("si", "siq");
  const src = onVercelHost()
    ? "/_vercel/speed-insights/script.js"
    : "https://cdn.vercel-insights.com/v1/speed-insights/script.js";
  appendScript(src, "@vercel/speed-insights/html");
}

/** Optional Analytics custom event helper. */
export function trackEvent(name, data = {}) {
  if (typeof window.va === "function") {
    window.va("event", { name, data });
  }
}

injectAnalytics();
injectSpeedInsights();
