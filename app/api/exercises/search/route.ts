import { exerciseCatalog, searchCatalog } from "../../../../src/health";

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") || "";
  return Response.json({ exercises: searchCatalog(exerciseCatalog, query) });
}
