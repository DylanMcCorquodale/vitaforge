export class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = new.target.name;
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = "Sign in to continue.") { super(message, 401); }
}

export class ConflictError extends HttpError {
  constructor(message: string) { super(message, 409); }
}
