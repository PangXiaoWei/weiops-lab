const KEYS = {
  labs: "weiops_completed_labs",
  scenarios: "weiops_completed_scenarios",
  commands: "weiops_favorite_commands",
  expressions: "weiops_favorite_expressions",
  quiz: "weiops_quiz_results",
  notes: "weiops_lab_notes",
  stage: "weiops_current_stage"
};

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function toggle(key, id) {
  const items = read(key, []);
  const next = items.includes(id) ? items.filter(item => item !== id) : [...items, id];
  write(key, next);
  return next;
}

export const storage = {
  keys: KEYS,
  get: read,
  set: write,
  toggle,
  favorites: () => read(KEYS.commands, []),
  expressions: () => read(KEYS.expressions, []),
  labs: () => read(KEYS.labs, []),
  scenarios: () => read(KEYS.scenarios, []),
  quizzes: () => read(KEYS.quiz, []),
  notes: () => read(KEYS.notes, []),
  stage: () => read(KEYS.stage, "阶段一：Linux 基础")
};
