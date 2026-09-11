import { renderOgImage } from "@/lib/seo/ogImage";

export const alt = "leetExpert — Data Structures & Algorithms, taught interactively";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return renderOgImage();
}
