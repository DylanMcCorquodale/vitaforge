import { login } from "../../../../lib/repository";
import { errorResponse } from "../../../../lib/http";
import { authenticatedResponse } from "../../../../lib/session-cookie";

export async function POST(request: Request) {
  try {
    const { user, token } = await login(await request.json());
    return authenticatedResponse({ user }, token);
  } catch (error) {
    return errorResponse(error);
  }
}
