import { describe, it, expect, vi, afterEach } from "vitest";
import {
  handleCoachChat,
  parseCoachRequest,
  isCoachConfigured,
  MAX_CODE_CHARS,
} from "../src/lib/coach/handleChat";
import {
  resolveCoachBackend,
  defaultCoachModel,
  completeCoach,
  ollamaAccessHeaders,
  ollamaAuthHeaders,
  ollamaHost,
} from "../src/lib/coach/provider";
import { MemoryQuota } from "../src/lib/coach/quota";
import { COACH_REFUSE } from "../src/lib/coach/types";
import type { CoachProblem } from "../src/lib/coach/types";
import { readVisitorId, visitorCookieHeader, newVisitorId } from "../src/lib/coach/visitor";

const problem: CoachProblem = {
  sandboxId: "two-sum",
  title: "Two Sum",
  moduleSlug: "hash-tables",
  statement: "Return two indices that add to target.",
  thesis: "Naive is the correct move at these constraints.",
  hints: [{ index: 1, label: "Hint 1", body: "Store what you have seen." }],
  fn: { python: "two_sum", javascript: "twoSum" },
};

function baseBody(over: Record<string, unknown> = {}) {
  return {
    sandboxId: "two-sum",
    lang: "python",
    code: "def two_sum(nums, target):\n    pass\n",
    diagnosis: null,
    messages: [{ role: "user", content: "What pattern is this?" }],
    ...over,
  };
}

function deps(over: Partial<Parameters<typeof handleCoachChat>[1]> = {}) {
  return {
    getProblem: (id: string) => (id === "two-sum" ? problem : null),
    quota: new MemoryQuota(40, () => new Date("2026-08-16T12:00:00Z")),
    visitorId: "v1",
    configured: true,
    sameOrigin: true,
    complete: async () => "Have you considered a set for values you have already seen?",
    ...over,
  };
}

describe("parseCoachRequest", () => {
  it("rejects oversized code", () => {
    const parsed = parseCoachRequest(baseBody({ code: "x".repeat(MAX_CODE_CHARS + 1) }));
    expect(parsed).toMatchObject({ error: expect.stringContaining("8000") });
  });
});

describe("handleCoachChat", () => {
  it("returns a filtered reply on a happy path", async () => {
    const result = await handleCoachChat(baseBody(), deps());
    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.reply).toContain("set for values");
    expect(result.remaining).toBe(39);
  });

  it("returns 503 when unconfigured", async () => {
    const result = await handleCoachChat(baseBody(), deps({ configured: false }));
    expect(result).toMatchObject({ status: 503, code: "coach_unconfigured" });
  });

  it("returns 404 for an unknown sandbox", async () => {
    const result = await handleCoachChat(baseBody({ sandboxId: "nope" }), deps());
    expect(result).toMatchObject({ status: 404, code: "coach_unknown_problem" });
  });

  it("returns 429 when the quota is exhausted", async () => {
    const result = await handleCoachChat(
      baseBody(),
      deps({ quota: new MemoryQuota(0, () => new Date("2026-08-16T12:00:00Z")) }),
    );
    expect(result.status).toBe(429);
    if (result.status !== 429) return;
    expect(result.code).toBe("coach_quota");
    expect(result.resetAt).toBe("2026-08-17T00:00:00.000Z");
  });

  it("returns 400 for oversized input", async () => {
    const result = await handleCoachChat(
      baseBody({ code: "x".repeat(MAX_CODE_CHARS + 1) }),
      deps(),
    );
    expect(result).toMatchObject({ status: 400, code: "coach_bad_request" });
  });

  it("never puts Solution in the prompt sent to the model", async () => {
    let system = "";
    await handleCoachChat(
      baseBody(),
      deps({
        complete: async (sys) => {
          system = sys;
          return "Ask what you would store.";
        },
      }),
    );
    expect(system).toContain("Return two indices");
    expect(system).toContain("Store what you have seen.");
    expect(system).not.toContain("## Solution");
    expect(system).not.toMatch(/reveal Solution/i);
  });

  it("replaces a leaked implementation with the refuse string", async () => {
    const result = await handleCoachChat(
      baseBody(),
      deps({
        complete: async () => "def two_sum(nums, target):\n    return [0, 1]\n",
      }),
    );
    expect(result.status).toBe(200);
    if (result.status !== 200) return;
    expect(result.reply).toBe(COACH_REFUSE);
  });

  it("returns a clean 503 instead of throwing when the model call fails", async () => {
    // A remote/home backend (Ollama over a tunnel) is far more likely to be
    // unreachable than a cloud API. Without this, the throw reaches the
    // client as a JSON-parse error instead of a message a learner can read.
    const result = await handleCoachChat(
      baseBody(),
      deps({
        complete: async () => {
          throw new Error("fetch failed");
        },
      }),
    );
    expect(result).toMatchObject({ status: 503, code: "coach_unavailable" });
  });
});

describe("coach provider", () => {
  it("treats Ollama as configured in development", () => {
    expect(
      isCoachConfigured({
        COACH_PROVIDER: "ollama",
        NODE_ENV: "development",
      }),
    ).toBe(true);
  });

  it("does not treat an empty env as configured", () => {
    expect(isCoachConfigured({ NODE_ENV: "development" })).toBe(false);
  });

  it("defaults the Ollama model to gemma4:cloud", () => {
    expect(
      resolveCoachBackend({ NODE_ENV: "test", COACH_PROVIDER: "ollama" }),
    ).toBe("ollama");
    expect(
      defaultCoachModel({ NODE_ENV: "test", COACH_PROVIDER: "ollama" }),
    ).toBe("gemma4:cloud");
  });

  it("still prefers Anthropic when that key is set and provider is unset", () => {
    expect(
      resolveCoachBackend({ NODE_ENV: "test", ANTHROPIC_API_KEY: "sk-ant" }),
    ).toBe("anthropic");
  });

  it("omits Cloudflare Access headers when unset", () => {
    expect(ollamaAccessHeaders({ NODE_ENV: "test" })).toEqual({});
  });

  it("omits Cloudflare Access headers when only one side is set", () => {
    expect(
      ollamaAccessHeaders({ NODE_ENV: "test", OLLAMA_ACCESS_CLIENT_ID: "cid" }),
    ).toEqual({});
  });

  it("builds Cloudflare Access headers when both are set", () => {
    expect(
      ollamaAccessHeaders({
        NODE_ENV: "test",
        OLLAMA_ACCESS_CLIENT_ID: "cid",
        OLLAMA_ACCESS_CLIENT_SECRET: "csecret",
      }),
    ).toEqual({
      "CF-Access-Client-Id": "cid",
      "CF-Access-Client-Secret": "csecret",
    });
  });

  it("defaults to the local daemon when no key or host is set", () => {
    expect(ollamaHost({ NODE_ENV: "test" })).toBe("http://127.0.0.1:11434");
  });

  it("defaults to Ollama Cloud when an API key is set with no explicit host", () => {
    // gemma4:cloud already runs on Ollama's infrastructure, not the
    // caller's — there is nothing local to default to once a key exists.
    expect(
      ollamaHost({ NODE_ENV: "test", OLLAMA_API_KEY: "key123" }),
    ).toBe("https://ollama.com");
  });

  it("an explicit OLLAMA_HOST still wins over the cloud default", () => {
    expect(
      ollamaHost({
        NODE_ENV: "test",
        OLLAMA_API_KEY: "key123",
        OLLAMA_HOST: "http://127.0.0.1:11434",
      }),
    ).toBe("http://127.0.0.1:11434");
  });

  it("omits the Authorization header when no key is set", () => {
    expect(ollamaAuthHeaders({ NODE_ENV: "test" })).toEqual({});
  });

  it("builds a Bearer Authorization header from OLLAMA_API_KEY", () => {
    expect(
      ollamaAuthHeaders({ NODE_ENV: "test", OLLAMA_API_KEY: "key123" }),
    ).toEqual({ Authorization: "Bearer key123" });
  });

  it("treats an API key alone (no COACH_PROVIDER, no OLLAMA_HOST) as ollama", () => {
    expect(
      resolveCoachBackend({ NODE_ENV: "test", OLLAMA_API_KEY: "key123" }),
    ).toBe("ollama");
  });

  it("calls the cloud host with Bearer auth when only OLLAMA_API_KEY is set", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(
        JSON.stringify({ message: { content: "cloud hi" } }),
        { status: 200 },
      );
    });
    vi.stubGlobal("fetch", fetchMock);

    const reply = await completeCoach("system", [{ role: "user", content: "hi" }], {
      NODE_ENV: "test",
      OLLAMA_API_KEY: "key123",
    });

    expect(reply).toBe("cloud hi");
    expect(calls[0].url).toBe("https://ollama.com/api/chat");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer key123");
  });

  it("sends Access headers and a bounded timeout on the Ollama request", async () => {
    const calls: { url: string; init: RequestInit }[] = [];
    const fetchMock = vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify({ message: { content: "hi" } }), {
        status: 200,
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const reply = await completeCoach("system", [{ role: "user", content: "hi" }], {
      NODE_ENV: "test",
      COACH_PROVIDER: "ollama",
      OLLAMA_HOST: "https://ollama.example.com",
      OLLAMA_ACCESS_CLIENT_ID: "cid",
      OLLAMA_ACCESS_CLIENT_SECRET: "csecret",
    });

    expect(reply).toBe("hi");
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe("https://ollama.example.com/api/chat");
    const headers = calls[0].init.headers as Record<string, string>;
    expect(headers["CF-Access-Client-Id"]).toBe("cid");
    expect(headers["CF-Access-Client-Secret"]).toBe("csecret");
    expect(calls[0].init.signal).toBeInstanceOf(AbortSignal);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });
});

describe("visitor cookie", () => {
  it("round-trips an id through the cookie header", () => {
    const id = newVisitorId();
    const header = visitorCookieHeader(id, true);
    expect(header).toContain("HttpOnly");
    expect(header).toContain("Secure");
    expect(readVisitorId(header)).toBe(id);
    expect(readVisitorId(null)).toBeNull();
  });
});
