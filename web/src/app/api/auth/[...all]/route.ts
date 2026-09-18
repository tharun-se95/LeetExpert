import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

function unavailable(): Response {
  return Response.json({ code: "auth_unavailable" }, { status: 503 });
}

export async function GET(req: Request): Promise<Response> {
  const auth = getAuth();
  return auth ? toNextJsHandler(auth).GET(req) : unavailable();
}

export async function POST(req: Request): Promise<Response> {
  const auth = getAuth();
  return auth ? toNextJsHandler(auth).POST(req) : unavailable();
}
