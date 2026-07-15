import { logout } from "../../../../lib/repository.js";
import { errorResponse } from "../../../../lib/http.js";

export async function POST(request) {
  try {
    await logout(request);
    return Response.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
