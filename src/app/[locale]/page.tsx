import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ClipboardCheck, LogIn, Home } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import * as propertiesService from "@/services/properties.service";

export function generateStaticParams() {
  return [{ locale: "cs" }, { locale: "en" }];
}

export default async function LandingPage() {
  const properties = await propertiesService.listPublic();

  return <LandingContent properties={properties} />;
}

function LandingContent({
  properties,
}: {
  properties: Awaited<ReturnType<typeof propertiesService.listPublic>>;
}) {
  const t = useTranslations("landing");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Nav */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold text-slate-900">DeeCheckIn</span>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              {t("ctaLogin")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          {t("heroTitle")}
        </h1>
        <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
          {t("heroSubtitle")}
        </p>
      </section>

      {/* Properties list */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">{t("noProperties")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 shrink-0">
                      <Home className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">
                        {property.name}
                      </h3>
                      {property.address && (
                        <p className="text-sm text-slate-500 truncate">
                          {property.address}
                        </p>
                      )}
                    </div>
                  </div>
                  {property.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {property.description}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    {property.slug && (
                      <>
                        <Link
                          href={`/${property.slug}`}
                          className="flex-1 text-center text-sm font-medium px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          {t("viewDetail")}
                        </Link>
                        <Link
                          href={`/${property.slug}/checkin`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                        >
                          <ClipboardCheck className="h-4 w-4" />
                          {t("checkin")}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        {t("footer", { year: new Date().getFullYear() })}
      </footer>
    </div>
  );
}
