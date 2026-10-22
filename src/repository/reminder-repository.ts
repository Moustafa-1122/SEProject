

import prisma from "@/lib/db";

export class reminderRepository {
    static async findDashboard() {
        const sevenDaysFromNow = new Date();//get current date
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);//add 7 days to current date

        return prisma.reminders.findMany({
            where: {// two conditions
                due_date: { lte: sevenDaysFromNow },//lte = less than or equal to
                vehicle: {
                    client: { is_active: true },//just the vehicles that are client active
                },
            },
            include: {//join tables
                vehicle: {//join vehicle table
                    include: { client: true },//join client table
                },
                service_type: true,//join service_type table
            },
            orderBy: { due_date: "asc" },//order by due_date ascending
        });
    }

    static async findById(reminder_id: number) {//find reminder by id
        return prisma.reminders.findUnique({
            where: { reminder_id, }//find by id
        })
    }

    static async markContacted(reminder_id: number) {
        return prisma.reminders.update({
            where: { reminder_id },//find the reminder by id
            data: {
                contacted_date: new Date(),//set contacted_date to current date
            },
            include: {//include the vehicle and service_type tables
                vehicle: { include: { client: true } },//join vehicle table and include client table
                service_type: true,//join service_type table
            }
        })

    }
    static async postponeDueDate(reminder_id: number, due_date: string) {
        return prisma.reminders.update({
            where: { reminder_id },//find the reminder by id
            data: { due_date: new Date(due_date) },//set due_date to the new date
            include: {
                vehicle: { include: { client: true } },
                service_type: true
            }
        })

    }
    static async findByIdWithDetails(reminder_id: number) {
        return prisma.reminders.findUnique({
            where: { reminder_id },
            include: {
                vehicle: { include: { client: true } },
                service_type: true,
            },
        });
    }

    static async upsertReminder(
  vehicle_id: number,
  service_type_id: number,
  due_date: Date,
  service_record_id: number
) {
  return prisma.reminders.upsert({
    where: {
      vehicle_id_service_type_id: { vehicle_id, service_type_id },
    },
    update: {
      due_date,
      last_service_record_id: service_record_id,
      contacted_date: null,
    },
    create: {
      vehicle_id,
      service_type_id,
      due_date,
      last_service_record_id: service_record_id,
    },
  });
}

}