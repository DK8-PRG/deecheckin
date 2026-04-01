import { Skeleton } from "@/components/ui/skeleton";

export default function CheckinLoading() {
  return (
    <div className="flex-1 p-6 flex items-start justify-center">
      <div className="w-full max-w-md space-y-6 mt-8">
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
