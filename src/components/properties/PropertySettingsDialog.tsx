"use client";

import React, { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Property } from "@/types/property";
import { updatePropertySettingsAction } from "@/actions/properties";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Wifi, Phone, CalendarSync, Globe } from "lucide-react";

interface PropertySettingsDialogProps {
  property: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertySettingsDialog({
  property,
  open,
  onOpenChange,
}: Readonly<PropertySettingsDialogProps>) {
  const t = useTranslations();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    checkin_instructions: "",
    access_code: "",
    wifi_name: "",
    wifi_password: "",
    house_rules: "",
    contact_phone: "",
    contact_email: "",
    ical_booking_url: "",
    ical_airbnb_url: "",
    slug: "",
    description: "",
    public_page_enabled: true,
  });

  // Populate form when property changes
  React.useEffect(() => {
    if (property) {
      setForm({
        checkin_instructions: property.checkin_instructions ?? "",
        access_code: property.access_code ?? "",
        wifi_name: property.wifi_name ?? "",
        wifi_password: property.wifi_password ?? "",
        house_rules: property.house_rules ?? "",
        contact_phone: property.contact_phone ?? "",
        contact_email: property.contact_email ?? "",
        ical_booking_url: property.ical_booking_url ?? "",
        ical_airbnb_url: property.ical_airbnb_url ?? "",
        slug: property.slug ?? "",
        description: property.description ?? "",
        public_page_enabled: property.public_page_enabled ?? true,
      });
      setError(null);
      setSuccess(false);
    }
  }, [property]);

  const handleField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSave = () => {
    if (!property) return;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await updatePropertySettingsAction(property.id, form);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t("propertySettings")} — {property?.name}
          </DialogTitle>
          <DialogDescription>
            {t("propertySettingsDescription")}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-950/30 p-3 text-sm text-green-700 dark:text-green-400">
            {t("settingsSaved")}
          </div>
        )}

        <div className="space-y-6">
          {/* Section: Access & Instructions */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              {t("sectionAccess")}
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="checkin_instructions">
                  {t("checkinInstructions")}
                </Label>
                <textarea
                  id="checkin_instructions"
                  value={form.checkin_instructions}
                  onChange={(e) =>
                    handleField("checkin_instructions", e.target.value)
                  }
                  placeholder={t("checkinInstructionsPlaceholder")}
                  rows={3}
                  className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div>
                <Label htmlFor="access_code">{t("accessCode")}</Label>
                <Input
                  id="access_code"
                  value={form.access_code}
                  onChange={(e) => handleField("access_code", e.target.value)}
                  placeholder={t("accessCodePlaceholder")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="house_rules">{t("houseRules")}</Label>
                <textarea
                  id="house_rules"
                  value={form.house_rules}
                  onChange={(e) => handleField("house_rules", e.target.value)}
                  placeholder={t("houseRulesPlaceholder")}
                  rows={3}
                  className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Section: WiFi */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Wifi className="h-4 w-4 text-muted-foreground" />
              {t("sectionWifi")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="wifi_name">{t("wifiName")}</Label>
                <Input
                  id="wifi_name"
                  value={form.wifi_name}
                  onChange={(e) => handleField("wifi_name", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="wifi_password">{t("wifiPassword")}</Label>
                <Input
                  id="wifi_password"
                  value={form.wifi_password}
                  onChange={(e) => handleField("wifi_password", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          {/* Section: Contact */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {t("sectionContact")}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contact_phone">{t("contactPhone")}</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => handleField("contact_phone", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">{t("contactEmail")}</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => handleField("contact_email", e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          {/* Section: iCal Sync */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <CalendarSync className="h-4 w-4 text-muted-foreground" />
              {t("sectionIcal")}
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="ical_booking_url">{t("icalBookingUrl")}</Label>
                <Input
                  id="ical_booking_url"
                  type="url"
                  value={form.ical_booking_url}
                  onChange={(e) =>
                    handleField("ical_booking_url", e.target.value)
                  }
                  placeholder={t("icalBookingUrlPlaceholder")}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="ical_airbnb_url">{t("icalAirbnbUrl")}</Label>
                <Input
                  id="ical_airbnb_url"
                  type="url"
                  value={form.ical_airbnb_url}
                  onChange={(e) =>
                    handleField("ical_airbnb_url", e.target.value)
                  }
                  placeholder={t("icalAirbnbUrlPlaceholder")}
                  className="mt-1.5"
                />
              </div>
            </div>
          </section>

          {/* Section: Public Page */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              {t("guestLanding.publicPageLink")}
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="slug">{t("guestLanding.slug")}</Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) =>
                    handleField(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replaceAll(/[^a-z0-9-]/g, "-")
                        .replaceAll(/-+/g, "-")
                        .replaceAll(/^-|-$/g, ""),
                    )
                  }
                  placeholder={t("guestLanding.slugPlaceholder")}
                  className="mt-1.5"
                />
                {form.slug && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("guestLanding.slugHelp", { slug: form.slug })}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">
                  {t("guestLanding.description")}
                </Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleField("description", e.target.value)}
                  placeholder={t("guestLanding.descriptionPlaceholder")}
                  rows={3}
                  className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="public_page_enabled"
                  type="checkbox"
                  checked={form.public_page_enabled}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      public_page_enabled: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="public_page_enabled">
                  {t("guestLanding.publicPageEnabled")}
                </Label>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "..." : t("save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
