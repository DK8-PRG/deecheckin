import { use } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const CheckinPage = ({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) => {
  const { reservationId } = use(params);
  const t = useTranslations();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full flex justify-end mb-4">
        <LanguageSwitcher />
      </div>
      <h1 className="text-2xl font-bold mb-4">{t("checkin")}</h1>
      <div className="border rounded p-4 text-gray-500">
        Placeholder pro check-in formulář pro rezervaci ID:{" "}
        <span className="font-mono">{reservationId}</span>
      </div>
    </main>
  );
};

export default CheckinPage;
