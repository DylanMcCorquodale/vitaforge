import { exerciseCatalog, searchCatalog } from "../../../../src/health.js";

export function GET(request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  return Response.json({ exercises: searchCatalog(exerciseCatalog, query) });
}
