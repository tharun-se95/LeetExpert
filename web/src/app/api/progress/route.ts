import { handleMarksGet, handleMarksPost } from "@/lib/progress/handlers";
import { readJson, routeDeps, toResponse } from "@/lib/progress/routeDeps";

export async function GET(req: Request): Promise<Response> {
  const course = new URL(req.url).searchParams.get("course");
  return toResponse(await handleMarksGet(course, await routeDeps(req)));
}

export async function POST(req: Request): Promise<Response> {
  return toResponse(await handleMarksPost(await readJson(req), await routeDeps(req)));
}
