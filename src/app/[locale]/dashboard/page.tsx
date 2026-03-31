import { getTranslations } from "next-intl/server";
import * as reservationsService from "@/services/reservations.service";
import * as propertiesService from "@/services/properties.service";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardHeader } from "@/components/DashboardHeader";
import { StatsCard } from "@/components/ui/stats-card";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarCheck, Users, ClipboardCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// SERVER COMPONENT — data fetched on the server, no client-side Supabase
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const t = await getTranslations();
  const [reservations, properties] = await Promise.all([
    reservationsService.list(),
    propertiesService.list(),
  ]);

  const checkedInCount = reservations.filter(
    (r) => r.reservation_status === "CHECKED_IN",
  ).length;
  const totalGuests = reservations.reduce((sum, r) => sum + (r.people || 0), 0);

  return (
    <DashboardShell>
      <DashboardHeader title={t("dashboard")} />
      <main className="flex-1 p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title={t("accommodationUnits")}
            value={properties.length}
            icon={<Building2 className="h-4 w-4" />}
          />
          <StatsCard
            title={t("reservations")}
            value={reservations.length}
            icon={<CalendarCheck className="h-4 w-4" />}
          />
          <StatsCard
            title={t("checkin")}
            value={checkedInCount}
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
          <StatsCard
            title={t("people")}
            value={totalGuests}
            icon={<Users className="h-4 w-4" />}
          />
        </div>

        {/* Recent reservations */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              {t("reservations")}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("guest")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("checkIn")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("checkOut")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {reservations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      {t("noReservations")}
                    </td>
                  </tr>
                ) : (
                  reservations.slice(0, 8).map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {r.guest_names}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {r.check_in}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {r.check_out}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            r.reservation_status === "CHECKED_IN"
                              ? "success"
                              : r.reservation_status === "CANCELLED"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {r.reservation_status || r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Properties */}
        <div className="rounded-lg border border-border bg-card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              {t("accommodationUnits")}
            </h2>
          </div>
          <div className="divide-y divide-border">
            {properties.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-muted-foreground">
                {t("noProperties")}
              </p>
            ) : (
              properties.map((p) => (
                <div key={p.id} className="px-6 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {p.name}
                    </p>
                    {p.address && (
                      <p className="text-xs text-muted-foreground">
                        {p.address}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
