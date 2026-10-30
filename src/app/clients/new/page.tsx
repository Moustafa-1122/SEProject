"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewClientPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [existingClientId, setExistingClientId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        mobile_number: mobileNumber,
        vehicle: {
          plate_number: plateNumber,
          make,
          model,
          year: Number(year),
        },
      }),
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
    <div className="flex min-h-screen items-center justify-center bg-[#060b16] p-4 text-slate-100 sm:p-8">

      <Button
        variant="outline"
        onClick={() => router.back()}
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-gradient-to-r from-[#0b1733] to-[#080f20] px-4 py-2 text-sm font-medium text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.08)] transition-all duration-200 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] focus-visible:ring-2 focus-visible:ring-blue-500/50"
      >
        <span className="text-lg">←</span>
        Back
      </Button>

      <Card className="w-full max-w-md overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] text-slate-100 shadow-[0_0_40px_rgba(37,99,235,0.10)]">
        <CardHeader className="border-b border-blue-500/15 px-6 pb-5 pt-6">
          <CardTitle className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
            Add New Client
          </CardTitle>
          <p className="mt-2 text-sm text-slate-400">
            Enter client details and their vehicle information.
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Client Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm font-medium text-blue-100">
                Client Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name"
                required
                className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
              />
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="mobile" className="text-sm font-medium text-blue-100">
                Mobile Number
              </Label>
              <Input
                id="mobile"
                placeholder="96171898929"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                required
                className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
              />
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px flex-1 bg-blue-500/20" />
              <span className="text-xs font-medium uppercase tracking-widest text-blue-300">
                Vehicle Details
              </span>
              <div className="h-px flex-1 bg-blue-500/20" />
            </div>

            {/* Plate Number */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="plate" className="text-sm font-medium text-blue-100">
                Plate Number
              </Label>
              <Input
                id="plate"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="Enter plate number"
                required
                className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
              />
            </div>

            {/* Make */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="make" className="text-sm font-medium text-blue-100">
                Make
              </Label>
              <Input
                id="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g. Toyota"
                required
                className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
              />
            </div>

            {/* Model */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="model" className="text-sm font-medium text-blue-100">
                Model
              </Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Corolla"
                required
                className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
              />
            </div>

            {/* Year */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="year" className="text-sm font-medium text-blue-100">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 2022"
                required
                className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="mt-1 w-full border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Client"}
            </Button>
          </form>

          {/* Existing Client Section */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-blue-500/20" />
            <span className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Existing Client
            </span>
            <div className="h-px flex-1 bg-blue-500/20" />
          </div>

          <div className="flex flex-col gap-3">
            <Label
              htmlFor="existingClientId"
              className="text-sm font-medium text-blue-100"
            >
              Existing Client ID
            </Label>

            <Input
              id="existingClientId"
              placeholder="Enter client ID"
              value={existingClientId}
              onChange={(e) => setExistingClientId(e.target.value)}
              className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
            />

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/clients/${existingClientId}/vehicles/new`)
              }
              disabled={!existingClientId}
              className="w-full border-blue-400/30 bg-blue-500/10 text-blue-200 transition-all hover:border-blue-300/60 hover:bg-blue-500/20 hover:text-white disabled:opacity-40"
            >
              Add Vehicle to Client
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}