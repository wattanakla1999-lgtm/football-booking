import crypto from "crypto";

const LINE_STATE_MAX_AGE_MS = 10 * 60 * 1000;

function getLineStateSecret() {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    process.env.LINE_CLIENT_SECRET;

  if (!secret) {
    throw new Error(
      "Missing NEXTAUTH_SECRET or LINE_CLIENT_SECRET for LINE state signing",
    );
  }

  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString(
    "base64url",
  );
}

function fromBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString(
    "utf8",
  );
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getLineStateSecret())
    .update(payload)
    .digest("base64url");
}

export function createLineState() {
  const payload = JSON.stringify({
    nonce: crypto.randomBytes(16).toString("hex"),
    timestamp: Date.now(),
  });
  const encodedPayload = toBase64Url(payload);
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyLineState(state: string) {
  const [encodedPayload, signature] =
    state.split(".");

  if (!encodedPayload || !signature) {
    return false;
  }

  const expectedSignature =
    signPayload(encodedPayload);

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      fromBase64Url(encodedPayload),
    ) as {
      nonce?: string;
      timestamp?: number;
    };

    if (
      !parsed.nonce ||
      typeof parsed.timestamp !== "number"
    ) {
      return false;
    }

    return (
      Date.now() - parsed.timestamp <=
      LINE_STATE_MAX_AGE_MS
    );
  } catch {
    return false;
  }
}
