"use client";

import React, { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Property } from "@/types/property";
import {
  MapPin,
  Wifi,
  KeyRound,
  BookOpen,
  Lock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";

interface GuestInfoSectionProps {
  property: Property;
  unlocked: boolean;
}

export function GuestInfoSection({
  property,
  unlocked,
}: Readonly<GuestInfoSectionProps>) {
  const t = useTranslations("guestLanding");
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }, []);

  const mapsUrl = property.address
    ? `https://maps.google.com/?q=${encodeURIComponent(property.address)}`
    : null;

  return (
    <div className="space-y-4">
      {/* Address — always visible */}
      {property.address && (
        <div className="flex items-start gap-3 bg-white rounded-lg border border-slate-200 p-4">
          <MapPin className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">
              {t("addressLabel")}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {property.address}
                </a>
              ) : (
                <p className="text-sm text-slate-600">{property.address}</p>
              )}
              {property.address && (
                <a
                  href={`https://mapy.cz/zakladni?q=${encodeURIComponent(property.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full hover:bg-slate-200 transition-colors"
                >
                  Mapy.cz
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Access code — locked until verified */}
      {property.access_code && (
        <div className="flex items-start gap-3 bg-white rounded-lg border border-slate-200 p-4">
          <KeyRound className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">
              {t("accessCodeLabel")}
            </p>
            {unlocked ? (
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-slate-900">
                  {property.access_code}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(property.access_code!, "access_code")
                  }
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title={t("copy")}
                >
                  {copiedField === "access_code" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                {t("lockedHint")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* WiFi — locked until verified */}
      {(property.wifi_name || property.wifi_password) && (
        <div className="flex items-start gap-3 bg-white rounded-lg border border-slate-200 p-4">
          <Wifi className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">WiFi</p>
            {unlocked ? (
              <div className="text-sm text-slate-600 space-y-0.5">
                {property.wifi_name && (
                  <div className="flex items-center gap-2">
                    <p>
                      {t("wifiNetwork")}:{" "}
                      <span className="font-mono">{property.wifi_name}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(property.wifi_name!, "wifi_name")
                      }
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title={t("copy")}
                    >
                      {copiedField === "wifi_name" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
                {property.wifi_password && (
                  <div className="flex items-center gap-2">
                    <p>
                      {t("wifiPassword")}:{" "}
                      <span className="font-mono">
                        {property.wifi_password}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          property.wifi_password!,
                          "wifi_password",
                        )
                      }
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title={t("copy")}
                    >
                      {copiedField === "wifi_password" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-sm text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                {t("lockedHint")}
              </div>
            )}
          </div>
        </div>
      )}

      {/* House rules — accordion */}
      {property.house_rules && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setRulesExpanded(!rulesExpanded)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <BookOpen className="h-5 w-5 text-slate-400 shrink-0" />
            <span className="text-sm font-medium text-slate-700 flex-1">
              {t("houseRulesLabel")}
            </span>
            {rulesExpanded ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {rulesExpanded && (
            <div className="px-4 pb-4 text-sm text-slate-600 whitespace-pre-line border-t border-slate-100 pt-3">
              {property.house_rules}
            </div>
          )}
        </div>
      )}

      {/* Post check-in note */}
      {property.checkin_instructions && unlocked && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
          <p className="text-sm font-medium text-blue-800 mb-1">
            {t("hostNote")}
          </p>
          <p className="text-sm text-blue-700 whitespace-pre-line">
            {property.checkin_instructions}
          </p>
        </div>
      )}
    </div>
  );
}
