/**
 * Lightweight branching-story engine.
 * Story = node graph; player state = nodeId + vars + history.
 */

export function createInitialVars(story) {
  const vars = {};
  for (const [key, def] of Object.entries(story.variables || {})) {
    vars[key] = def.default;
  }
  return vars;
}

export function createNewState(story) {
  return {
    storyId: story.id,
    storyVersion: story.version,
    nodeId: story.startNodeId,
    vars: createInitialVars(story),
    history: [story.startNodeId],
    choiceLog: [],
    ended: false,
    endingKey: null,
    updatedAt: new Date().toISOString(),
  };
}

function clampNumber(story, key, value) {
  const def = story.variables?.[key];
  if (!def || def.type !== "number") return value;
  let n = Number(value);
  if (Number.isNaN(n)) n = def.default ?? 0;
  if (typeof def.min === "number") n = Math.max(def.min, n);
  if (typeof def.max === "number") n = Math.min(def.max, n);
  return n;
}

export function checkRequires(vars, requires = []) {
  return requires.every((rule) => {
    const left = vars[rule.key];
    switch (rule.op) {
      case "eq":
        return left === rule.value;
      case "neq":
        return left !== rule.value;
      case "gt":
        return left > rule.value;
      case "gte":
        return left >= rule.value;
      case "lt":
        return left < rule.value;
      case "lte":
        return left <= rule.value;
      case "truthy":
        return Boolean(left);
      default:
        console.warn("Unknown require op:", rule.op);
        return false;
    }
  });
}

export function applyEffects(story, vars, effects = []) {
  const next = { ...vars };
  for (const effect of effects) {
    switch (effect.op) {
      case "set":
        next[effect.key] =
          typeof effect.value === "number"
            ? clampNumber(story, effect.key, effect.value)
            : effect.value;
        break;
      case "add":
        next[effect.key] = clampNumber(
          story,
          effect.key,
          (Number(next[effect.key]) || 0) + Number(effect.value),
        );
        break;
      case "flag":
        next[effect.key] = true;
        break;
      default:
        console.warn("Unknown effect op:", effect.op);
    }
  }
  return next;
}

export function resolveNext(choice, vars) {
  if (typeof choice.next === "string") return choice.next;
  if (Array.isArray(choice.next)) {
    for (const branch of choice.next) {
      if (checkRequires(vars, branch.when || [])) return branch.goto;
    }
    if (choice.else) return choice.else;
    throw new Error(`No next branch matched for choice ${choice.id}`);
  }
  throw new Error(`Invalid next for choice ${choice.id}`);
}

export function getNode(story, nodeId) {
  const node = story.nodes[nodeId];
  if (!node) throw new Error(`Missing node: ${nodeId}`);
  return node;
}

export function getVisibleChoices(story, state) {
  const node = getNode(story, state.nodeId);
  if (node.type === "ending" || state.ended) return [];
  return (node.choices || []).filter((c) =>
    checkRequires(state.vars, c.requires || []),
  );
}

export function choose(story, state, choiceId) {
  if (state.ended) throw new Error("Story already ended");
  const node = getNode(story, state.nodeId);
  const choice = (node.choices || []).find((c) => c.id === choiceId);
  if (!choice) throw new Error(`Choice not found: ${choiceId}`);
  if (!checkRequires(state.vars, choice.requires || [])) {
    throw new Error(`Choice locked: ${choiceId}`);
  }

  const vars = applyEffects(story, state.vars, choice.effects || []);
  const nextId = resolveNext(choice, vars);
  const nextNode = getNode(story, nextId);
  const ended = nextNode.type === "ending";

  return {
    ...state,
    vars,
    nodeId: nextId,
    history: [...state.history, nextId],
    choiceLog: [
      ...state.choiceLog,
      { nodeId: node.id, choiceId: choice.id },
    ],
    ended,
    endingKey: ended ? nextNode.endingKey || nextNode.id : null,
    updatedAt: new Date().toISOString(),
  };
}

/** Rebuild readable storyline from history + original node bodies. */
export function buildStoryline(story, state) {
  const lines = [];
  for (let i = 0; i < state.history.length; i++) {
    const node = getNode(story, state.history[i]);
    lines.push(`## ${node.title || node.id}`);
    lines.push(node.body || "");
    const log = state.choiceLog[i];
    if (log) {
      const chosen = (node.choices || []).find((c) => c.id === log.choiceId);
      if (chosen) lines.push(`> You chose: ${chosen.text}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

export function validateStory(story) {
  const errors = [];
  if (!story.id) errors.push("missing id");
  if (!story.startNodeId) errors.push("missing startNodeId");
  if (!story.nodes?.[story.startNodeId]) {
    errors.push(`startNodeId not in nodes: ${story.startNodeId}`);
  }
  for (const [id, node] of Object.entries(story.nodes || {})) {
    if (node.id && node.id !== id) {
      errors.push(`node key/id mismatch: ${id}`);
    }
    for (const choice of node.choices || []) {
      const targets = [];
      if (typeof choice.next === "string") targets.push(choice.next);
      else if (Array.isArray(choice.next)) {
        for (const b of choice.next) targets.push(b.goto);
        if (choice.else) targets.push(choice.else);
      }
      for (const t of targets) {
        if (!story.nodes[t]) errors.push(`dead link ${id}.${choice.id} -> ${t}`);
      }
    }
    if (node.type !== "ending" && (!node.choices || node.choices.length === 0)) {
      errors.push(`non-ending node has no choices: ${id}`);
    }
  }
  return errors;
}

export function saveState(storageKey, state) {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

export function loadState(storageKey, story) {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw);
    if (state.storyId !== story.id || state.storyVersion !== story.version) {
      return null;
    }
    return state;
  } catch {
    return null;
  }
}

export function clearState(storageKey) {
  localStorage.removeItem(storageKey);
}
