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
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/dist/client/link";

type Client = {
  id: number;
  name: string;
  mobile_number: string;
  is_active: boolean;
  created_at: string;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // الخطوة 1: كل ما search تتغير، منستنى 400ms قبل ما نحدث debouncedSearch
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer); // cleanup: بيلغي الـ timer القديم
  }, [search]);

  // الخطوة 2: الـ fetch بيعتمد على debouncedSearch (مش search مباشرة)
  useEffect(() => {
    async function fetchClients() {
      setLoading(true);
      const url = debouncedSearch
        ? `/api/clients?search=${encodeURIComponent(debouncedSearch)}`
        : "/api/clients";
      const res = await fetch(url);
      const data = await res.json();
      setClients(data);
      setLoading(false);
    }

    fetchClients();
  }, [debouncedSearch]);

  return (
    <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">
      {/* Header */}

      <button >
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-gradient-to-r from-[#0b1733] to-[#080f20] px-4 py-2 text-sm font-medium text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.08)] transition-all duration-200 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
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
          Back to Dashboard
        </Link>
      </button>

      <div className="mb-8">
        <h1 className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          Clients
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Manage your clients and their contact information.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search by name or mobile number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm border-blue-500/30 bg-[#0b1530] text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
        />
      </div>

      {/* Clients Table */}
      {loading ? (
        <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#0b1733] to-[#080f20] p-8 text-center">
          <p className="animate-pulse text-sm text-blue-300">
            Loading clients...
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] shadow-[0_0_30px_rgba(37,99,235,0.08)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-blue-500/20 hover:bg-transparent">
                  <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                    Name
                  </TableHead>
                  <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                    Mobile
                  </TableHead>
                  <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                    Status
                  </TableHead>
                  <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                    Created
                  </TableHead>
                  <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {clients.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-b border-blue-500/10 transition-colors hover:bg-blue-500/[0.07]"
                  >
                    <TableCell>
                      <Link
                        href={`/clients/${c.id}`}
                        className="inline-flex items-center gap-2 font-medium text-blue-300 transition-colors hover:text-blue-100 hover:underline"
                        title={`View ${c.name}'s details`}
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
                      {c.mobile_number}
                    </TableCell>

                    <TableCell>
                      {c.is_active ? (
                        <Badge className="border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="whitespace-nowrap text-sm text-slate-400">
                      {c.created_at}
                    </TableCell>

                    <TableCell>
                      <a
                        href={`/clients/${c.id}/vehicles/new`}
                        className={buttonVariants({
                          size: "sm",
                          variant: "outline",
                        }) + " whitespace-nowrap border-blue-400/30 bg-blue-500/10 text-blue-200 transition-all hover:border-blue-300/60 hover:bg-blue-500/20 hover:text-white"}
                      >
                        + Add Vehicle
                      </a>
                    </TableCell>
                  </TableRow>
                ))}

                {clients.length === 0 && (
                  <TableRow className="border-0 hover:bg-transparent">
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-sm text-slate-400"
                    >
                      No clients found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}