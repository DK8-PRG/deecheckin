import { notFound } from "next/navigation";
import * as propertiesService from "@/services/properties.service";
import { GuestLanding } from "@/components/guest/GuestLanding";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function GuestLandingPage({ params }: Readonly<Props>) {
  const { slug } = await params;

  const property = await propertiesService.getBySlug(slug);
  if (!property) notFound();

  // Get occupied dates for the next 3 months
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const to = new Date(now.getFullYear(), now.getMonth() + 3, 0)
    .toISOString()
    .split("T")[0];

  const occupiedDates = await propertiesService.getOccupiedDates(
    property.id,
    from,
    to,
  );

  return <GuestLanding property={property} occupiedDates={occupiedDates} />;
}
