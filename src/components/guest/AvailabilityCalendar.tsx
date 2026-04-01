"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AvailabilityCalendarProps {
  occupiedDates: { check_in: string; check_out: string }[];
}

function getOccupiedSet(
  ranges: { check_in: string; check_out: string }[],
): Set<string> {
  const set = new Set<string>();
  for (const range of ranges) {
    const start = new Date(range.check_in);
    const end = new Date(range.check_out);
    const current = new Date(start);
    while (current < end) {
      set.add(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
  }
  return set;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0 = Sunday, convert to Monday-first (0 = Monday)
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const WEEKDAYS_CS = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const MONTHS_CS = [
  "Leden",
  "Únor",
  "Březen",
  "Duben",
  "Květen",
  "Červen",
  "Červenec",
  "Srpen",
  "Září",
  "Říjen",
  "Listopad",
  "Prosinec",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function MonthGrid({
  year,
  month,
  occupiedSet,
  locale,
}: {
  year: number;
  month: number;
  occupiedSet: Set<string>;
  locale: string;
}) {
  const t = useTranslations("guestLanding");
  const months = locale === "cs" ? MONTHS_CS : MONTHS_EN;
  const weekdays = locale === "cs" ? WEEKDAYS_CS : WEEKDAYS_EN;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const today = new Date().toISOString().split("T")[0];

  const cells: React.ReactNode[] = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isOccupied = occupiedSet.has(dateStr);
    const isToday = dateStr === today;
    const isPast = dateStr < today;

    cells.push(
      <div
        key={dateStr}
        title={isOccupied ? t("occupied") : isPast ? "" : t("available")}
        className={`
          relative flex items-center justify-center h-9 w-full rounded-md text-sm font-medium transition-all duration-150
          ${isOccupied ? "bg-red-100 text-red-700" : isPast ? "text-slate-300" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 cursor-default"}
          ${isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}
        `}
      >
        {day}
      </div>,
    );
  }

  return (
    <div>
      <h3 className="text-center font-semibold text-slate-700 mb-3">
        {months[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {weekdays.map((wd) => (
          <div
            key={wd}
            className="text-center text-xs font-medium text-slate-400 pb-1"
          >
            {wd}
          </div>
        ))}
        {cells}
      </div>
    </div>
  );
}

export function AvailabilityCalendar({
  occupiedDates,
}: Readonly<AvailabilityCalendarProps>) {
  const t = useTranslations("guestLanding");
  const now = new Date();
  const [startMonth, setStartMonth] = useState(now.getMonth());
  const [startYear, setStartYear] = useState(now.getFullYear());

  const occupiedSet = useMemo(
    () => getOccupiedSet(occupiedDates),
    [occupiedDates],
  );

  const isCurrentMonth =
    startYear === now.getFullYear() && startMonth === now.getMonth();

  const handlePrev = () => {
    if (isCurrentMonth) return;
    const d = new Date(startYear, startMonth - 1);
    setStartMonth(d.getMonth());
    setStartYear(d.getFullYear());
  };

  const handleNext = () => {
    const d = new Date(startYear, startMonth + 1);
    setStartMonth(d.getMonth());
    setStartYear(d.getFullYear());
  };

  const month2 = new Date(startYear, startMonth + 1);
  const locale = t("locale") === "cs" ? "cs" : "en";
  const monthNames = locale === "cs" ? MONTHS_CS : MONTHS_EN;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={isCurrentMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium text-slate-700">
          {monthNames[startMonth]} – {monthNames[month2.getMonth()]}{" "}
          {month2.getFullYear()}
        </span>
        <Button variant="outline" size="sm" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MonthGrid
          year={startYear}
          month={startMonth}
          occupiedSet={occupiedSet}
          locale={locale}
        />
        <MonthGrid
          year={month2.getFullYear()}
          month={month2.getMonth()}
          occupiedSet={occupiedSet}
          locale={locale}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-200" />
          {t("available")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-200" />
          {t("occupied")}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded ring-2 ring-blue-500" />
          {t("today")}
        </div>
      </div>
    </div>
  );
}
