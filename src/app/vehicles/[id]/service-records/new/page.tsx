"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type ServiceType = {
    id: number;
    name: string;
    interval_month: number;
};

export default function NewServiceRecordPage() {
    const router = useRouter();
    const params = useParams();
    const vehicleId = params.id;

    const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
    const [serviceTypeId, setServiceTypeId] = useState("");
    const [serviceDate, setServiceDate] = useState("");
    const [odometer, setOdometer] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchServiceTypes() {
            const res = await fetch("/api/service-types");
            const data = await res.json();
            setServiceTypes(data.serviceTypes);  // ← هون التغيير، منستخرج الـ array من جوا الـ object
        }
        fetchServiceTypes();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const res = await fetch(`/api/vehicles/${vehicleId}/service-records`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                service_type_id: Number(serviceTypeId),
                service_date: serviceDate,
                odometer: Number(odometer),
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
        Add Service Record
      </CardTitle>

      <p className="mt-2 text-sm text-slate-400">
        Add maintenance details for Vehicle #{vehicleId}.
      </p>
    </CardHeader>

    <CardContent className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Service Type */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium text-blue-100">
            Service Type
          </Label>

          <Select
            value={serviceTypeId}
            onValueChange={(value) => setServiceTypeId(value ?? "")}
          >
            <SelectTrigger className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 focus:ring-blue-500/50">
              <SelectValue placeholder="Select a service type" />
            </SelectTrigger>

            <SelectContent className="border-blue-500/30 bg-[#0b1530] text-slate-100">
              {serviceTypes.map((st) => (
                <SelectItem
                  key={st.id}
                  value={String(st.id)}
                  className="focus:bg-blue-500/15 focus:text-blue-100"
                >
                  {st.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Service Date */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="serviceDate"
            className="text-sm font-medium text-blue-100"
          >
            Service Date
          </Label>

          <Input
            id="serviceDate"
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            required
            className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 focus-visible:ring-blue-500/50"
          />
        </div>

        {/* Odometer */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="odometer"
            className="text-sm font-medium text-blue-100"
          >
            Odometer
          </Label>

          <Input
            id="odometer"
            type="number"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            required
            placeholder="Enter current mileage"
            className="border-blue-500/25 bg-[#060d1d]/80 text-slate-100 placeholder:text-slate-500 focus-visible:ring-blue-500/50"
          />

          <p className="text-xs text-slate-500">
            Enter the vehicle's current mileage.
          </p>
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
          disabled={loading || !serviceTypeId}
          className="mt-1 w-full border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Service Record"}
        </Button>
      </form>
    </CardContent>
  </Card>
</div>
    );
}