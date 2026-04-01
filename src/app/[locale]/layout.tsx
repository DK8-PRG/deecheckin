import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { use, ReactNode } from "react";
import { ToastProvider } from "@/components/ui/toast";
import type { Metadata, Viewport } from "next";
import csMessages from "../messages/cs.json";
import enMessages from "../messages/en.json";

export const metadata: Metadata = {
  title: {
    default: "DeeCheckIn",
    template: "%s | DeeCheckIn",
  },
  description:
    "Online check-in systém pro malé ubytovatele. Hosté vyplní zákonné údaje online.",
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default function LocaleLayout({
  children,
  params,
}: Readonly<LocaleLayoutProps>) {
  const { locale } = use(params);

  if (!["cs", "en"].includes(locale)) {
    notFound();
  }

  const messages = locale === "cs" ? csMessages : enMessages;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>{children}</ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
