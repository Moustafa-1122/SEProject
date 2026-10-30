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
  const params = useParams();
  const clientId = params.id;

  const [client, setClient] = useState<ClientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    async function fetchClient() {
      const res = await fetch(`/api/clients/${clientId}`);
      const data = await res.json();
      setClient(data.client);
      setLoading(false);
    }

    fetchClient();
  }, [clientId]);

  async function handleDeactivate() {
    const res = await fetch(`/api/clients/${clientId}/deactivate`, {
      method: "POST",
    });

    if (!res.ok) {
      alert("Failed to deactivate client");
      return;
    }

    setClient((prev) => (prev ? { ...prev, is_active: false } : prev));
  }

  async function handleActivate() {
    const res = await fetch(`/api/clients/${clientId}/activate`, {
      method: "POST",
    });

    if (!res.ok) {
      alert("Failed to activate client");
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
        setEditError(data.error);
        return;
      }

      setClient((prev) => (prev ? { ...prev, ...data.client } : prev));
      setIsEditing(false);
    } catch (error) {
      setEditError("Failed to update client");
      setEditLoading(false);
    }
  }

  if (loading) return <p className="p-8">Loading...</p>;
  if (!client) return <p className="p-8">Client not found</p>;

  return (
    <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">

      <Link
        href="/clients"
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
        Back
      </Link>

  {/* Client Information */}
  <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] p-5 shadow-[0_0_30px_rgba(37,99,235,0.08)] sm:flex-row sm:items-start sm:justify-between sm:p-6">
    {isEditing ? (
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div>
          <h1 className="mb-1 text-xl font-bold text-blue-100">
            Edit Client
          </h1>
          <p className="text-sm text-slate-400">
            Update the client's contact information.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="editName" className="text-sm font-medium text-blue-100">
            Name
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
            Mobile
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
            <p className="text-sm text-red-300">{editError}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleSaveEdit}
            disabled={editLoading}
            className="border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 text-white transition-all hover:from-blue-500 hover:to-blue-400 disabled:opacity-50"
          >
            {editLoading ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="border-slate-600 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
            Client Details
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
            Active
          </Badge>
        ) : (
          <Badge className="w-fit border border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/15">
            Inactive
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
          Edit Client
        </Button>

        {client.is_active ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeactivate}
            className="border border-red-400/20 bg-red-500/10 text-red-300 transition-all hover:bg-red-500/20 hover:text-red-200"
          >
            Deactivate Client
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleActivate}
            className="border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 transition-all hover:bg-emerald-500/20 hover:text-emerald-200"
          >
            Activate Client
          </Button>
        )}
      </div>
    )}
  </div>

  {/* Vehicles Header */}
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-2xl font-bold text-transparent">
        Vehicles
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Manage this client's vehicles and service records.
      </p>
    </div>

    <a
      href={`/clients/${clientId}/vehicles/new`}
      className={
        buttonVariants({ size: "sm" }) +
        " w-fit border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:from-blue-500 hover:to-blue-400"
      }
    >
      + Add Vehicle
    </a>
  </div>

  {/* Vehicles Table */}
  <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] shadow-[0_0_30px_rgba(37,99,235,0.08)]">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-blue-500/20 hover:bg-transparent">
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              Plate
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              Make
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              Model
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              Year
            </TableHead>
            <TableHead className="h-12 whitespace-nowrap font-semibold text-blue-200">
              Actions
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
                  + Add Record
                </a>
              </TableCell>
            </TableRow>
          ))}

          {client.vehicles.length === 0 && (
            <TableRow className="border-0 hover:bg-transparent">
              <TableCell
                colSpan={5}
                className="h-32 text-center text-sm text-slate-400"
              >
                No vehicles found for this client. Add a vehicle to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  </div>
</div>
  );
}
