import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { commands, scenarios, expressions } from "../src/data.js";

export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const audioDir = path.join(rootDir, "public", "audio", "en-us", "ops");
export const manifestPath = path.join(rootDir, "public", "audio", "audio-manifest.json");

export function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "ops-audio";
}

export function buildAudioJobs() {
  const staticTexts = [
    ["dashboard-ops-mission-control", "OPS MISSION CONTROL"],
    ["dashboard-weiops-lab", "WeiOps Lab"],
    ["dashboard-professional-incident-training-dashboard", "Professional incident training dashboard"],
    ["start-incident-mission", "Start Incident Mission"],
    ["run-quick-check", "Run Quick Check"],
    ["mission-mode", "MISSION MODE"],
    ["error-cards", "ERROR CARDS"],
    ["english-speaking-drill", "ENGLISH SPEAKING DRILL"],
    ["progress-level", "PROGRESS LEVEL"],
    ["case-flow", "CASE FLOW"],
    ["work-ticket", "WORK TICKET"]
  ];

  const jobs = staticTexts.map(([id, text]) => ({ id, text }));
  commands.forEach(command => {
    jobs.push({ id: `command-name-${command.id}`, text: command.name });
    jobs.push({ id: `command-english-${command.id}`, text: command.english });
  });
  scenarios.forEach(scenario => {
    jobs.push({ id: `scenario-english-${scenario.id}`, text: scenario.english });
  });
  expressions.forEach(item => {
    jobs.push({ id: `expression-${item.id}`, text: item.english });
  });

  const seen = new Set();
  return jobs.filter(job => {
    const slug = slugify(job.id);
    if (seen.has(slug)) return false;
    seen.add(slug);
    return job.text?.trim();
  }).map(job => ({
    ...job,
    slug: slugify(job.id),
    filePath: path.join(audioDir, `${slugify(job.id)}.mp3`),
    publicPath: `audio/en-us/ops/${slugify(job.id)}.mp3`
  }));
}

export function readEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs.readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line && !line.startsWith("#") && line.includes("="))
      .map(line => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

export function writeManifest(jobs) {
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  const items = {};
  jobs.forEach(job => {
    if (fs.existsSync(job.filePath)) {
      items[job.slug] = { text: job.text, path: job.publicPath };
    }
  });
  fs.writeFileSync(manifestPath, `${JSON.stringify({ updatedAt: new Date().toISOString(), mode: "local-mp3-first", items }, null, 2)}\n`);
}
