import { authenticatedUser, errorResponse } from "../../../lib/http";

export async function GET(request: Request) {
  try {
    return Response.json({ user: await authenticatedUser(request) });
  } catch (error) {
    return errorResponse(error);
  }
}
