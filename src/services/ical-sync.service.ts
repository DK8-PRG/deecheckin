import type { Property } from "@/types/property";
import type { NormalizedReservation, SyncResult } from "@/lib/ical/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { parseIcal } from "@/lib/ical/parser";
import { bookingEventToReservation } from "@/lib/ical/booking-adapter";
import { airbnbEventToReservation } from "@/lib/ical/airbnb-adapter";
import * as reservationsRepo from "@/repositories/reservations.repository";

// ---------------------------------------------------------------------------
// iCal Sync Service
// Fetches iCal feeds, parses events, and upserts reservations.
// ---------------------------------------------------------------------------

/**
 * Sync a single property's iCal feeds (Booking + Airbnb).
 */
export async function syncProperty(
  property: Property,
  client?: SupabaseClient,
): Promise<SyncResult> {
  const result: SyncResult = {
    property_id: property.id,
    property_name: property.name,
    created: 0,
    updated: 0,
    cancelled: 0,
    errors: [],
  };

  const feeds: Array<{
    url: string;
    source: "booking" | "airbnb";
  }> = [];

  if (property.ical_booking_url) {
    feeds.push({ url: property.ical_booking_url, source: "booking" });
  }
  if (property.ical_airbnb_url) {
    feeds.push({ url: property.ical_airbnb_url, source: "airbnb" });
  }

  for (const feed of feeds) {
    try {
      const feedResult = await syncFeed(
        property,
        feed.url,
        feed.source,
        client,
      );
      result.created += feedResult.created;
      result.updated += feedResult.updated;
      result.cancelled += feedResult.cancelled;
      result.errors.push(...feedResult.errors);
    } catch (err) {
      result.errors.push(
        `${feed.source}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  return result;
}

/**
 * Fetch and process a single iCal feed URL.
 */
async function syncFeed(
  property: Property,
  url: string,
  source: "booking" | "airbnb",
  client?: SupabaseClient,
): Promise<{
  created: number;
  updated: number;
  cancelled: number;
  errors: string[];
}> {
  let created = 0;
  let updated = 0;
  let cancelled = 0;
  const errors: string[] = [];

  // Fetch the iCal feed
  const response = await fetch(url, {
    headers: { "User-Agent": "DeeCheckIn/1.0" },
    next: { revalidate: 0 }, // no cache
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const icsText = await response.text();
  const events = parseIcal(icsText);

  // Convert events to normalized reservations
  const normalizedEvents: NormalizedReservation[] = [];
  for (const event of events) {
    const normalized =
      source === "booking"
        ? bookingEventToReservation(event)
        : airbnbEventToReservation(event);
    if (normalized) {
      normalizedEvents.push(normalized);
    }
  }

  // Get existing reservations for this property + source
  const existingBySource = await reservationsRepo.findByPropertyAndSource(
    property.id,
    source,
    client,
  );
  const existingByUid = new Map(
    existingBySource.filter((r) => r.ical_uid).map((r) => [r.ical_uid!, r]),
  );
  const feedUids = new Set(normalizedEvents.map((e) => e.ical_uid));

  // Upsert: create new / update existing
  for (const normalized of normalizedEvents) {
    try {
      const existing = existingByUid.get(normalized.ical_uid);

      if (existing) {
        // Update if dates changed
        if (
          existing.check_in !== normalized.check_in ||
          existing.check_out !== normalized.check_out ||
          existing.guest_names !== normalized.guest_names
        ) {
          await reservationsRepo.update(
            existing.id,
            {
              guest_names: normalized.guest_names,
              check_in: normalized.check_in,
              check_out: normalized.check_out,
              external_reference: normalized.external_reference || undefined,
            },
            client,
          );
          updated++;
        }
      } else {
        // Create new reservation
        if (!property.user_id) {
          errors.push(`No user_id on property ${property.id}`);
          continue;
        }
        await reservationsRepo.createWithUserId(
          {
            property_id: property.id,
            user_id: property.user_id,
            guest_names: normalized.guest_names,
            check_in: normalized.check_in,
            check_out: normalized.check_out,
            source,
            status: normalized.status,
            adults: normalized.adults ?? undefined,
            phone_number: normalized.phone_number || undefined,
            ical_uid: normalized.ical_uid,
            external_reference: normalized.external_reference || undefined,
          },
          client,
        );
        created++;
      }
    } catch (err) {
      errors.push(
        `${normalized.ical_uid}: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    }
  }

  // Detect cancellations: reservations in DB but no longer in feed
  for (const [uid, existing] of existingByUid) {
    if (!feedUids.has(uid) && existing.status !== "cancelled") {
      try {
        await reservationsRepo.update(
          existing.id,
          { status: "cancelled" },
          client,
        );
        cancelled++;
      } catch (err) {
        errors.push(
          `Cancel ${uid}: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    }
  }

  return { created, updated, cancelled, errors };
}
