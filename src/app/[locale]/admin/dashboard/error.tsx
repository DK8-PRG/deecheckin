"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {t("errorOccurred")}
        </h2>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={reset} variant="outline">
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}
