import { logout } from "../../../../lib/repository";
import { errorResponse } from "../../../../lib/http";
import { clearedSessionResponse } from "../../../../lib/session-cookie";

export async function POST(request: Request) {
  try {
    await logout(request);
    return clearedSessionResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
