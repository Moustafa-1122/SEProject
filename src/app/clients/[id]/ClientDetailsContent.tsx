"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Car, UserX } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type LoadStatus = "loading" | "ready" | "notfound" | "error";

// (loading / error / not found / ready)
function BackLink() {
  const { t } = useLanguage();

  return (
    <Link
      href="/clients"
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
      {t("Back")}
    </Link>
  );
}

// same body as the client details page but with skeleton loaders instead of the actual data
export function ClientDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">
      <BackLink />

      {/* Client card skeleton */}
      <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-24 animate-pulse rounded bg-blue-500/10" />
          <div className="h-8 w-56 animate-pulse rounded bg-blue-500/10" />
          <div className="h-4 w-36 animate-pulse rounded bg-blue-500/10" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-blue-500/10" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-blue-500/10" />
          <div className="h-8 w-36 animate-pulse rounded-lg bg-blue-500/10" />
        </div>
      </div>

      {/* Vehicles header skeleton */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-7 w-32 animate-pulse rounded bg-blue-500/10" />
          <div className="h-4 w-64 animate-pulse rounded bg-blue-500/10" />
        </div>
        <div className="h-8 w-28 animate-pulse rounded-lg bg-blue-500/10" />
      </div>

      {/* Vehicles table skeleton */}
      <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20]">
        <div className="border-b border-blue-500/20 p-4">
          <div className="h-4 w-1/3 animate-pulse rounded bg-blue-500/10" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 border-b border-blue-500/10 p-4 last:border-0"
          >
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="h-4 animate-pulse rounded bg-blue-500/10"
                style={{ width: `${12 + ((i + j) % 3) * 6}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

type Vehicle = {
  id: number;
  plate_number: string;
  make: string;
  model: string;
  year: number;
};

type ClientDetails = {
  id: number;
  name: string;
  mobile_number: string;
  is_active: boolean;
  created_at: string;
  vehicles: Vehicle[];
};

export default function ClientDetailsContent() {
  const { t } = useLanguage();
  const params = useParams();
  const clientId = params.id;

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  // Esc close deactivate confirm modal 
  useEffect(() => {
    if (!showDeactivateConfirm) return;

    try {
      function onKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" && !deactivateLoading) {
          setShowDeactivateConfirm(false);
        }
      }

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    } catch (error) {
      console.error("Failed to register deactivate dialog keyboard handler:", error);
    }
  }, [showDeactivateConfirm, deactivateLoading]);

  useEffect(() => {
    if (!clientId) return; // should never happen but just in case

    let cancelled = false;

    async function fetchClient() {
      setStatus("loading");
      try {
        const res = await fetch(`/api/clients/${clientId}`);

        // if the client is not found, we'll show a not found page 
        if (res.status === 404 || res.status === 400) {
          if (!cancelled) setStatus("notfound");
          return;
        }
        if (!res.ok) throw new Error("Failed to load client");

        const data = await res.json();
        if (cancelled) return;

        if (!data.client) {
          setStatus("notfound");
          return;
        }
        setClient(data.client);
        setStatus("ready");
      } catch (error) {
        if (!cancelled) setStatus("error");
      }
    }

    fetchClient();

    return () => {
      cancelled = true;
    };
  }, [clientId, reloadKey]);

  function openDeactivateConfirm() {
    setDeactivateError(null);
    setShowDeactivateConfirm(true);
  }

  // run editName and editMobile setters when client changes
  async function handleDeactivate() {
    setDeactivateError(null);
    setDeactivateLoading(true);

    try {
      const res = await fetch(`/api/clients/${clientId}/deactivate`, {
        method: "POST",
      });

      if (!res.ok) {
        setDeactivateError(t("Failed to deactivate client. Please try again."));
        return;
      }

      setClient((prev) => (prev ? { ...prev, is_active: false } : prev));
      setShowDeactivateConfirm(false);
    } catch (error) {
      setDeactivateError(t("Network error. Please try again."));
    } finally {
      setDeactivateLoading(false);
    }
  }

  async function handleActivate() {
    const res = await fetch(`/api/clients/${clientId}/activate`, {
      method: "POST",
    });

    if (!res.ok) {
      alert(t("Failed to activate client"));
      return;
    }

    setClient((prev) => (prev ? { ...prev, is_active: true } : prev));
  }

  function startEditing() {
    if (!client) return;
    setEditName(client.name);
    setEditMobile(client.mobile_number);
    setEditError(null);
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          mobile_number: editMobile,
        }),
      });

      const data = await res.json();
      setEditLoading(false);

      if (!res.ok) {
        setEditError(t(data.error));
        return;
      }

      setClient((prev) => (prev ? { ...prev, ...data.client } : prev));
      setIsEditing(false);
    } catch (error) {
      setEditError(t("Failed to update client"));
      setEditLoading(false);
    }
  }

  if (status === "loading") return <ClientDetailsSkeleton />;

  if (status === "notfound") {
    return (
      <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">
        <BackLink />
        <div className="mx-auto mt-16 max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
            <UserX size={28} className="text-blue-300" />
          </div>
          <h1 className="text-xl font-bold text-white">{t("Client not found")}</h1>
          <p className="mt-2 text-sm text-slate-400">
            {t("This client doesn't exist or may have been removed.")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "error" || !client) {
    return (
      <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">
        <BackLink />
        <div className="mx-auto mt-16 max-w-md text-center">
          <h1 className="text-xl font-bold text-red-300">
            {t("Couldn't load this client")}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {t("Something went wrong while loading. Check your connection and try again.")}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-5 border-blue-500/40 bg-[#0b1733] text-blue-100 hover:bg-blue-950 hover:text-white"
          >
            {t("Try again")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">

      <BackLink />

  {/* Client Information */}
  <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-5 shadow-[0_0_30px_rgba(37,99,235,0.08)] sm:flex-row sm:items-start sm:justify-between sm:p-6">
    {isEditing ? (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="mb-1 text-xl font-bold text-blue-100">
            {t("Edit Client")}
          </h1>
          <p className="text-sm text-slate-400">
            {t("Update the client's contact information.")}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="editName" className="text-sm font-medium text-blue-100">
            {t("Name")}
          </Label>
          <Input
            id="editName"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="editMobile" className="text-sm font-medium text-blue-100">
            {t("Mobile")}
          </Label>
          <Input
            id="editMobile"
            value={editMobile}
            onChange={(e) => setEditMobile(e.target.value)}
            className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
          />
        </div>

        {editError && (
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{t(editError)}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleSaveEdit}
            disabled={editLoading}
            className="border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 text-white transition-all hover:from-blue-500 hover:to-blue-400 disabled:opacity-50"
          >
            {editLoading ? t("Saving...") : t("Save Changes")}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            {t("Cancel")}
          </Button>
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            {t("Client Details")}
          </p>
          <h1 className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            {client.name}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {client.mobile_number}
          </p>
        </div>

        {client.is_active ? (
          <Badge className="w-fit border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15">
            {t("Active")}
          </Badge>
        ) : (
          <Badge className="w-fit border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15">
            {t("Inactive")}
          </Badge>
        )}
      </div>
    )}

    {!isEditing && (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={startEditing}
          className="border-blue-400/30 bg-blue-500/10 text-blue-200 transition-all hover:border-blue-300/60 hover:bg-blue-500/20 hover:text-white"
        >
          {t("Edit Client")}
        </Button>

        {client.is_active ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={openDeactivateConfirm}
            className="border border-red-400/20 bg-red-500/10 text-red-300 transition-all hover:bg-red-500/20 hover:text-red-200"
          >
            {t("Deactivate Client")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleActivate}
            className="border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200"
          >
            {t("Activate Client")}
          </Button>
        )}
      </div>
    )}
  </div>

  {/* Vehicles Header */}
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-2xl font-bold text-transparent">
        {t("Vehicles")}
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        {t("Manage this client's vehicles and service records.")}
      </p>
    </div>

    <a
      href={`/clients/${clientId}/vehicles/new`}
      className={
        buttonVariants({ size: "sm" }) +
        " w-fit border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:from-blue-500 hover:to-blue-400"
      }
    >
      + {t("Add Vehicle")}
    </a>
  </div>

  {/* Vehicles Table */}
  <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] shadow-[0_0_30px_rgba(37,99,235,0.08)]">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-blue-500/20 hover:bg-transparent">
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              {t("Plate")}
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              {t("Make")}
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              {t("Model")}
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              {t("Year")}
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              {t("Actions")}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {client.vehicles.map((v) => (
            <TableRow
              key={v.id}
              className="border-b border-blue-500/10 transition-colors hover:bg-blue-500/[0.07]"
            >
              <TableCell className="whitespace-nowrap py-4 font-medium text-slate-100">
                {v.plate_number}
              </TableCell>

              <TableCell className="py-4 text-slate-300">
                {v.make}
              </TableCell>

              <TableCell className="py-4 text-slate-300">
                {v.model}
              </TableCell>

              <TableCell className="py-4 text-slate-300">
                {v.year}
              </TableCell>

              <TableCell className="py-4">
                <a
                  href={`/vehicles/${v.id}/service-records/new`}
                  className={
                    buttonVariants({ size: "sm", variant: "outline" }) +
                    " whitespace-nowrap border-blue-400/30 bg-blue-500/10 text-blue-200 transition-all hover:border-blue-300/60 hover:bg-blue-500/20 hover:text-white"
                  }
                >
                  + {t("Add Record")}
                </a>
              </TableCell>
            </TableRow>
          ))}

          {client.vehicles.length === 0 && (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell colSpan={5} className="py-16 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                  <Car size={24} className="text-blue-300" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  {t("No vehicles yet")}
                </p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  {t("Add a vehicle to start logging services and reminders for this client.")}
                </p>
                <a
                  href={`/clients/${clientId}/vehicles/new`}
                  className={
                    buttonVariants({ size: "sm" }) +
                    " mt-4 border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white hover:from-blue-500 hover:to-blue-400"
                  }
                >
                  + {t("Add Vehicle")}
                </a>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </div>

  {/* Deactivate confirmation dialog */}
  {showDeactivateConfirm && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!deactivateLoading) setShowDeactivateConfirm(false);
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="deactivate-title"
        aria-describedby="deactivate-desc"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-red-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-6 shadow-[0_0_40px_rgba(239,68,68,0.12)]"
      >
        <h2 id="deactivate-title" className="text-lg font-bold text-white">
        {t("Deactivate {name}?").replace("{name}", client.name)}
        </h2>
        <p id="deactivate-desc" className="mt-2 text-sm leading-6 text-slate-400">
          {t("This client will be marked as inactive. You can reactivate them later from this page.")}
        </p>

        {deactivateError && (
          <div className="mt-4 rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{t(deactivateError)}</p>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            autoFocus
            disabled={deactivateLoading}
            onClick={() => setShowDeactivateConfirm(false)}
            className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            {t("Cancel")}
          </Button>

          <Button
            size="sm"
            variant="destructive"
            disabled={deactivateLoading}
            onClick={handleDeactivate}
            className="border border-red-400/30 bg-red-600 text-white hover:bg-red-500 disabled:opacity-60"
          >
            {deactivateLoading ? t("Deactivating...") : t("Yes, deactivate")}
          </Button>
        </div>
      </div>
    </div>
  )}
</div>
  );
}
