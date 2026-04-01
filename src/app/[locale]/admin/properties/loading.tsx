import { DashboardShell } from "@/components/DashboardShell";
import { TableSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <DashboardShell>
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-lg border border-border bg-card">
          <TableSkeleton rows={5} columns={3} />
        </div>
      </div>
    </DashboardShell>
  );
}
