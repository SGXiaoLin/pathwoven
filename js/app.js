import {
  buildStoryline,
  choose,
  clearState,
  createNewState,
  getNode,
  getVisibleChoices,
  loadState,
  saveState,
  validateStory,
} from "./engine.js";
import {
  getStoryEntry,
  hasSave,
  loadCatalog,
  storageKeyFor,
  storyJsonUrl,
} from "./catalog.js";

const el = {
  brand: document.querySelector("#brand-name"),
  title: document.querySelector("#story-title"),
  meta: document.querySelector("#story-meta"),
  notes: document.querySelector("#content-notes"),
  sceneTitle: document.querySelector("#scene-title"),
  sceneBody: document.querySelector("#scene-body"),
  choices: document.querySelector("#choices"),
  stats: document.querySelector("#stats"),
  endingPanel: document.querySelector("#ending-panel"),
  endingKey: document.querySelector("#ending-key"),
  storyline: document.querySelector("#storyline"),
  btnRestart: document.querySelector("#btn-restart"),
  btnToggleStoryline: document.querySelector("#btn-toggle-storyline"),
  btnNewGame: document.querySelector("#btn-new-game"),
  resumeBanner: document.querySelector("#resume-banner"),
  error: document.querySelector("#error"),
};

let story = null;
let state = null;
let entry = null;

function storyIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id") || params.get("story") || "";
}

function showError(message) {
  el.error.hidden = !message;
  el.error.textContent = message || "";
}

function renderStats() {
  const defs = story.variables || {};
  el.stats.innerHTML = "";
  for (const [key, def] of Object.entries(defs)) {
    const value = state.vars[key];
    const label = document.createElement("li");
    const pretty =
      def.type === "boolean" ? (value ? "Yes" : "No") : String(value);
    label.innerHTML = `<span>${key}</span><strong>${pretty}</strong>`;
    el.stats.appendChild(label);
  }
}

function renderChoices() {
  el.choices.innerHTML = "";
  if (state.ended) return;

  const visible = getVisibleChoices(story, state);
  if (visible.length === 0) {
    showError("No available choices. Check requires / story graph.");
    return;
  }

  for (const choice of visible) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => onChoose(choice.id));
    el.choices.appendChild(btn);
  }
}

function renderEnding() {
  const node = getNode(story, state.nodeId);
  const show = state.ended;
  el.endingPanel.hidden = !show;
  if (!show) {
    el.storyline.hidden = true;
    return;
  }
  el.endingKey.textContent = `Ending: ${node.endingKey || node.id}`;
  el.storyline.textContent = buildStoryline(story, state);
}

function updateResumeBanner() {
  const resumed =
    state.history.length > 1 || state.ended || state.choiceLog.length > 0;
  el.resumeBanner.hidden = !resumed || state.ended;
}

function render() {
  showError("");
  const node = getNode(story, state.nodeId);
  el.sceneTitle.textContent = node.title || node.id;
  el.sceneBody.textContent = node.body || "";
  renderStats();
  renderChoices();
  renderEnding();
  updateResumeBanner();
  el.choices.hidden = state.ended;
}

function persist() {
  saveState(storageKeyFor(story), state);
}

function onChoose(choiceId) {
  try {
    state = choose(story, state, choiceId);
    persist();
    render();
  } catch (err) {
    showError(err.message);
  }
}

function restart() {
  clearState(storageKeyFor(story));
  state = createNewState(story);
  persist();
  el.storyline.hidden = true;
  render();
}

async function boot() {
  const id = storyIdFromQuery();
  if (!id) {
    showError("Missing story id. Open a story from the library.");
    return;
  }

  try {
    const catalog = await loadCatalog();
    el.brand.textContent = catalog.site.name;
    entry = getStoryEntry(catalog, id);

    if (!entry) {
      showError(`Story not found in catalog: ${id}`);
      return;
    }
    if (entry.status !== "available") {
      showError(`Story is not playable yet: ${entry.title}`);
      return;
    }

    const res = await fetch(storyJsonUrl(entry));
    if (!res.ok) throw new Error(`Failed to load story (${res.status})`);
    story = await res.json();

    if (story.id && story.id !== entry.id) {
      console.warn(
        `catalog id (${entry.id}) differs from story.json id (${story.id})`,
      );
    }

    const errors = validateStory(story);
    if (errors.length) {
      throw new Error("Story validation failed:\n" + errors.join("\n"));
    }

    document.title = `${story.title} — ${catalog.site.name}`;
    el.title.textContent = story.title;
    el.meta.textContent = `${(story.locale || entry.locale || "en").toUpperCase()} · v${story.version}`;

    if (entry.contentNotes) {
      el.notes.hidden = false;
      el.notes.textContent = `Content note: ${entry.contentNotes}`;
    }

    const saved = loadState(storageKeyFor(story), story);
    state = saved || createNewState(story);
    if (!saved) persist();
    render();

    // Soft hint if save existed at boot
    if (saved && hasSave(story)) {
      el.resumeBanner.hidden = state.ended;
    }
  } catch (err) {
    showError(err.message);
    console.error(err);
  }
}

el.btnRestart.addEventListener("click", restart);
el.btnNewGame.addEventListener("click", restart);
el.btnToggleStoryline.addEventListener("click", () => {
  el.storyline.hidden = !el.storyline.hidden;
});

boot();
