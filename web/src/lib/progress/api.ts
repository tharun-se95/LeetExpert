import { z } from "zod";
import type { DraftPutBody } from "./schemas";
import type { MarkKind, MarksSnapshot, ServerDraft, ServerDrafts } from "./types";

export interface SendOpts {
  keepalive?: boolean;
}

export type PutOutcome =
  | { kind: "ok"; rev: number }
  | { kind: "conflict"; server: ServerDraft }
  | { kind: "error"; status: number };

export class TransportError extends Error {
  constructor(readonly status: number) {
    super(`progress request failed: ${status}`);
  }
}

export interface Transport {
  getMarks(course: string): Promise<MarksSnapshot>;
  postMarks(course: string, marks: { kind: MarkKind; id: string }[], opts?: SendOpts): Promise<number>;
  getDrafts(sandboxId: string): Promise<ServerDrafts>;
  putDraft(sandboxId: string, body: DraftPutBody, opts?: SendOpts): Promise<PutOutcome>;
}

// Responses are parsed, not cast: a server bug should fail loudly here
// rather than write a malformed value into localStorage.
const serverDraft = z.object({ code: z.string(), updatedAt: z.string(), rev: z.number(), deleted: z.boolean() });
const snapshot = z.object({ visited: z.array(z.string()), solved: z.array(z.string()), hasDrafts: z.boolean() });
const drafts = z.object({ python: serverDraft.optional(), javascript: serverDraft.optional() });
const putOk = z.object({ rev: z.number() });
const conflict = z.object({ server: serverDraft });

async function send(url: string, init: RequestInit): Promise<Response | null> {
  try {
    return await fetch(url, { credentials: "same-origin", cache: "no-store", ...init });
  } catch {
    return null;
  }
}

function jsonInit(method: string, body: unknown, opts?: SendOpts): RequestInit {
  return {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    // keepalive lets the hide-flush outlive a closing tab.
    keepalive: opts?.keepalive ?? false,
  };
}

export const httpTransport: Transport = {
  async getMarks(course) {
    const res = await send(`/api/progress?course=${encodeURIComponent(course)}`, {});
    if (!res?.ok) throw new TransportError(res?.status ?? 0);
    return snapshot.parse(await res.json());
  },
  async postMarks(course, marks, opts) {
    const res = await send("/api/progress", jsonInit("POST", { course, marks }, opts));
    return res?.status ?? 0;
  },
  async getDrafts(sandboxId) {
    const res = await send(`/api/progress/drafts/${encodeURIComponent(sandboxId)}`, {});
    if (!res?.ok) throw new TransportError(res?.status ?? 0);
    return drafts.parse(await res.json());
  },
  async putDraft(sandboxId, body, opts) {
    const res = await send(`/api/progress/drafts/${encodeURIComponent(sandboxId)}`, jsonInit("PUT", body, opts));
    if (!res) return { kind: "error", status: 0 };
    try {
      if (res.status === 200) return { kind: "ok", rev: putOk.parse(await res.json()).rev };
      if (res.status === 409) return { kind: "conflict", server: conflict.parse(await res.json()).server };
    } catch {
      // A failed body read or a malformed response body is the same problem
      // as a dropped connection from the queue's point of view: retry later,
      // don't treat the draft as sent.
      return { kind: "error", status: 0 };
    }
    return { kind: "error", status: res.status };
  },
};
