import { authenticatedUser, errorResponse } from "../../../lib/http.js";
import { listLogs } from "../../../lib/repository.js";
import { buildInsights } from "../../../src/health.js";

export async function GET(request) {
  try {
    const user = await authenticatedUser(request);
    return Response.json(buildInsights(await listLogs(user.id)));
  } catch (error) {
    return errorResponse(error);
  }
}
