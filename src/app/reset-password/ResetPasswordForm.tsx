"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/language-provider";

export default function ResetPasswordForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("Password must be at least 8 characters"));
      return;
    }
    if (password !== confirm) {
      setError(t("Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(t(data.error));
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      setError(t("Network error. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060b16] p-4 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-blue-500/20 bg-[#0a1224]/90 p-8 shadow-[0_0_80px_rgba(37,99,235,0.10)]">
        {!token ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{t("Invalid reset link")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {t("This link is missing its token. Request a new one.")}
            </p>
            <Link
              href="/forgot-password"
              className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              {t("Request a new link")}
            </Link>
          </div>
        ) : done ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">{t("Password updated")}</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {t("Redirecting you to the login page...")}
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300 hover:underline"
            >
              {t("Go to login now")}
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              {t("Password recovery")}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {t("Choose a new password")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {t("Use at least 8 characters.")}
            </p>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                  {t("New password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-blue-500/20 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-600 focus-visible:border-blue-400/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirm" className="text-sm font-medium text-slate-200">
                  {t("Confirm new password")}
                </Label>
                <Input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                  {error.toLowerCase().includes("link") && (
                    <Link
                      href="/forgot-password"
                      className="mt-2 inline-block text-sm text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      {t("Request a new link")}
                    </Link>
                  )}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-950/40 transition-all duration-200 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t("Updating...") : t("Update password")}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
