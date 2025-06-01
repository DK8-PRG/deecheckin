import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { PropertiesProvider } from "@/context/PropertiesContext";
import { ReservationsProvider } from "@/context/ReservationsContext";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;
  const messages = (await import(`../messages/${locale}.json`)).default;

  if (!["cs", "en"].includes(locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PropertiesProvider>
            <ReservationsProvider>{children}</ReservationsProvider>
          </PropertiesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
