"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SearchX, Users } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Client = {
  id: number;
  name: string;
  mobile_number: string;
  is_active: boolean;
  created_at: string;
};

export default function ClientsPage() {
  const { t } = useLanguage();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false); // true بعد أول تحميل ناجح
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // debouncedSearch wait 400ms abel ma ttla3 l result tab3it l search
  useEffect(() => {
    try {
      const timer = setTimeout(() => {
        setDebouncedSearch(search);
      }, 400);

      return () => clearTimeout(timer); // cleanup: bylghi l timer l adim
    } catch (error) {
      console.error("Failed to debounce client search:", error);
    }
  }, [search]);

  // fetch clients when the debounced search changes (or when Retry is clicked)
  useEffect(() => {
    let cancelled = false; // to cancel the fetch if the user changes the search again before the fetch completes

    async function fetchClients() {
      setLoading(true);
      setLoadError(false);
      try {
        const url = debouncedSearch
          ? `/api/clients?search=${encodeURIComponent(debouncedSearch)}`
          : "/api/clients";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load clients");
        const data = await res.json();
        if (cancelled) return;
        setClients(data);
        setHasLoaded(true);
      } catch (error) {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchClients();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, reloadKey]);

  // skeleton loading rows while fetching clients 
  const isInitialLoad = loading && !hasLoaded;
  const isRefreshing = loading && hasLoaded;

  function renderClientActions(client: Client) {
    return (
      <Link
        href={`/clients/${client.id}/vehicles/new`}
        className={
          buttonVariants({
            size: "sm",
            variant: "outline",
          }) +
          " h-10 border-blue-400/30 bg-blue-500/10 text-blue-200 transition-all hover:border-blue-300/60 hover:bg-blue-500/20 hover:text-white"
        }
      >
        + {t("Add Vehicle")}
      </Link>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">
      {/* Header */}
      <Link
        href="/dashboard"
        className="mb-4 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-gradient-to-r from-[#0b1733] to-[#080f20] px-4 py-2 text-sm font-medium text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.08)] transition-all duration-200 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="rtl:rotate-180"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
          <path d="M20 12H9" />
        </svg>
        {t("Back to Dashboard")}
      </Link>

      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
          {t("Clients")}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {t("Manage your clients and their contact information.")}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="search"
          placeholder={t("Search by name or mobile number...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full min-w-0 border-blue-500/30 bg-[#0b1530] text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50 sm:max-w-sm"
        />
      </div>

      {/* Clients Table (always rendered, states live inside the body) */}
      <div className="hidden overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] shadow-[0_0_30px_rgba(37,99,235,0.08)] md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-500/20 hover:bg-transparent">
                <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                  {t("Name")}
                </TableHead>
                <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                  {t("Mobile")}
                </TableHead>
                <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                  {t("Status")}
                </TableHead>
                <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                  {t("Created")}
                </TableHead>
                <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                  {t("Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody
              className={`transition-opacity duration-200 ${
                isRefreshing ? "opacity-50" : "opacity-100"
              }`}
            >
              {/* 1. Loading skeleton (first load only) */}
              {isInitialLoad &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow
                    key={`skeleton-${i}`}
                    className="border-b border-blue-500/10 hover:bg-transparent"
                  >
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j} className="py-4">
                        <div
                          className="h-4 animate-pulse rounded bg-blue-500/10"
                          style={{ width: `${55 + ((i + j) % 4) * 12}%` }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {/* 2. Error state */}
              {!loading && loadError && (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="py-16 text-center">
                    <p className="text-sm font-medium text-red-300">
                      {t("Couldn't load clients")}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReloadKey((k) => k + 1)}
                      className="mt-4 h-8 rounded-lg border-blue-500/40 bg-[#0b1733] px-3 text-xs text-blue-100 hover:bg-blue-950 hover:text-white"
                    >
                      {t("Try again")}
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {/* 3. Empty state: different message for "no results" vs "no clients yet" */}
              {!loading && !loadError && clients.length === 0 && (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="py-16 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                      {debouncedSearch ? (
                        <SearchX size={24} className="text-blue-300" />
                      ) : (
                        <Users size={24} className="text-blue-300" />
                      )}
                    </div>

                    {debouncedSearch ? (
                      <>
                        <p className="text-sm font-medium text-slate-200">
                          {t("No results for")}&nbsp;&quot;{debouncedSearch}&quot;
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                          {t("Try a different name or mobile number.")}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-slate-200">
                          {t("No clients yet")}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                          {t("Add your first client to start tracking their vehicles and service reminders.")}
                        </p>
                        <Link
                          href="/clients/new"
                          className={
                            buttonVariants({ size: "sm" }) +
                            " mt-4 border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white hover:from-blue-500 hover:to-blue-400"
                          }
                        >
                          + {t("Add Client")}
                        </Link>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )}

              {/* 4. Data (kept visible but dimmed while a new search is loading) */}
              {!isInitialLoad &&
                !loadError &&
                clients.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-b border-blue-500/10 transition-colors hover:bg-blue-500/[0.07]"
                  >
                    <TableCell>
                      <Link
                        href={`/clients/${c.id}`}
                        className="inline-flex items-center gap-2 font-medium text-blue-300 transition-colors hover:text-blue-100 hover:underline"
                        title={t("View {name}'s details").replace("{name}", c.name)}
                      >
                        {c.name}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M7 17 17 7" />
                          <path d="M7 7h10v10" />
                        </svg>
                      </Link>
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-slate-300">
                      <span dir="ltr">{c.mobile_number}</span>
                    </TableCell>

                    <TableCell>
                      {c.is_active ? (
                        <Badge className="border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15">
                          {t("Active")}
                        </Badge>
                      ) : (
                        <Badge className="border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15">
                          {t("Inactive")}
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-slate-400">
                      {c.created_at}
                    </TableCell>

                    <TableCell>{renderClientActions(c)}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {isInitialLoad ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`mobile-skeleton-${index}`}
              className="animate-pulse rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-4"
            >
              <div className="h-4 w-2/5 rounded bg-blue-500/10" />
              <div className="mt-4 h-4 w-1/2 rounded bg-blue-500/10" />
              <div className="mt-4 h-10 w-32 rounded bg-blue-500/10" />
            </div>
          ))
        ) : loadError ? (
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-6 text-center">
            <p className="text-sm font-medium text-red-300">{t("Couldn't load clients")}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-4 h-10 rounded-lg border-blue-500/40 bg-[#0b1733] px-3 text-xs text-blue-100 hover:bg-blue-950 hover:text-white"
            >
              {t("Try again")}
            </Button>
          </div>
        ) : clients.length === 0 ? (
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
              {debouncedSearch ? (
                <SearchX size={24} className="text-blue-300" />
              ) : (
                <Users size={24} className="text-blue-300" />
              )}
            </div>
            {debouncedSearch ? (
              <>
                <p className="break-words text-sm font-medium text-slate-200">
                  {t("No results for")}&nbsp;&quot;{debouncedSearch}&quot;
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  {t("Try a different name or mobile number.")}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-200">{t("No clients yet")}</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  {t("Add your first client to start tracking their vehicles and service reminders.")}
                </p>
                <Link
                  href="/clients/new"
                  className={
                    buttonVariants({ size: "sm" }) +
                    " mt-4 h-10 border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white hover:from-blue-500 hover:to-blue-400"
                  }
                >
                  + {t("Add Client")}
                </Link>
              </>
            )}
          </div>
        ) : (
          clients.map((client) => (
            <article
              key={`mobile-${client.id}`}
              className={`min-w-0 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-4 shadow-[0_0_30px_rgba(37,99,235,0.08)] transition-opacity ${
                isRefreshing ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <Link
                  href={`/clients/${client.id}`}
                  className="min-w-0 break-words font-medium text-blue-300 transition-colors hover:text-blue-100 hover:underline"
                  title={t("View {name}'s details").replace("{name}", client.name)}
                >
                  {client.name}
                </Link>
                {client.is_active ? (
                  <Badge className="shrink-0 border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15">
                    {t("Active")}
                  </Badge>
                ) : (
                  <Badge className="shrink-0 border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15">
                    {t("Inactive")}
                  </Badge>
                )}
              </div>
              <div className="mt-4 grid min-w-0 grid-cols-2 gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{t("Mobile")}</p>
                  <p dir="ltr" className="truncate text-slate-300">{client.mobile_number}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{t("Created")}</p>
                  <p dir="ltr" className="break-words text-slate-400">{client.created_at}</p>
                </div>
              </div>
              <div className="mt-4">{renderClientActions(client)}</div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
