import { NextResponse } from "next/server";

export const sessionCookie = "vitaforge_session";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 7 * 24 * 60 * 60
};

export function authenticatedResponse(payload: unknown, token: string, status = 200) {
  const response = NextResponse.json(payload, { status });
  response.cookies.set(sessionCookie, token, cookieOptions);
  return response;
}

export function clearedSessionResponse(payload: unknown) {
  const response = NextResponse.json(payload);
  response.cookies.set(sessionCookie, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
