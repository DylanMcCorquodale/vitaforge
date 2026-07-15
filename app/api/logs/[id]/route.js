import { authenticatedUser, errorResponse } from "../../../../lib/http.js";
import { removeLog, updateLog } from "../../../../lib/repository.js";

export async function PATCH(request, { params }) {
  try {
    const user = await authenticatedUser(request);
    const { id } = await params;
    const log = await updateLog(user.id, id, await request.json());
    return log ? Response.json({ log }) : Response.json({ error: "Log not found." }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticatedUser(request);
    const { id } = await params;
    return (await removeLog(user.id, id))
      ? Response.json({ ok: true })
      : Response.json({ error: "Log not found." }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
