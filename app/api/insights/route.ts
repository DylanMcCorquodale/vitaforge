import { authenticatedUser, errorResponse } from "../../../lib/http";
import { listLogs } from "../../../lib/repository";
import { buildInsights } from "../../../src/health";

export async function GET(request: Request) {
  try {
    const user = await authenticatedUser(request);
    return Response.json(buildInsights(await listLogs(user.id)));
  } catch (error) {
    return errorResponse(error);
  }
}
