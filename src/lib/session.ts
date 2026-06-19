import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextResponse } from "next/server";
import { cookies } from "next/headers";

type SessionKind = "user" | "admin";

type SessionPayload = {
  sub: string;
  kind: SessionKind;
  exp: number;
};

const USER_SESSION_COOKIE = "session_user_id";
const ADMIN_SESSION_COOKIE = "admin_session_id";

function getSessionSecret() {
  return (
    process.env.SESSION_SECRET ||
    process.env.JWT_SECRET ||
    "development-session-secret"
  );
}

function toBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded =
    padding === 0
      ? normalized
      : normalized + "=".repeat(4 - padding);

  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret())
    .update(value)
    .digest("base64url");
}

function buildCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge,
    path: "/",
  };
}

function buildToken(
  kind: SessionKind,
  subjectId: string,
  maxAge: number,
) {
  const payload: SessionPayload = {
    sub: subjectId,
    kind,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const encodedPayload = toBase64Url(
    JSON.stringify(payload),
  );
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

function verifyToken(
  token: string | undefined,
  expectedKind: SessionKind,
) {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(encodedPayload),
    ) as SessionPayload;

    if (
      payload.kind !== expectedKind ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload.sub;
  } catch {
    return null;
  }
}

export function setUserSessionCookie(
  response: NextResponse,
  userId: string,
) {
  response.cookies.set(
    USER_SESSION_COOKIE,
    buildToken("user", userId, 60 * 60 * 24 * 7),
    buildCookieOptions(60 * 60 * 24 * 7),
  );
}

export function setAdminSessionCookie(
  response: NextResponse,
  adminId: string,
) {
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    buildToken("admin", adminId, 60 * 60 * 12),
    buildCookieOptions(60 * 60 * 12),
  );
}

export function clearUserSessionCookie(
  response: NextResponse,
) {
  response.cookies.set(USER_SESSION_COOKIE, "", {
    ...buildCookieOptions(0),
    maxAge: 0,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    ...buildCookieOptions(0),
    maxAge: 0,
  });
}

export async function getUserSessionId() {
  const cookieStore = await cookies();
  return verifyToken(
    cookieStore.get(USER_SESSION_COOKIE)?.value,
    "user",
  );
}

export async function getAdminSessionId() {
  const cookieStore = await cookies();
  return verifyToken(
    cookieStore.get(ADMIN_SESSION_COOKIE)?.value,
    "admin",
  );
}
