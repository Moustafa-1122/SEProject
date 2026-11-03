"use client";

import { useEffect, useState} from "react";
import { useLanguage } from "@/components/language-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { useRouter } from "next/navigation";


type ServiceType = {
  id: number;
  name: string;
  interval_month: number;
};

export default function ServiceTypesPage() {
  const { t } = useLanguage();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchServiceTypes() {
      try {
        const res = await fetch("/api/service-types");
        if (!res.ok) throw new Error("Failed to load service types");
        const data = await res.json();
        setServiceTypes(data.serviceTypes);
      } catch (error) {
        console.error("Failed to load service types:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchServiceTypes();
  }, []);
  


  return (
    <div className="min-h-screen bg-[#060b16] p-4 text-slate-100 sm:p-6 lg:p-8">

<Button
  variant="outline"
  onClick={() => router.back()}
  className="mb-5 inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-gradient-to-r from-[#0b1733] to-[#080f20] px-5 py-2 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.08)] transition-all duration-200 hover:border-blue-400/60 hover:bg-blue-500/10 hover:text-white"
>
  <span className="text-lg rtl:rotate-180">←</span>
  {t("Back")}
</Button>

  {/* Header */}
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
        {t("Service Types")}
      </h1>
      <p className="mt-2 text-sm text-slate-400">
        {t("Manage your vehicle maintenance services and intervals.")}
      </p>
    </div>

    <a
      href="/service-types/new"
      className={
        buttonVariants({ size: "sm" }) +
        " w-fit border border-blue-400/30 bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-white shadow-lg shadow-blue-950/30 transition-all hover:from-blue-500 hover:to-blue-400"
      }
    >
      + {t("Add Service Type")}
    </a>
  </div>

  {/* Service Types Table */}
  {loading ? (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#0b1733] to-[#080f20] p-8 text-center">
      <p className="animate-pulse text-sm text-blue-300">
        {t("Loading service types...")}
      </p>
    </div>
  ) : loadError ? (
    <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-8 text-center">
      <p className="text-sm text-red-300">{t("Failed to load service types. Please refresh and try again.")}</p>
    </div>
  ) : (
    <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] shadow-[0_0_30px_rgba(37,99,235,0.08)]">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-blue-500/20 hover:bg-transparent">
              <TableHead className="h-12 font-semibold text-blue-200">
                {t("Name")}
              </TableHead>
              <TableHead className="h-12 font-semibold text-blue-200">
                {t("Interval (months)")}
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {serviceTypes.map((st) => (
              <TableRow
                key={st.id}
                className="border-b border-blue-500/10 transition-colors hover:bg-blue-500/[0.07]"
              >
                <TableCell className="py-4 font-medium text-slate-100">
                  {st.name}
                </TableCell>

                <TableCell className="py-4">
                  <span className="inline-flex items-center rounded-lg border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-200">
                    {st.interval_month} {t("months")}
                  </span>
                </TableCell>
              </TableRow>
            ))}

            {serviceTypes.length === 0 && (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  colSpan={2}
                  className="h-32 text-center text-sm text-slate-400"
                >
                  {t("No service types found. Add your first service type to get started.")}
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