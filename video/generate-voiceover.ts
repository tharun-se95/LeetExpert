import { mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

const __dirname = import.meta.dirname;

const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // "Sarah" — mature, reassuring, confident narration voice

const DEFAULT_MODEL = "eleven_multilingual_v2";
const DEFAULT_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.35 };

// eleven_v3 trades similarity_boost/speed control for inline [audio tags] in
// the script text and a much wider expressive range. Lower stability biases
// toward the more emotionally varied "creative" end of v3's range.
const V3_MODEL = "eleven_v3";
const V3_SETTINGS = { stability: 0.3, use_speaker_boost: true };

const SCENES = [
  { script: "scripts/ch01-solving-problems.txt", out: "ch01-solving-problems.mp3" },
  { script: "scripts/ch02-big-o.txt", out: "ch02-big-o.mp3" },
  { script: "scripts/ch03-pattern-recognition.txt", out: "ch03-pattern-recognition.mp3" },
  {
    script: "scripts/family7-priority-structures.txt",
    out: "family7-priority-structures.mp3",
    model: V3_MODEL,
    voiceSettings: V3_SETTINGS,
  },
  {
    script: "scripts/family3-sorting.txt",
    out: "family3-sorting.mp3",
    model: V3_MODEL,
    voiceSettings: V3_SETTINGS,
  },
];

async function generate() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("Missing ELEVENLABS_API_KEY environment variable.");
    process.exit(1);
  }

  const outDir = path.join(__dirname, "public", "voiceover");
  mkdirSync(outDir, { recursive: true });

  for (const scene of SCENES) {
    const scriptPath = path.join(__dirname, scene.script);
    const text = readFileSync(scriptPath, "utf8").trim();
    const outPath = path.join(outDir, scene.out);

    console.log(`Generating ${scene.out} (${text.split(/\s+/).length} words)...`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: scene.model ?? DEFAULT_MODEL,
          voice_settings: scene.voiceSettings ?? DEFAULT_SETTINGS,
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(
        `ElevenLabs request failed for ${scene.out}: ${response.status} ${errBody}`,
      );
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    writeFileSync(outPath, audioBuffer);
    console.log(`  -> wrote ${outPath} (${(audioBuffer.length / 1024).toFixed(0)} KB)`);
  }

  console.log("Done.");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
