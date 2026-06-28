import fs from "node:fs";
import { buildAudioJobs, writeManifest } from "./audio-shared.mjs";

const jobs = buildAudioJobs();
const missing = jobs.filter(job => !fs.existsSync(job.filePath));
writeManifest(jobs);

console.log(`Audio jobs: ${jobs.length}`);
console.log(`Existing MP3: ${jobs.length - missing.length}`);
console.log(`Missing MP3: ${missing.length}`);
missing.slice(0, 20).forEach(job => console.log(`MISSING ${job.slug}: ${job.text}`));
if (missing.length > 20) console.log(`...and ${missing.length - 20} more`);
