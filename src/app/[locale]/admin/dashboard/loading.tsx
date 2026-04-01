import { DashboardShell } from "@/components/DashboardShell";
import { DashboardSkeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <DashboardShell>
      <div className="flex-1 p-6">
        <DashboardSkeleton />
      </div>
    </DashboardShell>
  );
}
