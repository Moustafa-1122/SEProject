import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 20000,
  }),
});

let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name} ${detail}`);
  if (!ok) failed++;
};
const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

function addMonths(d: Date, n: number) {
  const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
  const last = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
  r.setUTCDate(Math.min(d.getUTCDate(), last));
  return r;
}

async function main() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const in7 = new Date(today);
  in7.setUTCDate(in7.getUTCDate() + 7);

  // 1) Row counts
  const counts = {
    clients: await prisma.clients.count(),
    vehicles: await prisma.vehicles.count(),
    service_types: await prisma.service_types.count(),
    service_records: await prisma.service_records.count(),
    reminders: await prisma.reminders.count(),
    users: await prisma.users.count(),
  };
  console.table(counts);
  check(
    "row counts",
    counts.clients === 4 && counts.vehicles === 5 && counts.service_types === 4 &&
      counts.service_records === 6 && counts.reminders === 8 && counts.users === 2,
  );

  // 2) FR-001: mobile numbers in international format (961...)
  const badNums = (await prisma.clients.findMany()).filter(
    (c) => !/^961\d{7,8}$/.test(c.mobile_number),
  );
  check("mobile numbers in 961 format", badNums.length === 0, badNums.map((c) => c.name).join());

  // 3) FR-011: dashboard = due within 7 days or overdue, active clients only, most overdue first
  const dash = await prisma.reminders.findMany({
    where: { due_date: { lte: in7 }, vehicle: { client: { is_active: true } } },
    orderBy: { due_date: "asc" },
    include: { vehicle: { include: { client: true } }, service_type: true },
  });
  console.table(
    dash.map((r) => ({
      client: r.vehicle.client.name,
      mobile: r.vehicle.client.mobile_number,
      plate: r.vehicle.plate_number,
      service: r.service_type.service_name,
      due: iso(r.due_date),
      contacted: iso(r.contacted_date),
    })),
  );
  const plates = dash.map((r) => r.vehicle.plate_number);
  check(
    "dashboard rows and order (most overdue first)",
    JSON.stringify(plates) === JSON.stringify(["ABC-123", "ADN-789", "ABC-123", "ALI-321"]),
    plates.join(","),
  );
  check("inactive client's car excluded (FR-003)", !plates.includes("FOR-111"));
  check(
    "contacted date shown for Adnan's reminder",
    dash.find((r) => r.vehicle.plate_number === "ADN-789")?.contacted_date != null,
  );
  check("reminder due in 8+ days not listed", !plates.includes("MOU-456"));

  // 4) FR-004: search by name, mobile or plate (contains, case-insensitive)
  const search = (q: string) =>
    prisma.clients.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { mobile_number: { contains: q } },
          { vehicles: { some: { plate_number: { contains: q, mode: "insensitive" } } } },
        ],
      },
    });
  check("search name 'mou'", (await search("mou")).length === 1);
  check("search mobile '7070'", (await search("7070")).length === 3);
  check("search plate 'adn-'", (await search("adn-")).map((c) => c.name).join() === "Adnan Saleh");

  // 5) FR-013: service history of the Corolla, newest first
  const corolla = await prisma.vehicles.findUnique({ where: { plate_number: "ABC-123" } });
  const hist = await prisma.service_records.findMany({
    where: { vehicle_id: corolla!.vehicle_id },
    orderBy: { service_date: "desc" },
    include: { service_type: true },
  });
  console.table(
    hist.map((h) => ({ date: iso(h.service_date), service: h.service_type.service_name, odometer: h.odometer })),
  );
  check("history has 2 records, newest first", hist.length === 2 && hist[0].service_date > hist[1].service_date);

  // 6) FR-007: due_date = service_date + interval (months)
  const all = await prisma.reminders.findMany({
    include: { last_service_record: true, service_type: true },
  });
  const bad = all.filter(
    (r) =>
      r.last_service_record &&
      iso(addMonths(r.last_service_record.service_date, r.service_type.interval_month)) !== iso(r.due_date),
  );
  check("every due_date = service_date + interval", bad.length === 0, `${bad.length} mismatches`);

  // 7) DB constraint: duplicate plate number is rejected
  let rejected = false;
  try {
    await prisma.vehicles.create({
      data: { client_id: corolla!.client_id, plate_number: "ABC-123", make: "X", model: "Y", year: 2000 },
    });
  } catch {
    rejected = true;
  }
  check("duplicate plate rejected", rejected);
}

main()
  .catch((e) => { console.error(e); failed++; })
  .finally(async () => {
    await prisma.$disconnect();
    console.log(failed ? `\n${failed} check(s) FAILED` : "\nAll checks passed");
    process.exit(failed ? 1 : 0);
  });