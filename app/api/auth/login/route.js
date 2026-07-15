import { login } from "../../../../lib/repository.js";
import { errorResponse } from "../../../../lib/http.js";

export async function POST(request) {
  try {
    return Response.json(await login(await request.json()));
  } catch (error) {
    return errorResponse(error);
  }
}
