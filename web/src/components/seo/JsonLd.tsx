import { serializeJsonLd } from "@/lib/seo/jsonLd";

/**
 * Emits one JSON-LD block. Server-rendered, so the markup is in the HTML a
 * crawler sees on first fetch rather than appearing after hydration.
 *
 * `dangerouslySetInnerHTML` is required — React would escape the JSON into
 * HTML entities and break the parser. serializeJsonLd escapes "<" so page
 * content still cannot close the script tag early.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
