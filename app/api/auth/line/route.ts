import {
  NextRequest,
  NextResponse,
} from "next/server";
import { getLineCallbackUrl } from "@/src/lib/lineConfig";
import { createLineState } from "@/src/lib/lineState";

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

  const state = createLineState();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: callbackUrl,
    scope: "profile openid",
    state,
  });

  const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  const response = NextResponse.redirect(lineAuthUrl);
  return response;
}
