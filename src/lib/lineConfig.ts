import type { NextRequest } from "next/server";

function normalizeBaseUrl(value?: string | null) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

export function getLineCallbackUrl(
  request: NextRequest,
) {
  const requestOrigin = new URL(request.url).origin;
  const configuredBaseUrl = normalizeBaseUrl(
    process.env.NEXT_PUBLIC_APP_URL,
  );
  const configuredCallbackUrl =
    normalizeBaseUrl(
      process.env.LINE_CALLBACK_URL,
    );

  if (
    configuredCallbackUrl &&
    !configuredCallbackUrl.includes(
      "localhost",
    )
  ) {
    return configuredCallbackUrl;
  }

  const baseUrl =
    configuredBaseUrl &&
    !configuredBaseUrl.includes("localhost")
      ? configuredBaseUrl
      : requestOrigin;

  return `${baseUrl}/api/auth/line/callback`;
}
