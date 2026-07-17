import { ValidationError } from "../src/validation";
import { userForRequest } from "./repository";
import { HttpError, UnauthorizedError } from "./errors";
export { HttpError, UnauthorizedError, ConflictError } from "./errors";

export async function authenticatedUser(request: Request) {
  const user = await userForRequest(request);
  if (!user) throw new UnauthorizedError("Sign in to continue.");
  return user;
}

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error.";
  if (error instanceof HttpError) return Response.json({ error: message }, { status: error.status });
  if (error instanceof SyntaxError || error instanceof ValidationError) return Response.json({ error: message }, { status: 400 });
  console.error(error);
  return Response.json({ error: "Unexpected server error." }, { status: 500 });
}
