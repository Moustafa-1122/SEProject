"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { isPositiveInteger, NumericInput } from "@/components/ui/numeric-input";
import { useLanguage } from "@/components/language-provider";
import { LanguageToggle } from "@/components/language-toggle";
import { ThemeToggle } from "@/components/theme-toggle";
import type { LucideIcon } from "lucide-react";

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

type Comparison = {
  this_month: number;
  last_month: number;
  change_percent: number | null;
};

type Stats = {
  active_clients: { total: number; new_this_month: number };
  service_records: Comparison;
  clients_visited: Comparison;
  new_clients: Comparison;
  overdue: { total: number };
};

type ReminderStatus = "contacted" | "overdue" | "pending";

// Must live OUTSIDE the component: Next.js Cache Components rejects new Date() during render.
// Only call it from event handlers / rows that render after data has loaded.
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStatus(
  dueDate: string,
  contactedDate: string | null,
  today: string | null
): ReminderStatus {
  if (contactedDate) return "contacted";
  if (!today) return "pending";
  return dueDate.slice(0, 10) < today ? "overdue" : "pending";
}

const STATUS_STYLES: Record<ReminderStatus, { label: string; className: string }> = {
  contacted: { label: "Contacted", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  overdue: { label: "Overdue", className: "border-red-500/30 bg-red-500/10 text-red-300" },
  pending: { label: "Pending", className: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
};

function StatusBadge({ status }: { status: ReminderStatus }) {
  const { t } = useLanguage();
  const s = STATUS_STYLES[status];
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.className}`}>
      {t(s.label)}
    </span>
  );
}

function ChangeBadge({ percent }: { percent: number | null }) {
  const { t } = useLanguage();

  if (percent === null) {
    return <span className="text-[11px] text-slate-500">{t("No prior data")}</span>;
  }
  const isUp = percent > 0;
  const isDown = percent < 0;

  return (
    <div className="flex items-center gap-1.5">
      <span
        dir="ltr"
        className={`rounded border px-1 py-px text-[11px] font-medium ${isUp
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : isDown
            ? "border-red-500/30 bg-red-500/10 text-red-300"
            : "border-slate-500/30 bg-slate-500/10 text-slate-300"
          }`}
      >
        {isUp ? "+" : ""}
        {percent}%
      </span>
      <span className="truncate text-[11px] text-slate-500">{t("vs last month")}</span>
    </div>
  );
}

function StatCard({
  title,
  icon: Icon,
  value,
  loading,
  footer,
  valueClassName = "text-white",
}: {
  title: string;
  icon: LucideIcon;
  value: string | number;
  loading: boolean;
  footer: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-slate-300">{title}</p>
        <Icon size={15} className="shrink-0 text-blue-300" />
      </div>

      <div className="mt-1.5">
        {loading ? (
          <div className="h-7 w-14 animate-pulse rounded bg-blue-500/10" />
        ) : (
          <p className={`text-2xl font-bold tracking-tight ${valueClassName}`}>{value}</p>
        )}
      </div>

      <div className="mt-1.5 min-h-4">
        {loading ? (
          <div className="h-3 w-24 animate-pulse rounded bg-blue-500/10" />
        ) : (
          footer
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, t } = useLanguage();

  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/clients", label: "Show All Clients", icon: Users },
    { href: "/clients/new", label: "Add Client", icon: UserPlus },
    { href: "/service-types", label: "Show All Service Types", icon: Wrench },
    { href: "/service-types/new", label: "Add Service Type", icon: Plus },
  ];

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false); // error handling
  const [reloadKey, setReloadKey] = useState(0); // retry
  const [vehicleIdForRecord, setVehicleIdForRecord] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [today, setToday] = useState<string | null>(null);

  const [editingReminderId, setEditingReminderId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | ReminderStatus>("all");

  useEffect(() => {
    async function fetchReminders() {
      setLoading(true);
      setLoadError(false);
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) throw new Error("Failed to load reminders");
        const data = await res.json();
        setToday(new Date().toISOString().slice(0, 10));
        setReminders(data);
      } catch (error) {
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchReminders();
  }, [reloadKey]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        if (!res.ok) throw new Error("Failed to load stats");
        setStats(await res.json());
      } catch (error) {
        setStats(null); // cards show "—"
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  async function handleMarkContacted(id: number) {
    const res = await fetch(`/api/reminders/${id}/contacted`, { method: "PATCH" });
    if (!res.ok) {
      alert(t("Failed to mark as contacted"));
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
      body: JSON.stringify({ due_date: format(date, "yyyy-MM-dd") }),
    });
    if (!res.ok) {
      alert(t("Failed to postpone reminder"));
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
      alert(t("Failed to generate WhatsApp link"));
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
        setEditError(t(data.error));
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
      setEditError(t("Failed to update client"));
      setEditLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Everything not contacted yet (Pending + Overdue)
  const pendingCount = reminders.filter((r) => !r.contacted_date).length;

  // Per-status counts for the filter tabs
  const counts = { all: reminders.length, pending: 0, overdue: 0, contacted: 0 };
  for (const r of reminders) {
    counts[getStatus(r.due_date, r.contacted_date, today)]++;
  }

  const visibleReminders =
    statusFilter === "all"
      ? reminders
      : reminders.filter(
        (r) => getStatus(r.due_date, r.contacted_date, today) === statusFilter
      );

  const overdueTotal = stats?.overdue?.total ?? null;

  function renderReminderActions(r: Reminder) {
    const isEditingRow = editingReminderId === r.id;

    if (isEditingRow) {
      return (
        <div className="flex min-w-0 flex-col gap-2">
          {editError && <p className="break-words text-xs text-red-400">{t(editError)}</p>}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => handleSaveEdit(r)}
              disabled={editLoading}
              className="h-10 rounded-lg border border-blue-500/50 bg-blue-600 px-3 text-white hover:bg-blue-500"
            >
              {editLoading ? t("Saving...") : t("Save")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditingReminderId(null)}
              className="h-10 rounded-lg border-blue-500/40 bg-[#0b1733] px-3 text-slate-200 hover:bg-blue-950 hover:text-white"
            >
              {t("Cancel")}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {!r.contacted_date && (
          <Button
            size="sm"
            onClick={() => handleMarkContacted(r.id)}
            className="h-10 rounded-lg border border-blue-500/60 bg-gradient-to-r from-[#102957] to-[#080f20] px-3 text-xs text-white transition-all hover:border-blue-400 hover:shadow-[0_0_12px_rgba(37,99,235,0.2)]"
          >
            {t("Mark Contacted")}
          </Button>
        )}

        <Popover>
          <PopoverTrigger className="inline-flex h-10 items-center justify-center rounded-lg border border-blue-500/40 bg-[#0b1733] px-3 text-xs font-medium text-blue-100 transition-all hover:border-blue-400 hover:bg-blue-950">
            {t("Postpone")}
          </PopoverTrigger>
          <PopoverContent className="mx-4 w-[min(18rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-xl border border-blue-500/30 bg-[#0b1530] p-0 text-white shadow-xl">
            <Calendar
              mode="single"
              disabled={{ before: startOfToday() }}
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
          className="h-10 rounded-lg border border-blue-500/40 bg-[#0b1733] px-3 text-xs text-blue-100 transition-all hover:border-blue-400 hover:bg-blue-950 hover:text-white"
        >
          WhatsApp
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => startEditing(r)}
          className="h-10 rounded-lg border border-blue-500/40 bg-[#0b1733] px-3 text-xs text-blue-100 transition-all hover:border-blue-400 hover:bg-blue-950 hover:text-white"
        >
          {t("Edit")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#060b16] text-slate-100">
      {/* ===== Mobile overlay (click to close) ===== */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ===== Sidebar (openable/closable, mirrors for RTL) ===== */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 flex w-64 flex-col border-e border-blue-500/20 bg-gradient-to-b from-[#0b1733] via-[#080f20] to-[#060b16] transition-transform duration-300 ease-in-out ${mobileSidebarOpen
          ? "translate-x-0"
          : language === "ar"
            ? "translate-x-full"
            : "-translate-x-full"
          } ${sidebarOpen ? "lg:translate-x-0" : language === "ar" ? "lg:translate-x-full" : "lg:-translate-x-full"}`}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between gap-2 border-b border-blue-500/20 px-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Wrench size={18} className="text-white" />
            </div>
            <span className="bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-base font-bold tracking-tight text-transparent">
              {t("Service Reminder")}
            </span>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setMobileSidebarOpen(false);
              if (window.innerWidth >= 1024) setSidebarOpen(false);
            }}
            className="rounded-lg border border-blue-500/30 p-2 text-slate-400 transition-colors hover:border-blue-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("Menu")}
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setMobileSidebarOpen(false);
                }}
                className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${isActive
                  ? "border border-blue-500/50 bg-gradient-to-r from-[#102957] to-[#0b1733] text-white shadow-[0_0_15px_rgba(37,99,235,0.15)]"
                  : "border border-transparent text-slate-300 hover:border-blue-500/30 hover:bg-blue-500/5 hover:text-white"
                  }`}
              >
                <Icon
                  size={17}
                  className={isActive ? "text-blue-300" : "text-blue-400"}
                />
                {t(item.label)}
              </Link>
            );
          })}

          {/* Quick Action: Add Record */}
          <div className="mt-6 space-y-2 rounded-xl border border-blue-500/20 bg-[#0b1530]/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {t("Quick Add Record")}
            </p>
            <NumericInput
              placeholder={t("Vehicle ID")}
              value={vehicleIdForRecord}
              onValueChange={setVehicleIdForRecord}
              className="h-9 rounded-lg border-blue-500/40 bg-[#080f20] text-sm text-white placeholder:text-slate-500 focus-visible:ring-blue-500/40"
            />
            <Button
              variant="outline"
              disabled={!isPositiveInteger(vehicleIdForRecord)}
              onClick={() => {
                router.push(`/vehicles/${Number(vehicleIdForRecord)}/service-records/new`);
                setMobileSidebarOpen(false);
              }}
              className="h-9 w-full gap-2 rounded-lg border-blue-500/50 bg-gradient-to-r from-[#0b1733] to-[#080f20] text-sm text-white transition-all hover:border-blue-400 hover:bg-blue-950 disabled:opacity-40"
            >
              <Plus size={15} className="text-blue-400" />
              {t("Add Record")}
            </Button>
          </div>
        </nav>

        {/* Toggles + Logout pinned at bottom */}
        <div className="border-t border-blue-500/20 p-3">
          <LanguageToggle placement="sidebar" />
          <ThemeToggle placement="sidebar" />
          <Button
            variant="outline"
            onClick={handleLogout}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-gradient-to-r from-[#25101a] to-[#160c18] px-4 py-2 text-sm font-medium text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.06)] transition-all duration-200 hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={16} />
            {t("Logout")}
          </Button>
        </div>
      </aside>

      {/* ===== Main content ===== */}
      <div
        className={`min-w-0 flex-1 transition-[margin] duration-300 ease-in-out ${sidebarOpen ? "lg:ms-64" : "lg:ms-0"
          }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page header */}
          <div className="mb-6 flex min-w-0 flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Open sidebar button (shows when sidebar is closed) */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/50 bg-gradient-to-r from-[#0b1733] to-[#080f20] text-blue-300 transition-all hover:border-blue-400 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] lg:hidden"
                aria-label={t("Menu")}
              >
                <Menu size={18} />
              </button>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden h-10 w-10 items-center justify-center rounded-xl border border-blue-500/50 bg-gradient-to-r from-[#0b1733] to-[#080f20] text-blue-300 transition-all hover:border-blue-400 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] lg:flex"
                  aria-label={t("Menu")}
                >
                  <Menu size={18} />
                </button>
              )}

              <div>
                <h1 className="bg-gradient-to-r from-white via-blue-200 to-blue-500 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
                  {t("Dashboard")}
                </h1>
                {loading ? (
                  <div className="mt-2 h-4 w-48 animate-pulse rounded bg-blue-500/10" />
                ) : (
                  !loadError && (
                    <p className="mt-1 text-sm text-slate-400">
                      {pendingCount}{" "}
                      {pendingCount === 1
                        ? t("reminder pending contact")
                        : t("reminders pending contact")}
                    </p>
                  )
                )}
              </div>
            </div>

            <Link
              href="/clients"
              className="group inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl border border-blue-500/50 bg-gradient-to-r from-[#0b1733] to-[#080f20] px-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:border-blue-400 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]"
            >
              <Users size={17} className="text-blue-400" />
              {t("Show All Clients")}
              <ArrowRight
                size={15}
                className="text-blue-400 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              />
            </Link>
          </div>

          {/* Stats cards */}
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard
              title={t("Overdue")}
              icon={Clock}
              loading={statsLoading}
              value={overdueTotal ?? "—"}
              valueClassName={
                overdueTotal !== null && overdueTotal > 0 ? "text-red-300" : "text-white"
              }
              footer={
                overdueTotal !== null ? (
                  <span
                    className={`text-[11px] ${overdueTotal > 0 ? "text-red-300/80" : "text-emerald-300"
                      }`}
                  >
                    {overdueTotal > 0 ? t("Not contacted yet") : t("All caught up")}
                  </span>
                ) : (
                  <span className="text-xs text-red-300">{t("Couldn't load")}</span>
                )
              }
            />

            <StatCard
              title={t("Active clients")}
              icon={Users}
              value={stats ? stats.active_clients.total : "—"}
              loading={statsLoading}
              footer={
                stats ? (
                  <span className="text-[11px] text-slate-500">
                    +{stats.active_clients.new_this_month} {t("new this month")}
                  </span>
                ) : (
                  <span className="text-xs text-red-300">{t("Couldn't load")}</span>
                )
              }
            />

            <StatCard
              title={t("Services this month")}
              icon={ClipboardList}
              loading={statsLoading}
              value={stats ? stats.service_records.this_month : "—"}
              footer={
                stats ? (
                  <ChangeBadge percent={stats.service_records.change_percent} />
                ) : (
                  <span className="text-xs text-red-300">{t("Couldn't load")}</span>
                )
              }
            />

            <StatCard
              title={t("Clients visited this month")}
              icon={UserCheck}
              loading={statsLoading}
              value={stats ? stats.clients_visited.this_month : "—"}
              footer={
                stats ? (
                  <ChangeBadge percent={stats.clients_visited.change_percent} />
                ) : (
                  <span className="text-xs text-red-300">{t("Couldn't load")}</span>
                )
              }
            />

            <StatCard
              title={t("New clients this month")}
              icon={UserPlus}
              loading={statsLoading}
              value={stats ? stats.new_clients.this_month : "—"}
              footer={
                stats ? (
                  <ChangeBadge percent={stats.new_clients.change_percent} />
                ) : (
                  <span className="text-xs text-red-300">{t("Couldn't load")}</span>
                )
              }
            />
          </div>

          {/* Status filter */}
          {!loading && !loadError && reminders.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {(
                [
                  { key: "all", label: t("All") },
                  { key: "pending", label: t("Pending") },
                  { key: "overdue", label: t("Overdue") },
                  { key: "contacted", label: t("Contacted") },
                ] as const
              ).map((tab) => {
                const active = statusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition-all ${active
                      ? "border-blue-400 bg-blue-500/20 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                      : "border-blue-500/30 bg-[#0b1733] text-slate-300 hover:border-blue-400/60 hover:text-white"
                      }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-md px-1.5 text-xs ${active ? "bg-blue-400/30 text-white" : "bg-blue-500/10 text-blue-300"
                        }`}
                    >
                      {counts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Reminders Table */}
          <div className="hidden overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-[#0b1733] via-[#0b1530] to-[#080f20] shadow-[0_8px_30px_rgba(0,0,0,0.25)] md:block">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-blue-500/30 bg-[#080f20] hover:bg-[#080f20]">
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Client")}</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Mobile")}</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Vehicle")}</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Plate")}</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Service")}</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Due Date")}</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Status")}</TableHead>
                    <TableHead className="whitespace-nowrap px-4 py-4 font-semibold text-blue-300">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {/* Loading skeleton */}
                  {loading &&
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow
                        key={`skeleton-${i}`}
                        className="border-b border-blue-500/15 hover:bg-transparent"
                      >
                        {Array.from({ length: 8 }).map((_, j) => (
                          <TableCell key={j} className="px-4 py-4">
                            <div
                              className="h-4 animate-pulse rounded bg-blue-500/10"
                              style={{ width: `${55 + ((i + j) % 4) * 12}%` }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}

                  {/* Error state */}
                  {!loading && loadError && (
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell colSpan={8} className="px-4 py-16 text-center">
                        <p className="text-sm font-medium text-red-300">
                          {t("Couldn't load reminders")}
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

                  {/* Empty state */}
                  {!loading && !loadError && reminders.length === 0 && (
                    <TableRow className="border-0 hover:bg-transparent">
                      <TableCell colSpan={8} className="px-4 py-16 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                          <CheckCircle2 size={24} className="text-blue-300" />
                        </div>
                        <p className="text-sm font-medium text-slate-200">
                          {t("No reminders right now")}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                          {t("You're all caught up. Reminders appear here when a service is due within 7 days.")}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}

                  {/* No results for the selected filter */}
                  {!loading &&
                    !loadError &&
                    reminders.length > 0 &&
                    visibleReminders.length === 0 && (
                      <TableRow className="border-0 hover:bg-transparent">
                        <TableCell colSpan={8} className="px-4 py-12 text-center">
                          <p className="text-sm font-medium text-slate-200">
                            {t("No reminders match this filter")}
                          </p>
                          <button
                            type="button"
                            onClick={() => setStatusFilter("all")}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                          >
                            {t("Show all")}
                          </button>
                        </TableCell>
                      </TableRow>
                    )}

                  {!loading &&
                    !loadError &&
                    visibleReminders.map((r) => {
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
                              <span dir="ltr">{r.mobile_number}</span>
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
                            <StatusBadge status={getStatus(r.due_date, r.contacted_date, today)} />
                          </TableCell>

                          <TableCell className="px-4 py-3">
                            {renderReminderActions(r)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`mobile-skeleton-${index}`}
                  className="animate-pulse rounded-2xl border border-blue-500/30 bg-[#0b1530] p-4"
                >
                  <div className="h-4 w-2/5 rounded bg-blue-500/10" />
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="h-4 rounded bg-blue-500/10" />
                    <div className="h-4 rounded bg-blue-500/10" />
                    <div className="h-4 rounded bg-blue-500/10" />
                    <div className="h-4 rounded bg-blue-500/10" />
                  </div>
                </div>
              ))
            ) : loadError ? (
              <div className="rounded-2xl border border-blue-500/30 bg-[#0b1530] p-6 text-center">
                <p className="text-sm font-medium text-red-300">{t("Couldn't load reminders")}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setReloadKey((key) => key + 1)}
                  className="mt-4 h-10 rounded-lg border-blue-500/40 bg-[#0b1733] px-3 text-xs text-blue-100 hover:bg-blue-950 hover:text-white"
                >
                  {t("Try again")}
                </Button>
              </div>
            ) : reminders.length === 0 ? (
              <div className="rounded-2xl border border-blue-500/30 bg-[#0b1530] p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                  <CheckCircle2 size={24} className="text-blue-300" />
                </div>
                <p className="text-sm font-medium text-slate-200">{t("No reminders right now")}</p>
                <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                  {t("You're all caught up. Reminders appear here when a service is due within 7 days.")}
                </p>
              </div>
            ) : visibleReminders.length === 0 ? (
              <div className="rounded-2xl border border-blue-500/30 bg-[#0b1530] p-6 text-center">
                <p className="text-sm font-medium text-slate-200">{t("No reminders match this filter")}</p>
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {t("Show all")}
                </button>
              </div>
            ) : (
              visibleReminders.map((r) => {
                const isEditingRow = editingReminderId === r.id;
                return (
                  <article
                    key={`mobile-${r.id}`}
                    className="min-w-0 rounded-2xl border border-blue-500/30 bg-[#0b1530] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <h2 className="min-w-0 flex-1 break-words font-semibold text-slate-100">
                        {isEditingRow ? (
                          <Input
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            className="h-10 w-full min-w-0 rounded-lg border-blue-500/40 bg-[#080f20] text-white focus-visible:ring-blue-500/40"
                          />
                        ) : (
                          r.client_name
                        )}
                      </h2>
                      <StatusBadge status={getStatus(r.due_date, r.contacted_date, today)} />
                    </div>

                    <div className="mt-4 grid min-w-0 grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{t("Mobile")}</p>
                        {isEditingRow ? (
                          <Input
                            type="tel"
                            inputMode="tel"
                            dir="ltr"
                            value={editMobile}
                            onChange={(event) => setEditMobile(event.target.value)}
                            className="mt-1 h-10 w-full min-w-0 rounded-lg border-blue-500/40 bg-[#080f20] text-white focus-visible:ring-blue-500/40"
                          />
                        ) : (
                          <p dir="ltr" className="truncate text-slate-200">{r.mobile_number}</p>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{t("Vehicle")}</p>
                        <p className="truncate text-slate-200">{r.make} {r.model}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{t("Plate")}</p>
                        <p dir="ltr" className="truncate font-medium text-blue-300">{r.plate_number}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{t("Service")}</p>
                        <p className="break-words text-slate-200">{r.service_type}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{t("Due Date")}</p>
                        <p dir="ltr" className="text-slate-200">{r.due_date}</p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-blue-500/15 pt-4">
                      {renderReminderActions(r)}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060b16]" />}>
      <DashboardContent />
    </Suspense>
  );
}
