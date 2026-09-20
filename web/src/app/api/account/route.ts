import { handleAccountDelete } from "@/lib/progress/handlers";
import { routeDeps, toResponse } from "@/lib/progress/routeDeps";

export async function DELETE(req: Request): Promise<Response> {
  return toResponse(await handleAccountDelete(await routeDeps(req)));
}
