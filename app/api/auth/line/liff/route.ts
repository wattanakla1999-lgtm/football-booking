import { NextRequest, NextResponse } from "next/server";

import {
  fetchLineProfileFromAccessToken,
  setLineSessionCookie,
  upsertLineUser,
} from "@/src/lib/lineAuth";
import type { LineProfile } from "@/src/types/line";

type LiffLoginRequestBody = {
  accessToken?: string;
  profile?: LineProfile;
};

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  let body: LiffLoginRequestBody;

  try {
    body = (await request.json()) as LiffLoginRequestBody;
  } catch {
    return NextResponse.json(
      { error: "invalid_json_body" },
      { status: 400 }
    );
  }

  if (!body.accessToken) {
    return NextResponse.json(
      { error: "missing_access_token" },
      { status: 400 }
    );
  }

  try {
    const profile = await fetchLineProfileFromAccessToken(body.accessToken);

    if (body.profile && body.profile.userId !== profile.userId) {
      return NextResponse.json(
        { error: "profile_mismatch" },
        { status: 401 }
      );
    }

    const user = await upsertLineUser(profile);
    const response = NextResponse.json({
      ok: true,
      redirectTo: "/dashboard",
    });

    setLineSessionCookie(response, user.id);

    return response;
  } catch (error) {
    console.error("[LINE LIFF] Failed to create session:", error);

    return NextResponse.json(
      { error: "line_liff_auth_failed" },
      { status: 401 }
    );
  }
}
