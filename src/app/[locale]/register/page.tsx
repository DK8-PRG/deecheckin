"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { signUp } from "@/actions/auth";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const params = useParams();
  const locale = params.locale as string;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    const result = await signUp(email, password);

    if (result.error) {
      setError(t("registerError"));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-xl font-bold text-primary-foreground">D</span>
          </div>
          <h1 className="text-2xl font-semibold">{t("registerSuccess")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("registerSuccessDescription")}
          </p>
          <a
            href={`/${locale}/login`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("goToLogin")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <span className="text-xl font-bold text-primary-foreground">D</span>
          </div>
          <h1 className="text-2xl font-semibold">{t("registerTitle")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("registerSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none"
            >
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium leading-none"
            >
              {t("confirmPasswordLabel")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              placeholder={t("confirmPasswordPlaceholder")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {loading ? t("registering") : t("registerButton")}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {t("hasAccount")}{" "}
          <a
            href={`/${locale}/login`}
            className="text-primary hover:underline font-medium"
          >
            {t("loginLink")}
          </a>
        </p>
      </div>
    </div>
  );
}
