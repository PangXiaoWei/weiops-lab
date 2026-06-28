import fs from "node:fs";
import { audioDir, buildAudioJobs, readEnvLocal, writeManifest } from "./audio-shared.mjs";

const args = new Map(process.argv.slice(2).map(arg => {
  const [key, value = "true"] = arg.replace(/^--/, "").split("=");
  return [key, value];
}));
const limit = Number(args.get("limit") || 0);
const dryRun = args.has("dry-run");
const env = { ...process.env, ...readEnvLocal() };
const apiKey = env.OPENAI_API_KEY;
const model = env.TTS_MODEL || "gpt-4o-mini-tts";
const voice = env.TTS_VOICE || "marin";
const responseFormat = env.TTS_RESPONSE_FORMAT || "mp3";

const jobs = buildAudioJobs().filter(job => !fs.existsSync(job.filePath));
const selected = limit ? jobs.slice(0, limit) : jobs;

console.log(`Audio jobs selected: ${selected.length}`);
console.log(`Model: ${model}, voice: ${voice}, format: ${responseFormat}`);

if (!apiKey && !dryRun) {
  console.error("OPENAI_API_KEY is missing. Create .env.local first.");
  process.exitCode = 1;
} else {
  fs.mkdirSync(audioDir, { recursive: true });
  for (const job of selected) {
    try {
      if (dryRun) {
        console.log(`DRY ${job.slug}: ${job.text}`);
        continue;
      }
      console.log(`GENERATE ${job.slug}: ${job.text}`);
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          voice,
          input: job.text,
          response_format: responseFormat,
          instructions: "Speak in clear, professional American English. Keep technical terms understandable for an Ops learner."
        })
      });
      if (!response.ok) {
        console.error(`FAILED ${job.slug}: HTTP ${response.status}`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(job.filePath, buffer);
    } catch (error) {
      console.error(`FAILED ${job.slug}: ${error.message}`);
    }
  }
  writeManifest(buildAudioJobs());
}
