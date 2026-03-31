import React from "react";
import type { TranslationFn } from "./types";

export function FormField({
  label,
  error,
  t,
  className,
  children,
}: Readonly<{
  label: string;
  error?: string;
  t: TranslationFn;
  className?: string;
  children: React.ReactNode;
}>) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{t(error)}</p>}
    </div>
  );
}
