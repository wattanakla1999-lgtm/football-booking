import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import type { LineProfile } from "@/src/types/line";

export async function fetchLineProfileFromAccessToken(
  accessToken: string
): Promise<LineProfile> {
  const profileResponse = await fetch("https://api.line.me/v2/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!profileResponse.ok) {
    const errorText = await profileResponse.text();
    throw new Error(
      `LINE profile request failed (${profileResponse.status}): ${errorText}`
    );
  }

  return (await profileResponse.json()) as LineProfile;
}

export async function upsertLineUser(profile: LineProfile) {
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

  return prisma.user.upsert({
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
}

export function setLineSessionCookie(
  response: NextResponse,
  userId: string
) {
  response.cookies.set("session_user_id", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}
