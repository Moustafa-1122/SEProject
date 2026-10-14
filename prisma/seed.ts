import "dotenv/config";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({ // connect to the database
    adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 20000
    })
});

function dateDaysFromNow(days: number): Date {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() + days);
    return date;
}

// Adds months and keeps the last day of the month (31 Aug + 6 = 28 Feb)
function addMonths(d: Date, n: number): Date {
    const r = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
    const last = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate();
    r.setUTCDate(Math.min(d.getUTCDate(), last));
    return r;
}

// service_date that makes the reminder fall due `dueInDays` from today (FR-007)
function serviceDateFor(dueInDays: number, intervalMonths: number): Date {
    return addMonths(dateDaysFromNow(dueInDays), -intervalMonths);
}

async function main() {
    // Demo password for local testing only. Change before any deployment.
    const demoHash = await bcrypt.hash("Demo12345", 10);

    await prisma.$transaction(async (tx) => {
        // Delete children first (foreign keys)
        await tx.reminders.deleteMany();
        await tx.service_records.deleteMany();
        await tx.vehicles.deleteMany();
        await tx.service_types.deleteMany();
        await tx.clients.deleteMany();
        await tx.users.deleteMany();

        // Mobile numbers in international format: 961 + number without leading 0 (FR-001)
        const clients = await Promise.all([
            tx.clients.create({
                data: { name: "Moustafa Hassan", mobile_number: "96171898929" }
            }),
            tx.clients.create({
                data: { name: "Adnan Saleh", mobile_number: "96170707070" }
            }),
            tx.clients.create({
                data: { name: "Ali Khoury", mobile_number: "96170707071" }
            }),
            tx.clients.create({
                data: {
                    name: "Former Customer",
                    mobile_number: "96170707072",
                    is_active: false
                }
            })
        ]);
        const [moustafa, adnan, ali, former] = clients;

        // Intervals are examples: the workshop decides the real numbers (FR-008)
        const [oilChange, tireRotation, inspection, brakeService] = await Promise.all([
            tx.service_types.create({
                data: { service_name: "Oil change", interval_month: 6 }
            }),
            tx.service_types.create({
                data: { service_name: "Tire rotation", interval_month: 6 }
            }),
            tx.service_types.create({
                data: { service_name: "Annual inspection", interval_month: 12 }
            }),
            tx.service_types.create({
                data: { service_name: "Brake service", interval_month: 24 }
            })
        ]);

        const vehicles = await Promise.all([
            tx.vehicles.create({
                data: {
                    client_id: moustafa.client_id,
                    plate_number: "ABC-123",
                    make: "Toyota",
                    model: "Corolla",
                    year: 2021
                }
            }),
            tx.vehicles.create({
                data: {
                    client_id: moustafa.client_id,
                    plate_number: "MOU-456",
                    make: "Honda",
                    model: "CR-V",
                    year: 2019
                }
            }),
            tx.vehicles.create({
                data: {
                    client_id: adnan.client_id,
                    plate_number: "ADN-789",
                    make: "Nissan",
                    model: "Altima",
                    year: 2017
                }
            }),
            tx.vehicles.create({
                data: {
                    client_id: ali.client_id,
                    plate_number: "ALI-321",
                    make: "Hyundai",
                    model: "Tucson",
                    year: 2023
                }
            }),
            // Inactive client's car: must NOT show on the dashboard (FR-003)
            tx.vehicles.create({
                data: {
                    client_id: former.client_id,
                    plate_number: "FOR-111",
                    make: "Kia",
                    model: "Rio",
                    year: 2012
                }
            })
        ]);
        const [corolla, crv, altima, tucson, oldCar] = vehicles;

        // service_date is derived from the due date we want, so
        // due_date = service_date + interval always holds (FR-007)
        const serviceRecords = await Promise.all([
            tx.service_records.create({
                data: {
                    vehicle_id: corolla.vehicle_id,
                    service_type_id: oilChange.service_type_id,
                    service_date: serviceDateFor(-30, oilChange.interval_month), // overdue 30 days
                    odometer: 42100
                }
            }),
            tx.service_records.create({
                data: {
                    vehicle_id: corolla.vehicle_id,
                    service_type_id: tireRotation.service_type_id,
                    service_date: serviceDateFor(0, tireRotation.interval_month), // due today
                    odometer: 46200
                }
            }),
            tx.service_records.create({
                data: {
                    vehicle_id: crv.vehicle_id,
                    service_type_id: inspection.service_type_id,
                    service_date: serviceDateFor(14, inspection.interval_month), // due in 14 days
                    odometer: 68300
                }
            }),
            tx.service_records.create({
                data: {
                    vehicle_id: crv.vehicle_id,
                    service_type_id: brakeService.service_type_id,
                    service_date: serviceDateFor(120, brakeService.interval_month), // far future
                    odometer: 55200
                }
            }),
            tx.service_records.create({
                data: {
                    vehicle_id: altima.vehicle_id,
                    service_type_id: oilChange.service_type_id,
                    service_date: serviceDateFor(-5, oilChange.interval_month), // overdue 5 days
                    odometer: 105400
                }
            }),
            tx.service_records.create({
                data: {
                    vehicle_id: tucson.vehicle_id,
                    service_type_id: inspection.service_type_id,
                    service_date: serviceDateFor(30, inspection.interval_month), // due in 30 days
                    odometer: 12100
                }
            })
        ]);
        const [corollaOil, corollaTires, crvInspection, crvBrakes, altimaOil, tucsonInspection] = serviceRecords;

        await tx.reminders.createMany({
            data: [
                {
                    vehicle_id: corolla.vehicle_id,
                    service_type_id: oilChange.service_type_id,
                    due_date: addMonths(corollaOil.service_date, oilChange.interval_month),
                    last_service_record_id: corollaOil.service_record_id
                },
                {
                    vehicle_id: corolla.vehicle_id,
                    service_type_id: tireRotation.service_type_id,
                    due_date: addMonths(corollaTires.service_date, tireRotation.interval_month),
                    last_service_record_id: corollaTires.service_record_id
                },
                {
                    vehicle_id: crv.vehicle_id,
                    service_type_id: inspection.service_type_id,
                    due_date: addMonths(crvInspection.service_date, inspection.interval_month),
                    last_service_record_id: crvInspection.service_record_id,
                    contacted_date: dateDaysFromNow(-2)
                },
                {
                    vehicle_id: crv.vehicle_id,
                    service_type_id: brakeService.service_type_id,
                    due_date: addMonths(crvBrakes.service_date, brakeService.interval_month),
                    last_service_record_id: crvBrakes.service_record_id
                },
                {
                    vehicle_id: altima.vehicle_id,
                    service_type_id: oilChange.service_type_id,
                    due_date: addMonths(altimaOil.service_date, oilChange.interval_month),
                    last_service_record_id: altimaOil.service_record_id,
                    contacted_date: dateDaysFromNow(-1) // contacted yesterday, still overdue
                },
                {
                    vehicle_id: tucson.vehicle_id,
                    service_type_id: inspection.service_type_id,
                    due_date: addMonths(tucsonInspection.service_date, inspection.interval_month),
                    last_service_record_id: tucsonInspection.service_record_id
                },
                {
                    // No service record yet: boundary case, due in exactly 7 days
                    vehicle_id: tucson.vehicle_id,
                    service_type_id: tireRotation.service_type_id,
                    due_date: dateDaysFromNow(7)
                },
                {
                    // Overdue, but the client is inactive: must be excluded from the dashboard
                    vehicle_id: oldCar.vehicle_id,
                    service_type_id: oilChange.service_type_id,
                    due_date: dateDaysFromNow(-20)
                }
            ]
        });

        await tx.users.createMany({
            data: [
                { email: "admin@example.com", password_hash: demoHash },
                { email: "staff@example.com", password_hash: demoHash }
            ]
        });
    }, { maxWait: 20000, timeout: 60000 });
}

main().then(async () => {
    console.log("Data seeded successfully");
}).catch(async (e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});