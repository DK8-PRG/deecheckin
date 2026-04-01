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
    <div className={className} data-error={error ? "" : undefined}>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-destructive shrink-0" />
          {t(error)}
        </p>
      )}
    </div>
  );
}
