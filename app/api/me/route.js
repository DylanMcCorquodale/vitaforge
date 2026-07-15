import { authenticatedUser, errorResponse } from "../../../lib/http.js";

export async function GET(request) {
  try {
    return Response.json({ user: await authenticatedUser(request) });
  } catch (error) {
    return errorResponse(error);
  }
}
