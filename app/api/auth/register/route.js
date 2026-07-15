import { register } from "../../../../lib/repository.js";
import { errorResponse } from "../../../../lib/http.js";

export async function POST(request) {
  try {
    return Response.json(await register(await request.json()), { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
