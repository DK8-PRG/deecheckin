import { notFound } from "next/navigation";
import * as propertiesService from "@/services/properties.service";
import { IndependentCheckinWizard } from "@/components/checkin/IndependentCheckinWizard";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function IndependentCheckinPage({
  params,
}: Readonly<Props>) {
  const { slug } = await params;

  const property = await propertiesService.getBySlug(slug);
  if (!property) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">
            {property.name}
          </span>
          <LanguageSwitcher />
        </div>
      </div>

      <IndependentCheckinWizard
        propertyId={property.id}
        propertyName={property.name}
        slug={slug}
      />
    </div>
  );
}
