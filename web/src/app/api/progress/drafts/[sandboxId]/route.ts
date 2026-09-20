import { handleDraftPut, handleDraftsGet } from "@/lib/progress/handlers";
import { readJson, routeDeps, toResponse } from "@/lib/progress/routeDeps";

type Ctx = { params: Promise<{ sandboxId: string }> };

export async function GET(req: Request, { params }: Ctx): Promise<Response> {
  const { sandboxId } = await params;
  return toResponse(await handleDraftsGet(sandboxId, await routeDeps(req)));
}

export async function PUT(req: Request, { params }: Ctx): Promise<Response> {
  const { sandboxId } = await params;
  return toResponse(await handleDraftPut(sandboxId, await readJson(req), await routeDeps(req)));
}
