import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import AdminSidebar from "../../components/AdminSidebar";

export function generateStaticParams() {
  return [{ locale: "cs" }, { locale: "en" }];
}

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations();
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">{t("welcome")}</h1>
      </main>
    </div>
  );
}
