import {
  NextRequest,
  NextResponse,
} from "next/server";
import crypto from "crypto";
import { getLineCallbackUrl } from "@/src/lib/lineConfig";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/line
// Redirect the user to the LINE OAuth 2.0 authorization page.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
): Promise<NextResponse> {
  const clientId = process.env.LINE_CLIENT_ID;
  const callbackUrl =
    getLineCallbackUrl(request);

  if (!clientId || !callbackUrl) {
    return NextResponse.json(
      { error: "LINE OAuth is not configured. Check environment variables." },
      { status: 500 }
    );
  }

  // Generate a cryptographically random state value to prevent CSRF
  const state = crypto.randomBytes(16).toString("hex");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: "profile openid",
    state,
  });

  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;

  // Persist state in an HttpOnly cookie so the callback can verify it
  const response = NextResponse.redirect(lineAuthUrl);
  response.cookies.set("line_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return response;
}
