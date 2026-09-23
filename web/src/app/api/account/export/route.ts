import { handleAccountExport } from "@/lib/progress/handlers";
import { routeDeps, toResponse } from "@/lib/progress/routeDeps";

export async function GET(req: Request): Promise<Response> {
  const res = toResponse(await handleAccountExport(await routeDeps(req)));
  if (res.ok) res.headers.set("content-disposition", 'attachment; filename="leetexpert-data.json"');
  return res;
}
