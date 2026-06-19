type AuditLevel = "info" | "warn" | "error";

type AuditPayload = {
  event: string;
  level?: AuditLevel;
  actorType?: "user" | "admin" | "system";
  actorId?: string | null;
  bookingId?: string | null;
  organizationId?: string | null;
  requestId?: string | null;
  message?: string;
  meta?: Record<string, unknown>;
};

export function auditLog({
  event,
  level = "info",
  actorType,
  actorId,
  bookingId,
  organizationId,
  requestId,
  message,
  meta,
}: AuditPayload) {
  const logger =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.info;

  logger(
    JSON.stringify({
      ts: new Date().toISOString(),
      event,
      level,
      actorType,
      actorId,
      bookingId,
      organizationId,
      requestId,
      message,
      meta,
    }),
  );
}
