import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadArchivoBlack } from "@remotion/google-fonts/ArchivoBlack";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadFiraCode } from "@remotion/google-fonts/FiraCode";

export const { fontFamily: sansFont } = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});

export const { fontFamily: monoFont } = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

/** Heavy poster-grotesk display face for the Brutalist/papercut video system. */
export const { fontFamily: brutalDisplayFont } = loadArchivoBlack("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

/** Body/label face for the Brutalist system — squared, mechanical grotesk. */
export const { fontFamily: brutalBodyFont } = loadSpaceGrotesk("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

/** Heading/label face for the Neon Depth system — same family as brutalBodyFont. */
export const neonSansFont = brutalBodyFont;

/** Code/tag/complexity-annotation face for the Neon Depth system. */
export const { fontFamily: neonCodeFont } = loadFiraCode("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});
