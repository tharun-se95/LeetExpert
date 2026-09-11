import { renderOgImage } from "@/lib/seo/ogImage";

// Twitter/X does not fall back to og:image on its own — this route is what
// makes a Twitter/X-shared link render a large image card instead of a
// bare-text tweet.
export const alt = "leetExpert — Data Structures & Algorithms, taught interactively";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderOgImage();
}
