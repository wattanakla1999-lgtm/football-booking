import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
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
  const savedState = request.cookies.get("line_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(
      new URL("/?error=state_mismatch", request.url)
    );
  }

  // ── 2. Exchange code for access token ───────────────────────────────────────
  const clientId = process.env.LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;
  const callbackUrl = process.env.LINE_CALLBACK_URL;

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
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!profileRes.ok) {
      const err = await profileRes.json();
      console.error("[LINE Callback] Profile fetch failed:", err);
      return NextResponse.redirect(
        new URL("/?error=profile_fetch_failed", request.url)
      );
    }

    profile = (await profileRes.json()) as LineProfile;
  } catch (err) {
    console.error("[LINE Callback] Network error fetching profile:", err);
    return NextResponse.redirect(
      new URL("/?error=network_error", request.url)
    );
  }

  // ── 4. Resolve Organization ──────────────────────────────────────────────────
  // For the initial release we use a single default organization identified
  // by the env var ORG_SLUG (falls back to "default").
  const orgSlug = process.env.ORG_SLUG ?? "default";

  let organization = await prisma.organization.findUnique({
    where: { slug: orgSlug },
  });

  if (!organization) {
    organization = await prisma.organization.create({
      data: {
        name: "Football Booking",
        slug: orgSlug,
      },
    });
  }

  // ── 5. Upsert User in database ───────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { lineUserId: profile.userId },
    update: {
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl ?? null,
    },
    create: {
      lineUserId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl ?? null,
      organizationId: organization.id,
    },
  });

  // ── 6. Set session cookie and redirect ───────────────────────────────────────
  // Simple session: store user id in a signed-like cookie.
  // For production replace with a proper JWT / NextAuth session.
  const response = NextResponse.redirect(new URL("/dashboard", request.url));

  // Clear the CSRF state cookie
  response.cookies.set("line_oauth_state", "", { maxAge: 0, path: "/" });

  // Set user session
  response.cookies.set("session_user_id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
