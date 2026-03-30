import { findAll } from "@/repositories/reservations.repository";
import { findAllProperties } from "@/repositories/reservations.repository";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ReservationsPageClient } from "@/components/reservations/ReservationsPageClient";
import type { Reservation } from "@/types/reservation";

// ---------------------------------------------------------------------------
// SERVER COMPONENT — data is fetched on the server, no client-side Supabase
// ---------------------------------------------------------------------------

export default async function ReservationsPage() {
  const [reservations, properties] = await Promise.all([
    findAll(),
    findAllProperties(),
  ]);

  return (
    <DashboardShell>
      <DashboardHeader title="Reservations" />
      <main className="flex-1 p-6">
        <ReservationsPageClient
          initialReservations={reservations as Reservation[]}
          properties={properties}
        />
      </main>
    </DashboardShell>
  );
}
