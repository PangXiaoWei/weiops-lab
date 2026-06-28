const VOICE_KEY = "weiops_english_voice_enabled";
let currentAudio = null;
let manifestPromise = null;

const pronunciationMap = new Map([
  ["SSH", "S S H"],
  ["DNS", "D N S"],
  ["HTTP", "H T T P"],
  ["HTTPS", "H T T P S"],
  ["IP", "I P"],
  ["CPU", "C P U"],
  ["RAM", "R A M"],
  ["Nginx", "engine x"],
  ["nginx", "engine x"],
  ["systemd", "system D"],
  ["journalctl", "journal control"],
  ["kubectl", "cube control"],
  ["K3s", "K three S"],
  ["K8s", "K eight S"],
  ["DevOps", "Dev Ops"],
  ["CI/CD", "C I C D"],
  ["YAML", "yammel"],
  ["JSON", "jay son"],
  ["sudo", "soo doo"],
  ["chmod", "change mod"],
  ["chown", "change own"],
  ["localhost", "local host"]
]);

export function isVoiceEnabled() {
  return localStorage.getItem(VOICE_KEY) !== "off";
}

export function setVoiceEnabled(enabled) {
  localStorage.setItem(VOICE_KEY, enabled ? "on" : "off");
}

export function stopAudio() {
  try {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    window.speechSynthesis?.cancel();
  } catch {
    // Audio should never block the learning UI.
  }
}

export function normalizeSpeechText(text = "") {
  let output = String(text).replace(/\s+/g, " ").trim();
  pronunciationMap.forEach((spoken, written) => {
    output = output.replace(new RegExp(`\\b${escapeRegExp(written)}\\b`, "g"), spoken);
  });
  return output;
}

export function slugifyAudioId(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "ops-audio";
}

export function opsAudioPath(id) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}audio/en-us/ops/${slugifyAudioId(id)}.mp3`;
}

export async function playAudioOrTTS({ audioPath, text, slow = false } = {}) {
  if (!text || !isVoiceEnabled()) return;
  stopAudio();

  const canUseLocalMp3 = await hasLocalAudio(audioPath);
  if (canUseLocalMp3) {
    try {
      const audio = new Audio(audioPath);
      currentAudio = audio;
      await audio.play();
      return;
    } catch {
      currentAudio = null;
    }
  }

  speakWithWebSpeech(text, slow);
}

async function hasLocalAudio(audioPath) {
  if (!audioPath) return false;
  try {
    const manifest = await loadManifest();
    if (!manifest?.items) return false;
    const normalized = audioPath.replace(/^.*?audio\//, "audio/");
    return Object.values(manifest.items).some(item => item.path === normalized);
  } catch {
    return false;
  }
}

function loadManifest() {
  if (!manifestPromise) {
    const base = import.meta.env.BASE_URL || "/";
    manifestPromise = fetch(`${base}audio/audio-manifest.json`)
      .then(response => response.ok ? response.json() : null)
      .catch(() => null);
  }
  return manifestPromise;
}

function speakWithWebSpeech(text, slow) {
  try {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    const utterance = new SpeechSynthesisUtterance(normalizeSpeechText(text));
    utterance.lang = "en-US";
    utterance.rate = slow ? 0.68 : 0.9;
    utterance.pitch = 1;
    const voices = window.speechSynthesis.getVoices?.() || [];
    const preferred = voices.find(voice =>
      /en-US/i.test(voice.lang) &&
      /(Samantha|Jenny|Aria|Guy|Microsoft|Google|Natural|US)/i.test(voice.name)
    ) || voices.find(voice => /en-US/i.test(voice.lang));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore unavailable speech engines.
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
