"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(t(data.error));
        return;
      }

      setSent(true);
    } catch (err) {
      setError(t("Network error. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060b16] p-4 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-blue-500/20 bg-[#0a1224]/90 p-8 shadow-[0_0_80px_rgba(37,99,235,0.10)]">
        {sent ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{t("Check your email")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {t("If an account exists for")}{" "}
              <span className="font-medium text-slate-200">{email}</span>
              {t(", we sent a link to reset your password. It's valid for 15 minutes.")}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              {t("Back to login")}
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t("Password recovery")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {t("Forgot password?")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {t("Enter your email and we&apos;ll send you a link to choose a new password.")}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                  {t("Email address")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("you@example.com")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-blue-500/20 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-600 focus-visible:border-blue-400/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3"
                >
                  <p className="text-sm leading-5 text-red-300">{t(error)}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-950/40 transition-all duration-200 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t("Sending...") : t("Send reset link")}
              </Button>

              <Link
                href="/login"
                className="text-center text-sm text-slate-400 hover:text-white hover:underline"
              >
                {t("Back to login")}
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
