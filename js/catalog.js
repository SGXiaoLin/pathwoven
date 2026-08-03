/** Catalog helpers — add stories via stories/catalog.json only. */

export const CATALOG_URL = "./stories/catalog.json";

export async function loadCatalog() {
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error(`Failed to load catalog (${res.status})`);
  const catalog = await res.json();
  if (!catalog?.site || !Array.isArray(catalog.stories)) {
    throw new Error("Invalid catalog.json shape");
  }
  return catalog;
}

export function getStoryEntry(catalog, id) {
  return catalog.stories.find((s) => s.id === id) || null;
}

export function storyJsonUrl(entry) {
  return `./stories/${entry.path.replace(/^\//, "")}`;
}

export function playUrl(storyId) {
  return `./play.html?id=${encodeURIComponent(storyId)}`;
}

export function storageKeyFor(story) {
  return `save:${story.id}:v${story.version}`;
}

export function hasSave(story) {
  try {
    const raw = localStorage.getItem(storageKeyFor(story));
    if (!raw) return false;
    const state = JSON.parse(raw);
    return state?.storyId === story.id && state?.storyVersion === story.version;
  } catch {
    return false;
  }
}
