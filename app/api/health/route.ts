import { getDatabase } from "../../../lib/mongodb";
import { errorResponse } from "../../../lib/http";

export async function GET() {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return Response.json({ ok: true, database: "mongodb", name: db.databaseName });
  } catch (error) {
    return errorResponse(error);
  }
}
