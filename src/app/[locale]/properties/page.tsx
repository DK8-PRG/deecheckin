import * as propertiesService from "@/services/properties.service";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PropertiesPageClient } from "@/components/properties/PropertiesPageClient";

// ---------------------------------------------------------------------------
// SERVER COMPONENT — data is fetched on the server, no client-side Supabase
// ---------------------------------------------------------------------------

export default async function PropertiesPage() {
  const properties = await propertiesService.list();

  return (
    <DashboardShell>
      <DashboardHeader title="Properties" />
      <main className="flex-1 p-6">
        <PropertiesPageClient initialProperties={properties} />
      </main>
    </DashboardShell>
  );
}
