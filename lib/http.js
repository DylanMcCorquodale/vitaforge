import { ValidationError } from "../src/validation.js";
import { userForRequest } from "./repository.js";

export class UnauthorizedError extends Error {}

export async function authenticatedUser(request) {
  const user = await userForRequest(request);
  if (!user) throw new UnauthorizedError("Sign in to continue.");
  return user;
}

export function errorResponse(error) {
  const message = error?.message || "Unexpected server error.";
  if (error instanceof UnauthorizedError) return Response.json({ error: message }, { status: 401 });
  if (error instanceof SyntaxError || error instanceof ValidationError || /exists|incorrect|already|valid|between|required|choose/i.test(message)) {
    return Response.json({ error: message }, { status: 400 });
  }
  console.error(error);
  return Response.json({ error: "Unexpected server error." }, { status: 500 });
}
