import type { ICalEvent } from "./types";

// ---------------------------------------------------------------------------
// Generic iCal (.ics) parser
// Parses VCALENDAR text into an array of VEVENT objects.
// ---------------------------------------------------------------------------

/**
 * Parse raw iCal text into an array of ICalEvent objects.
 * Handles unfolding (continuation lines) per RFC 5545.
 */
export function parseIcal(icsText: string): ICalEvent[] {
  // Unfold continuation lines (RFC 5545 §3.1)
  const unfolded = icsText.replace(/\r\n[ \t]/g, "").replace(/\r\n/g, "\n");
  const lines = unfolded.split("\n");

  const events: ICalEvent[] = [];
  let current: Partial<ICalEvent> | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "BEGIN:VEVENT") {
      current = {
        uid: "",
        summary: "",
        dtstart: "",
        dtend: "",
        description: "",
        location: "",
      };
      continue;
    }

    if (trimmed === "END:VEVENT") {
      if (current?.uid && current.dtstart) {
        events.push(current as ICalEvent);
      }
      current = null;
      continue;
    }

    if (!current) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    // Property name (may include params like DTSTART;VALUE=DATE:20250301)
    const propPart = trimmed.substring(0, colonIdx);
    const value = trimmed.substring(colonIdx + 1);
    const propName = propPart.split(";")[0].toUpperCase();

    switch (propName) {
      case "UID":
        current.uid = value;
        break;
      case "SUMMARY":
        current.summary = unescapeIcal(value);
        break;
      case "DTSTART":
        current.dtstart = parseIcalDate(value);
        break;
      case "DTEND":
        current.dtend = parseIcalDate(value);
        break;
      case "DESCRIPTION":
        current.description = unescapeIcal(value);
        break;
      case "LOCATION":
        current.location = unescapeIcal(value);
        break;
    }
  }

  return events;
}

/**
 * Parse iCal date value to YYYY-MM-DD.
 * Handles formats: 20250301, 20250301T140000, 20250301T140000Z
 */
function parseIcalDate(value: string): string {
  const clean = value.replace(/[^0-9]/g, "").substring(0, 8);
  if (clean.length < 8) return "";
  return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
}

/** Unescape iCal text values (RFC 5545 §3.3.11) */
function unescapeIcal(value: string): string {
  return value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");
}
