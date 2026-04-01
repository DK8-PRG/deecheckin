import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import * as icalSyncService from "@/services/ical-sync.service";
import type { SyncResult } from "@/lib/ical/types";

// ---------------------------------------------------------------------------
// Cron route for automatic iCal sync (Vercel Cron)
// Triggered every 15 minutes via vercel.json cron config.
// Protected by CRON_SECRET header.
// Uses admin client (service role) to bypass RLS.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all properties with iCal URLs (admin client bypasses RLS)
    const supabase = createAdminClient();
    const { data: properties, error } = await supabase
      .from("properties")
      .select("*")
      .or("ical_booking_url.not.is.null,ical_airbnb_url.not.is.null");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: SyncResult[] = [];
    for (const property of properties ?? []) {
      const result = await icalSyncService.syncProperty(property, supabase);
      results.push(result);
    }

    const totalCreated = results.reduce((sum, r) => sum + r.created, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
    const totalCancelled = results.reduce((sum, r) => sum + r.cancelled, 0);

    return NextResponse.json({
      ok: true,
      synced_properties: results.length,
      created: totalCreated,
      updated: totalUpdated,
      cancelled: totalCancelled,
      details: results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    );
  }
}
