import { authenticatedUser, errorResponse } from "../../../lib/http.js";
import { createLog, listLogs } from "../../../lib/repository.js";

export async function GET(request) {
  try {
    const user = await authenticatedUser(request);
    return Response.json({ logs: await listLogs(user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticatedUser(request);
    return Response.json({ log: await createLog(user.id, await request.json()) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
