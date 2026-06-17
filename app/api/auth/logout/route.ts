import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/logout
// Clears the session cookie and redirects to the login page.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
  );

  response.cookies.set("session_user_id", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
