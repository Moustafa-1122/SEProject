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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
;
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  UserPlus,
  Users,
  Wrench,
  X,
} from "lucide-react";

type Reminder = {
  id: number;
  client_id: number;
  client_name: string;
  mobile_number: string;
  make: string;
  model: string;
  plate_number: string;
  service_type: string;
  due_date: string;
  contacted_date: string | null;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Show All Clients", icon: Users },
  { href: "/clients/new", label: "Add Client", icon: UserPlus },
  { href: "/service-types", label: "Show All Service Types", icon: Wrench },
  { href: "/service-types/new", label: "Add Service Type", icon: Plus },
];

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleIdForRecord, setVehicleIdForRecord] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [editingReminderId, setEditingReminderId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReminders() {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setReminders(data);
      setLoading(false);
    }
    fetchReminders();
  }, []);

  async function handleMarkContacted(id: number) {
    const res = await fetch(`/api/reminders/${id}/contacted`, { method: "PATCH" });
    if (!res.ok) {
      alert("Failed to mark as contacted");
      return;
    }
    setReminders((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, contacted_date: new Date().toISOString() } : r
      )
    );
  }

  async function handlePostpone(id: number, date: Date) {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ due_date: date.toISOString().split("T")[0] }),
    });
    if (!res.ok) {
      alert("Failed to postpone reminder");
      return;
    }
    const updated = await res.json();
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, due_date: updated.due_date } : r))
    );
  }

  async function handleWhatsApp(id: number) {
    const res = await fetch(`/api/reminders/${id}/whatsapp-link`);
    if (!res.ok) {
      alert("Failed to generate WhatsApp link");
      return;
    }
    const data = await res.json();
    window.open(data.link, "_blank");
  }

  function startEditing(r: Reminder) {
    setEditingReminderId(r.id);
    setEditName(r.client_name);
    setEditMobile(r.mobile_number);
    setEditError(null);
  }

  async function handleSaveEdit(r: Reminder) {
    setEditError(null);
    setEditLoading(true);

    try {
      const res = await fetch(`/api/clients/${r.client_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, mobile_number: editMobile }),
      });

      const data = await res.json();
      setEditLoading(false);

      if (!res.ok) {
        setEditError(data.error);
        return;
      }

      setReminders((prev) =>
        prev.map((item) =>
          item.client_id === r.client_id
            ? { ...item, client_name: editName, mobile_number: editMobile }
            : item
        )
      );
      setEditingReminderId(null);
    } catch (error) {
      setEditError("Failed to update client");
      setEditLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#060b16]">
        <p className="text-slate-300">Loading...</p>
      </div>
    );
  }

  const pendingCount = reminders.filter((r) => !r.contacted_date).length;

  return (
    <div className="flex min-h-screen bg-[#060b16] text-slate-100">
      {/* ===== Mobile overlay (click to close) ===== */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ===== Sidebar (toolbar 3a chmel, openable/closable) ===== */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-blue-500/20 bg-gradient-to-b from-[#0b1733] via-[#080f20] to-[#060b16] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-blue-500/20 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-base font-bold tracking-tight text-transparent">
              Service Reminder
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg border border-blue-500/30 p-1.5 text-slate-400 transition-colors hover:border-blue-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-blue-500/50 bg-gradient-to-r from-[#102957] to-[#0b1733] text-white shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                    : "border border-transparent text-slate-300 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-white"
                }`}
              >
                <Icon
                  size={17}
                  className={isActive ? "text-blue-300" : "text-blue-400"}
                />
                {item.label}
              </Link>
            );
          })}

          {/* Quick Action: Add Record */}
          <div className="mt-6 space-y-2 rounded-xl border border-blue-500/20 bg-[#0b1530]/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Quick Add Record
            </p>
            <Input
              placeholder="Vehicle ID"
              value={vehicleIdForRecord}
              onChange={(e) => setVehicleIdForRecord(e.target.value)}
              className="h-9 rounded-lg border-blue-500/40 bg-[#080f20] text-sm text-white placeholder:text-slate-500 focus-visible:ring-blue-500/40"
            />
            <Button
              variant="outline"
              disabled={!vehicleIdForRecord}
              onClick={() =>
                router.push(`/vehicles/${vehicleIdForRecord}/service-records/new`)
              }
              className="h-9 w-full gap-2 rounded-lg border-blue-500/50 bg-gradient-to-r from-[#0b1733] to-[#080f20] text-sm text-white transition-all hover:border-blue-400 hover:bg-blue-950 disabled:opacity-40"
            >
              <Plus size={15} className="text-blue-400" />
              Add Record
            </Button>
          </div>
        </nav>

        {/* Logout pinned at bottom */}
       
{/* Theme Toggle + Logout pinned at bottom */}
<div className="space-y-3 border-t border-blue-500/20 p-3">
  

  <Button
    variant="outline"
    onClick={handleLogout}
    className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-gradient-to-r from-[#25101a] to-[#160c18] px-4 py-2 text-sm font-medium text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.06)] transition-all duration-200 hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300"
  >
    <LogOut size={16} />
    Logout
  </Button>
</div>

      </aside>

      {/* ===== Main content ===== */}
      <div
        className={`flex-1 transition-[margin] duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-0"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Open sidebar button (shows when sidebar is closed) */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/50 bg-gradient-to-r from-[#0b1733] to-[#080f20] text-blue-300 transition-all hover:border-blue-400 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                >
                  <Menu size={18} />
                </button>
              )}

              <div>
                <h1 className="bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  {pendingCount} reminder{pendingCount === 1 ? "" : "s"} pending contact
                </p>
              </div>
            </div>

            <Link
              href="/clients"
              className="group inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border border-blue-500/50 bg-gradient-to-r from-[#0b1733] to-[#080f20] px-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            >
              <Users size={17} className="text-blue-400" />
              Show All Clients
              <ArrowRight
                size={15}
                className="text-blue-400 transition-transform group-hover:translate-x-1"
              />
            </Link>

              

          </div>

          {/* Reminders Table */}
          <div className="overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-blue-500/30 bg-[#080f20] hover:bg-[#080f20]">
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Client</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Mobile</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Vehicle</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Plate</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Service</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Due Date</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Status</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {reminders.map((r) => {
                    const isEditingRow = editingReminderId === r.id;

                    return (
                      <TableRow
                        key={r.id}
                        className="border-b border-blue-500/15 transition-colors duration-200 hover:bg-blue-500/[0.07]"
                      >
                        <TableCell className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">
                          {isEditingRow ? (
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-9 min-w-32 rounded-lg border-blue-500/40 bg-[#080f20] text-white focus-visible:ring-blue-500/40"
                            />
                          ) : (
                            r.client_name
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 text-slate-300">
                          {isEditingRow ? (
                            <Input
                              value={editMobile}
                              onChange={(e) => setEditMobile(e.target.value)}
                              className="h-9 min-w-32 rounded-lg border-blue-500/40 bg-[#080f20] text-white focus-visible:ring-blue-500/40"
                            />
                          ) : (
                            r.mobile_number
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 text-slate-300">
                          {r.make} {r.model}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 font-medium text-blue-300">
                          {r.plate_number}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 text-slate-300">
                          {r.service_type}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3 text-slate-300">
                          {r.due_date}
                        </TableCell>

                        <TableCell className="whitespace-nowrap px-4 py-3">
                          {r.contacted_date ? (
                            <Badge className="border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10">
                              Contacted
                            </Badge>
                          ) : (
                            <Badge className="border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/10">
                              Pending
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="px-4 py-3">
                          {isEditingRow ? (
                            <div className="flex min-w-40 flex-col gap-2">
                              {editError && (
                                <p className="text-xs text-red-400">{editError}</p>
                              )}

                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEdit(r)}
                                  disabled={editLoading}
                                  className="h-8 rounded-lg border border-blue-500/50 bg-blue-600 px-3 text-white hover:bg-blue-500"
                                >
                                  {editLoading ? "Saving..." : "Save"}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingReminderId(null)}
                                  className="h-8 rounded-lg border-blue-500/40 bg-[#0b1733] px-3 text-slate-200 hover:bg-blue-950 hover:text-white"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex min-w-max flex-wrap items-center gap-2">
                              {!r.contacted_date && (
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkContacted(r.id)}
                                  className="h-8 rounded-lg border border-blue-500/60 bg-gradient-to-r from-[#102957] to-[#080f20] px-3 text-xs text-white transition-all hover:border-blue-400 hover:shadow-[0_0_12px_rgba(37,99,235,0.2)]"
                                >
                                  Mark Contacted
                                </Button>
                              )}

                              <Popover>
                                <PopoverTrigger className="inline-flex h-8 items-center justify-center rounded-lg border border-blue-500/40 bg-[#0b1733] px-3 text-xs font-medium text-blue-100 transition-all hover:border-blue-400 hover:bg-blue-950">
                                  Postpone
                                </PopoverTrigger>

                                <PopoverContent className="w-auto rounded-xl border border-blue-500/30 bg-[#0b1530] p-0 text-white shadow-xl">
                                  <Calendar
                                    mode="single"
                                    onSelect={(date) => {
                                      if (date) handlePostpone(r.id, date);
                                    }}
                                  />
                                </PopoverContent>
                              </Popover>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleWhatsApp(r.id)}
                                className="h-8 rounded-lg border border-blue-500/40 bg-[#0b1733] px-3 text-xs text-blue-100 transition-all hover:border-blue-400 hover:bg-blue-950 hover:text-white"
                              >
                                WhatsApp
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(r)}
                                className="h-8 rounded-lg border border-blue-500/40 bg-[#0b1733] px-3 text-xs text-blue-100 transition-all hover:border-blue-400 hover:bg-blue-950 hover:text-white"
                              >
                                Edit
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
