"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "destructive";
  duration?: number;
}

interface ToastContextType {
  toast: (toast: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { ...toast, id }]);
      setTimeout(() => removeToast(id), toast.duration ?? 4000);
    },
    [removeToast],
  );

  const contextValue = useMemo(() => ({ toast: addToast }), [addToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto rounded-lg border bg-card p-4 shadow-lg transition-all animate-in slide-in-from-right-full duration-200",
              t.variant === "destructive" &&
                "border-destructive/30 bg-destructive/5",
              t.variant === "success" && "border-success/30 bg-success/5",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{t.title}</p>
                {t.description && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
