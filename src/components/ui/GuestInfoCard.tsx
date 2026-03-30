"use client";

import React from "react";
import { useTranslations } from "next-intl";

interface GuestInfo {
  id?: string;
  full_name: string;
  birth_date: string;
  nationality: string;
  document_type: string;
  document_number: string;
  address_street: string;
  address_city: string;
  address_zip: string;
  address_country: string;
  stay_purpose: string;
  phone?: string;
  email?: string;
  consent: boolean;
  created_at: string;
}

interface GuestInfoCardProps {
  guest: GuestInfo;
  reservationNumber: string;
  onClose?: () => void;
}

export function GuestInfoCard({
  guest,
  reservationNumber,
  onClose,
}: GuestInfoCardProps) {
  const t = useTranslations();

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("cs-CZ");
    } catch {
      return dateString;
    }
  };

  const formatAddress = () => {
    return `${guest.address_street}, ${guest.address_city}, ${guest.address_zip}, ${guest.address_country}`;
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-700 px-8 py-6 border-b dark:border-gray-700 rounded-t-2xl flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("guestInfo")}{" "}
          <span className="text-base font-normal text-gray-500 dark:text-gray-300">
            - {t("reservation")} #{reservationNumber}
          </span>
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            <span className="sr-only">{t("close")}</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Základní informace */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-200 border-b pb-2 mb-2">
              {t("basicInfo")}
            </h4>
            <div className="space-y-3 text-base">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("fullName")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {guest.full_name}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("birthDate")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {guest.birth_date}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("nationality")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {guest.nationality}
                </div>
              </div>
            </div>
          </div>

          {/* Doklady */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-200 border-b pb-2 mb-2">
              {t("documents")}
            </h4>
            <div className="space-y-3 text-base">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("documentType")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {guest.document_type}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("documentNumber")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {guest.document_number}
                </div>
              </div>
            </div>
          </div>

          {/* Adresa */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-200 border-b pb-2 mb-2">
              {t("address")}
            </h4>
            <div className="space-y-3 text-base">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("address")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {formatAddress()}
                </div>
              </div>
            </div>
          </div>

          {/* Pobyt */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-200 border-b pb-2 mb-2">
              {t("stayInfo")}
            </h4>
            <div className="space-y-3 text-base">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("stayPurpose")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {guest.stay_purpose}
                </div>
              </div>
            </div>
          </div>

          {/* Kontakt */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-200 border-b pb-2 mb-2">
              {t("contact")}
            </h4>
            <div className="space-y-3 text-base">
              {guest.phone && (
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    {t("phone")}:
                  </span>
                  <div className="text-gray-900 dark:text-white font-semibold">
                    {guest.phone}
                  </div>
                </div>
              )}
              {guest.email && (
                <div>
                  <span className="font-medium text-gray-500 dark:text-gray-400">
                    {t("email")}:
                  </span>
                  <div className="text-gray-900 dark:text-white font-semibold">
                    {guest.email}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ostatní */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-700 dark:text-blue-200 border-b pb-2 mb-2">
              {t("other")}
            </h4>
            <div className="space-y-3 text-base">
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("consent")}:
                </span>
                <div className="text-gray-900 dark:text-white">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      guest.consent
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {guest.consent ? t("yes") : t("no")}
                  </span>
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">
                  {t("registeredAt")}:
                </span>
                <div className="text-gray-900 dark:text-white font-semibold">
                  {formatDate(guest.created_at)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
