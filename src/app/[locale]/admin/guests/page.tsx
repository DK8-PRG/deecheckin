import * as guestsService from "@/services/guests.service";
import * as propertiesService from "@/services/properties.service";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardHeader } from "@/components/DashboardHeader";
import { GuestsPageClient } from "@/components/guests/GuestsPageClient";

// ---------------------------------------------------------------------------
// SERVER COMPONENT — data is fetched on the server, no client-side Supabase
// ---------------------------------------------------------------------------

export default async function GuestsPage() {
  const [groups, properties] = await Promise.all([
    guestsService.listUnpairedGroups(),
    propertiesService.list(),
  ]);

  return (
    <DashboardShell>
      <DashboardHeader title="Guests" />
      <main className="flex-1 p-6">
        <GuestsPageClient initialGroups={groups} properties={properties} />
      </main>
    </DashboardShell>
  );
}
