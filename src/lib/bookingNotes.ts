const SYSTEM_NOTE_PREFIX = "[SYSTEM_";

export function appendSystemNote(
  existingNotes: string | null | undefined,
  marker: string,
) {
  return existingNotes
    ? `${existingNotes}\n${marker}`
    : marker;
}

export function sanitizeBookingNotes(
  notes: string | null | undefined,
) {
  if (!notes) {
    return null;
  }

  const visibleLines = notes
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith(SYSTEM_NOTE_PREFIX));

  return visibleLines.length > 0
    ? visibleLines.join("\n")
    : null;
}
