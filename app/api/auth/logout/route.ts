import { NextRequest, NextResponse } from "next/server";
import { clearUserSessionCookie } from "@/src/lib/session";

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

  clearUserSessionCookie(response);

  return response;
}
