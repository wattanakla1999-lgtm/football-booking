import { NextRequest, NextResponse } from "next/server";
import {
  fetchLineProfileFromAccessToken,
  setLineSessionCookie,
  upsertLineUser,
} from "@/src/lib/lineAuth";
import { getLineCallbackUrl } from "@/src/lib/lineConfig";
import { verifyLineState } from "@/src/lib/lineState";
import type { LineTokenResponse, LineProfile } from "@/src/types/line";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/line/callback
// LINE redirects here with ?code=…&state=…
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  // ── 0. Handle LINE error responses ──────────────────────────────────────────
  if (errorParam) {
    console.error("[LINE Callback] LINE returned an error:", errorParam);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorParam)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=missing_params", request.url));
  }

  // ── 1. Validate CSRF state ───────────────────────────────────────────────────
  if (!verifyLineState(state)) {
    return NextResponse.redirect(
      new URL("/?error=state_mismatch", request.url)
    );
  }

  // ── 2. Exchange code for access token ───────────────────────────────────────
  const clientId = process.env.LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;
  const callbackUrl =
    getLineCallbackUrl(request);

  if (!clientId || !clientSecret || !callbackUrl) {
    return NextResponse.json(
      { error: "LINE OAuth is not configured." },
      { status: 500 }
    );
  }

  let tokenData: LineTokenResponse;
  try {
    const tokenRes = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      console.error("[LINE Callback] Token exchange failed:", err);
      return NextResponse.redirect(
        new URL("/?error=token_exchange_failed", request.url)
      );
    }

    tokenData = (await tokenRes.json()) as LineTokenResponse;
  } catch (err) {
    console.error("[LINE Callback] Network error during token exchange:", err);
    return NextResponse.redirect(
      new URL("/?error=network_error", request.url)
    );
  }

  // ── 3. Fetch LINE user profile ───────────────────────────────────────────────
  let profile: LineProfile;
  try {
    profile = await fetchLineProfileFromAccessToken(tokenData.access_token);
  } catch (err) {
    console.error("[LINE Callback] Network error fetching profile:", err);
    return NextResponse.redirect(
      new URL("/?error=profile_fetch_failed", request.url)
    );
  }

  // ── 4. Upsert user and set session ───────────────────────────────────────────
  const user = await upsertLineUser(profile);

  // Simple session: store user id in a signed-like cookie.
  // For production replace with a proper JWT / NextAuth session.
  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  // Set user session
  setLineSessionCookie(response, user.id);

  return response;
}
