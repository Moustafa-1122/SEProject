import prisma from "@/lib/db";

export class statsRepository {
  // 1) clients is active now
  static async countActiveClients() {
    return prisma.clients.count({
      where: { is_active: true },
    });
  }

  // 2) new clients registered within the date range
  static async countNewClients(from: Date, to: Date) {
    return prisma.clients.count({
      where: { created_at: { gte: from, lt: to } },
    });
  }

  // 3) number of service records within the date range
  static async countServiceRecords(from: Date, to: Date) {
    return prisma.service_records.count({
      where: { service_date: { gte: from, lt: to } },
    });
  }

  // 4) number of unique clients who received services within the date range
  static async countVisitedClients(from: Date, to: Date) {
    return prisma.clients.count({
      where: {
        vehicles: {
          some: {// number of clients that have at least one vehicle with a service record in the specified date range
            service_records: {
              some: { service_date: { gte: from, lt: to } },
            },
          },
        },
      },
    });
  }

// 5) number of reminders that are overdue (due date is before today and contacted date is null)
static async countOverdueReminders(today: Date) {
  return prisma.reminders.count({
    where: {
      due_date: { lt: today },//lt means less than, so we are looking for reminders that are due before today
      contacted_date: null,
      vehicle: { client: { is_active: true } },
    },
  });
}

}