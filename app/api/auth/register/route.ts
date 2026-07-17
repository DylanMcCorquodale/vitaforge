import { register } from "../../../../lib/repository";
import { errorResponse } from "../../../../lib/http";
import { authenticatedResponse } from "../../../../lib/session-cookie";

export async function POST(request: Request) {
  try {
    const { user, token } = await register(await request.json());
    return authenticatedResponse({ user }, token, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
