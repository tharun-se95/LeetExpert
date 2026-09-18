import { z } from "zod";
import { COURSE_SLUGS } from "./knownIds";
import { MARK_BATCH_MAX } from "./types";

export { MARK_BATCH_MAX };
export const DRAFT_MAX_BYTES = 65536;

const encoder = new TextEncoder();

export const marksBatchSchema = z.object({
  course: z.enum(COURSE_SLUGS),
  marks: z
    .array(z.object({ kind: z.enum(["visited", "solved"]), id: z.string().min(1).max(200) }))
    .min(1)
    .max(MARK_BATCH_MAX),
});

export const draftPutSchema = z.object({
  lang: z.enum(["python", "javascript"]),
  // The column CHECK counts bytes, so this must too: 65536 characters of
  // non-ASCII code would pass a length check and then fail the insert.
  code: z.string().refine((s) => encoder.encode(s).length <= DRAFT_MAX_BYTES, "draft too large"),
  updatedAt: z.iso.datetime(),
  baseRev: z.number().int().min(0),
  deleted: z.boolean(),
});

export type DraftPutBody = z.infer<typeof draftPutSchema>;
