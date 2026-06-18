import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/logout
// Clears the session cookie and redirects to the login page.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const response = NextResponse.redirect(
    new URL("/", request.url)
  );

  response.cookies.set("session_user_id", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
