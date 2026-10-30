"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    router.push("/dashboard");
  }

  return (
    
<div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060b16] p-4 text-slate-100 sm:p-8">

  {/* Background Glow */}
  <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
  <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

  <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-blue-500/20 bg-[#0a1224]/90 shadow-[0_0_80px_rgba(37,99,235,0.10)] md:grid-cols-2">

    {/* Left Branding Section */}
    <div className="relative hidden flex-col justify-between overflow-hidden border-r border-blue-500/15 bg-gradient-to-br from-[#0d1b3a] via-[#0b1530] to-[#080f20] p-10 md:flex lg:p-12">

      <div className="pointer-events-none absolute -right-20 top-1/4 h-64 w-64 rounded-full bg-blue-500/10 blur-[80px]" />

      {/* Logo */}
      <div className="relative flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 shadow-lg shadow-blue-950/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-7 w-7 text-blue-300"
          >
            <path d="M5 17h14l-1.5-6a2 2 0 0 0-2-1.5h-7A2 2 0 0 0 6.5 11L5 17Z" />
            <path d="M7 9.5 8.5 6h7L17 9.5M5 17v2h3v-2m8 0v2h3v-2M7 13h.01M17 13h.01" />
          </svg>
        </div>

        <div>
          <p className="text-lg font-bold tracking-wide text-white">
            AutoCare
          </p>
          <p className="text-xs tracking-widest text-blue-300">
            SERVICE MANAGEMENT
          </p>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative my-12">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
          <span className="text-xs font-medium text-blue-200">
            Your workshop, organized
          </span>
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight lg:text-5xl">
          Manage your
          <span className="mt-2 block bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-500 bg-clip-text text-transparent">
            service business
          </span>
          with confidence.
        </h1>

        <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
          Keep track of clients, vehicles, maintenance records, and upcoming
          service reminders — all in one place.
        </p>

        {/* Feature Items */}
        <div className="mt-9 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <path d="M12 3 20 7v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Organized client records</p>
              <p className="mt-1 text-xs text-slate-500">Keep customer information accessible.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-blue-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 10h18m-12 4h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">Maintenance reminders</p>
              <p className="mt-1 text-xs text-slate-500">Stay on top of upcoming services.</p>
            </div>
          </div>
        </div>
      </div>

      <p className="relative text-xs text-slate-500">
        Smart maintenance management. One simple workspace.
      </p>
    </div>

    {/* Login Section */}
    <div className="flex items-center justify-center bg-gradient-to-br from-[#0b1428]/95 to-[#080e1c]/95 p-6 sm:p-10 lg:p-12">
      <Card className="w-full max-w-sm border-0 bg-transparent text-slate-100 shadow-none">

        <CardHeader className="space-y-4 px-0 pb-7">
          {/* Mobile Logo */}
          <div className="mb-2 flex items-center gap-3 md:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/15 text-blue-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-6 w-6">
                <path d="M5 17h14l-1.5-6a2 2 0 0 0-2-1.5h-7A2 2 0 0 0 6.5 11L5 17Z" />
                <path d="M7 9.5 8.5 6h7L17 9.5M5 17v2h3v-2m8 0v2h3v-2" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-white">AutoCare</p>
              <p className="text-xs tracking-widest text-blue-300">SERVICE MANAGEMENT</p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Welcome back
            </p>

            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Sign in
            </CardTitle>

            <CardDescription className="mt-3 text-sm leading-6 text-slate-400">
              Enter your credentials to access your dashboard.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-0">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-200">
                Email address
              </Label>

              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 rounded-xl border-blue-500/20 bg-[#060d1d]/80 pl-11 text-slate-100 placeholder:text-slate-600 transition-all focus-visible:border-blue-400/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-200">
                Password
              </Label>

              <div className="relative">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                >
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2" />
                </svg>

                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-blue-500/20 bg-[#060d1d]/80 pl-11 text-slate-100 placeholder:text-slate-600 transition-all focus-visible:border-blue-400/50 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3"
              >
                <p className="text-sm leading-5 text-red-300">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-xl border border-blue-400/30 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 font-semibold text-white shadow-lg shadow-blue-950/40 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 hover:shadow-blue-900/40 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Login to Dashboard
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              )}
            </Button>

          </form>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-blue-500/10 pt-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 text-slate-500">
              <rect x="4" y="10" width="16" height="11" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
            <p className="text-xs text-slate-500">
              Secure access to your workspace
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>

  );
}