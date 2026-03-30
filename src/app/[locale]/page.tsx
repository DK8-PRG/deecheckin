import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { DashboardShell } from "@/components/DashboardShell";
import { DashboardHeader } from "@/components/DashboardHeader";

export function generateStaticParams() {
  return [{ locale: "cs" }, { locale: "en" }];
}

export default function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();
  return (
    <DashboardShell>
      <DashboardHeader title={t("welcome")} />
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold text-primary-foreground">D</span>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("welcome")}
          </h1>
          <p className="text-sm text-muted-foreground">
            DeeCheckIn Admin Panel
          </p>
        </div>
      </main>
    </DashboardShell>
  );
}
