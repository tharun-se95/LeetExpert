import { describe, it, expect } from "vitest";
import {
  breadcrumbLd,
  courseLd,
  learningResourceLd,
  organizationLd,
  serializeJsonLd,
  websiteLd,
} from "../src/lib/seo/jsonLd";
import { SITE_ORIGIN } from "../src/lib/seo/site";
import { MODULES } from "../src/lib/course/manifest";

describe("breadcrumbLd", () => {
  const ld = breadcrumbLd([
    { name: "DSA", path: "/courses/dsa" },
    { name: "Big O", path: "/courses/dsa/big-o" },
  ]);

  it("is a BreadcrumbList", () => {
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("BreadcrumbList");
  });

  // The visible Breadcrumbs component always renders a leading "Home" link,
  // so the markup has to include it or the two disagree.
  it("leads with Home, mirroring the visible trail", () => {
    expect(ld.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Home",
      item: SITE_ORIGIN,
    });
  });

  it("numbers positions from 1 with no gaps", () => {
    expect(ld.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  });

  it("uses absolute URLs, which schema.org requires", () => {
    for (const item of ld.itemListElement) {
      expect(item.item?.startsWith(SITE_ORIGIN)).toBe(true);
    }
  });

  // The Breadcrumbs component builds this straight from its own items, so
  // the trailing crumb (the current page) has no href. Google allows the
  // final item to carry no `item` URL; emitting an empty one would be worse.
  it("omits the item URL for a crumb that has no link", () => {
    const trailing = breadcrumbLd([
      { name: "DSA", path: "/courses/dsa" },
      { name: "Big O" },
    ]).itemListElement;
    expect(trailing[2]).toEqual({
      "@type": "ListItem",
      position: 3,
      name: "Big O",
    });
  });

  it("keeps the crumb labels as their names", () => {
    expect(ld.itemListElement.map((i) => i.name)).toEqual([
      "Home",
      "DSA",
      "Big O",
    ]);
  });
});

describe("organizationLd", () => {
  const ld = organizationLd();

  it("identifies the site as an Organization at the canonical origin", () => {
    expect(ld["@type"]).toBe("Organization");
    expect(ld.url).toBe(SITE_ORIGIN);
    expect(ld.name).toBe("leetExpert");
  });

  it("has a stable @id so other nodes can reference it", () => {
    expect(ld["@id"]).toBe(`${SITE_ORIGIN}/#organization`);
  });
});

describe("websiteLd", () => {
  const ld = websiteLd();

  it("is a WebSite published by the Organization node", () => {
    expect(ld["@type"]).toBe("WebSite");
    expect(ld.url).toBe(SITE_ORIGIN);
    expect(ld.publisher).toEqual({ "@id": `${SITE_ORIGIN}/#organization` });
  });
});

describe("courseLd", () => {
  const ld = courseLd();

  it("is a Course provided by the Organization", () => {
    expect(ld["@type"]).toBe("Course");
    expect(ld.provider).toEqual({ "@id": `${SITE_ORIGIN}/#organization` });
    expect(ld.url).toBe(`${SITE_ORIGIN}/courses/dsa`);
  });

  it("lists every real module as a part, with absolute URLs", () => {
    expect(ld.hasPart).toHaveLength(MODULES.length);
    for (const part of ld.hasPart) {
      expect(part["@type"]).toBe("Course");
      expect(part.url.startsWith(`${SITE_ORIGIN}/courses/dsa/`)).toBe(true);
      expect(part.name.length).toBeGreaterThan(0);
    }
  });

  // Schema must describe what is actually on the page — inventing ratings,
  // prices or enrolment counts we do not display would be misleading markup.
  it("claims no ratings, offers or enrolment figures", () => {
    expect(ld).not.toHaveProperty("aggregateRating");
    expect(ld).not.toHaveProperty("offers");
    expect(ld).not.toHaveProperty("review");
  });
});

describe("learningResourceLd", () => {
  const ld = learningResourceLd({
    name: "Big O",
    description: "About complexity.",
    path: "/courses/dsa/big-o/intro",
    learningResourceType: "Concept lesson",
  });

  it("is a LearningResource belonging to the course", () => {
    expect(ld["@type"]).toBe("LearningResource");
    expect(ld.url).toBe(`${SITE_ORIGIN}/courses/dsa/big-o/intro`);
    expect(ld.isPartOf).toEqual({ "@id": `${SITE_ORIGIN}/courses/dsa#course` });
  });

  it("omits description entirely when there is none, rather than emitting empty", () => {
    const bare = learningResourceLd({
      name: "X",
      path: "/x",
      learningResourceType: "Problem",
    });
    expect(bare).not.toHaveProperty("description");
  });
});

describe("serializeJsonLd", () => {
  // A "</script>" inside any string would otherwise close the tag early and
  // turn page content into markup — the classic JSON-LD injection.
  it("escapes angle brackets so content cannot break out of the script tag", () => {
    const out = serializeJsonLd({ name: "</script><img onerror=x>" });
    expect(out).not.toContain("</script>");
    expect(out).not.toContain("<img");
    expect(out).toContain("\\u003c");
  });

  it("round-trips to the same object", () => {
    const data = { a: 1, b: "two </script>" };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
