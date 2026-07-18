/**
 * Transcribes each chapter's voiceover with ElevenLabs Scribe (word-level
 * timestamps), locates every scene's anchor phrase in the transcript, and
 * writes a timing JSON the composition imports. Any anchor that can't be
 * found fails the script loudly — no silent drift back to guesswork.
 *
 * Run: set -a && source .env.local && set +a && node --experimental-strip-types generate-transcript.ts
 */
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const __dirname = import.meta.dirname;

type ScribeWord = {
  text: string;
  type: "word" | "spacing" | "audio_event";
  start: number;
  end: number;
};

type ChapterConfig = {
  id: string;
  audio: string;
  outDir: string;
  /**
   * One anchor per scene, in order. `null` = scene starts at audio start.
   * Each anchor is the first few words of the narration slice the scene
   * visualizes, in plain lowercase without punctuation.
   */
  anchors: (string | null)[];
};

const CHAPTERS: ChapterConfig[] = [
  {
    id: "ch01",
    audio: "public/voiceover/ch01-solving-problems.mp3",
    outDir: "src/compositions/ch01",
    anchors: [
      null, // S01 title storm — from the top
      "until you notice", // S02 freeze + crosshair
      "strong solvers", // S03 pipeline whip
      "understand the problem", // S04 crush
      "try the brute force", // S05 sluggish loader
      "then observe", // S06 double work
      "thats almost always", // S07 choke point
      "once you spot the waste", // S08 choose your weapon
      "need instant lookup", // S09 map flash
      "need the best contiguous", // S10 window whip
      "lets try it", // S11 two sum slam
      "brute force check every pair", // S12 pair storm
      "for a hundred thousand", // S13 counter
      "the bottleneck for each number", // S14 question bubbles
      "a hash map answers", // S15 map snap
      "one pass and youre done", // S16 one-pass sweep
      "heres the trap", // S17 alarm
      "a problem can sound", // S18 glitch window
      "two sums answer", // S19 broken arc
      "match the bottleneck", // S20 distill
      "master this", // S21 zoom out
    ],
  },
  {
    id: "family7",
    audio: "public/voiceover/family7-priority-structures.mp3",
    outDir: "src/compositions/family7",
    anchors: [
      null, // 01 title storm — from the top
      "five different rules", // 02 rule hook
      "nail the rule", // 03 rule click / tear reveal
      "first a stack of plates", // 04 plates form
      "last one down", // 05 plate drop completes LIFO
      "feed it left paren", // 06 symbols feed in
      "counts match", // 07 count check
      "but a stack catches", // 08 order broken X
      "it remembers what's still open", // 09 stack resolves empty
      "next a lunch line", // 10 line forms
      "first kid in", // 11 front served
      "no cutting", // 12 no cutting beat
      "perfect for anything", // 13 use-case icons
      "first come first served", // 14 fifo exit
      "then a trophy shelf", // 15 shelf forms
      "it only ever shows", // 16 top = best
      "a new challenger", // 17 challenger enters
      "not fight the whole crowd", // 18 weakest knocked out
      "that's how you grab", // 19 sort X + heap glow
      "now the sneaky one", // 20 mono row forms
      "a taller kid steps in", // 21 taller steps in
      "and every shorter kid", // 22 shorters waiting
      "finally learns their answer", // 23 pop resolve
      "one pass", // 24 sweep done
      "last a family tree", // 25 trie tree forms
      "words that start the same", // 26 shared branch
      "walk one letter at a time", // 27 walk highlight
      "stops being a full dictionary", // 28 full scan X
      "it's just a walk down one path", // 29 single path lit
      "five rules five shapes", // 30 recap row
      "match the shape", // 31 match shape
      "and the answer's already there", // 32 final stamp
    ],
  },
  {
    id: "family3-sorting",
    audio: "public/voiceover/family3-sorting.mp3",
    outDir: "src/compositions/family3-sorting",
    anchors: [
      null, // 01 hook — from the top
      "take merge intervals", // 02 problem setup
      "one to three", // 03 messy blocks appear
      "glue anything that overlaps", // 04 overlap zones highlighted
      "the naive move", // 05 crisscross comparison web
      "ten intervals thats forty five", // 06 45 pairs counter
      "ten thousand intervals thats fifty million", // 07 50M dramatic counter
      "the real problem isnt the overlaps", // 08 cant see neighbors
      "until the list is in order", // 09 blocks start aligning
      "so sort by start time", // 10 sort snap
      "overlaps can only ever happen between neighbors", // 11 adjacent pairs glow
      "walk the sorted list once", // 12 walking cursor
      "if the next block starts before", // 13 first merge fuse
      "if not start a new one", // 14 gap + new block
      "one pass and youre done", // 15 final merged result
      "that single habit sort once then scan", // 16 sort->scan pipeline stamp
      "group anagrams", // 17 anagram key
      "find two numbers that add up to a target", // 18 two-pointer converge
      "even sort colors is really this", // 19 3-color shuffle
      "give order a chance", // 20 3-color partition sweep
      "two ways this trick gets misused", // 21 warning intro
      "sorting when a hash map already answers", // 22 wasted-sort setup
      "you just paid an n log n", // 23 wasted n log n tag
      "confusing this with binary search", // 24 different chapter intro
      "whats the smallest speed", // 25 koko-style example
      "isnt sort then scan", // 26 not sort-then-scan
      "thats guessing on a yes or no staircase", // 27 staircase redirect
      "the real skill isnt memorizing", // 28 crossed-out algorithm icon
      "a wall of pairwise comparisons collapses", // 29 web collapses into order
    ],
  },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function transcribe(audioPath: string): Promise<ScribeWord[]> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("Missing ELEVENLABS_API_KEY environment variable.");
    process.exit(1);
  }

  const buf = readFileSync(audioPath);
  const form = new FormData();
  form.append("file", new Blob([buf], { type: "audio/mpeg" }), path.basename(audioPath));
  form.append("model_id", "scribe_v1");
  form.append("timestamps_granularity", "word");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`Scribe failed: ${response.status} ${await response.text()}`);
  }

  const json = (await response.json()) as { words: ScribeWord[] };
  return json.words.filter((w) => w.type === "word");
}

/**
 * Matches the anchor against the concatenated character stream starting at
 * each word, so transcription quirks like "hash map" → "HashMap" (or the
 * reverse) can't break a match. A match only requires that the anchor's
 * normalized characters line up starting exactly at word `i`.
 */
function findAnchorStart(words: ScribeWord[], anchor: string, searchFrom: number): number {
  const target = normalize(anchor);
  for (let i = searchFrom; i < words.length; i++) {
    let acc = "";
    for (let j = i; j < words.length && acc.length < target.length; j++) {
      acc += normalize(words[j].text);
    }
    if (acc.startsWith(target)) return i;
  }
  return -1;
}

async function run() {
  for (const chapter of CHAPTERS) {
    const audioPath = path.join(__dirname, chapter.audio);
    console.log(`Transcribing ${chapter.id}...`);
    const words = await transcribe(audioPath);
    console.log(`  ${words.length} words, ${words[words.length - 1].end.toFixed(2)}s`);

    const sceneStartSec: number[] = [];
    let cursor = 0;
    for (const [i, anchor] of chapter.anchors.entries()) {
      if (anchor === null) {
        sceneStartSec.push(0);
        continue;
      }
      const idx = findAnchorStart(words, anchor, cursor);
      if (idx === -1) {
        const around = words
          .slice(Math.max(0, cursor - 3), cursor + 25)
          .map((w) => w.text)
          .join(" ");
        throw new Error(
          `${chapter.id} scene ${i + 1}: anchor "${anchor}" not found after word ${cursor}. Context: …${around}…`,
        );
      }
      sceneStartSec.push(words[idx].start);
      cursor = idx + 1;
      console.log(
        `  S${String(i + 1).padStart(2, "0")} @ ${words[idx].start.toFixed(2)}s  "${anchor}"`,
      );
    }

    const timing = {
      audioEndSec: words[words.length - 1].end,
      sceneStartSec,
    };
    writeFileSync(
      path.join(__dirname, chapter.outDir, "timing.json"),
      JSON.stringify(timing, null, 2),
    );
    writeFileSync(
      path.join(__dirname, chapter.outDir, "transcript.json"),
      JSON.stringify(words, null, 2),
    );
    console.log(`  wrote ${chapter.outDir}/timing.json`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
