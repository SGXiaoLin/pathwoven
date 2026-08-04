import { loadCatalog, playUrl } from "./catalog.js";
import "./analytics.js";

const el = {
  brand: document.querySelector("#brand-name"),
  tagline: document.querySelector("#site-tagline"),
  list: document.querySelector("#story-list"),
  error: document.querySelector("#error"),
  count: document.querySelector("#story-count"),
};

function showError(message) {
  el.error.hidden = !message;
  el.error.textContent = message || "";
}

function renderCard(entry) {
  const available = entry.status === "available";
  const article = document.createElement("article");
  article.className = "story-card" + (available ? "" : " is-soon");

  const tags = (entry.tags || [])
    .map((t) => `<li>${escapeHtml(t)}</li>`)
    .join("");

  article.innerHTML = `
    <div class="story-card-top">
      <p class="story-status">${available ? "Playable" : "Coming Soon"}</p>
      <h2>${escapeHtml(entry.title)}</h2>
      <p class="story-blurb">${escapeHtml(entry.blurb || "")}</p>
    </div>
    <ul class="tag-list">${tags}</ul>
    <div class="story-card-meta">
      <span>${escapeHtml((entry.locale || "en").toUpperCase())}</span>
    </div>
    <div class="story-card-actions"></div>
  `;

  const actions = article.querySelector(".story-card-actions");
  if (available) {
    const play = document.createElement("a");
    play.className = "primary link-btn";
    play.href = playUrl(entry.id);
    play.textContent = "Play Story";
    actions.appendChild(play);
  } else {
    const soon = document.createElement("span");
    soon.className = "soon-label";
    soon.textContent = "Not available yet";
    actions.appendChild(soon);
  }

  return article;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function boot() {
  try {
    const catalog = await loadCatalog();
    el.brand.textContent = catalog.site.name;
    document.title = `${catalog.site.name} — Stories`;
    el.tagline.textContent = catalog.site.tagline || "";

    const available = catalog.stories.filter((s) => s.status === "available");
    el.count.textContent = `${available.length} playable · ${catalog.stories.length} listed`;

    el.list.innerHTML = "";
    for (const entry of catalog.stories) {
      el.list.appendChild(renderCard(entry));
    }
  } catch (err) {
    showError(err.message);
    console.error(err);
  }
}

boot();
