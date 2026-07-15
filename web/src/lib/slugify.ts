export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[\/]/g, " ")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
