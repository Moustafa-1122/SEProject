import prisma from "@/lib/db";
import { ServiceRecord } from "@/types/service-record";


export class vehicleRepository {
  static async findById(vehicle_id: number) {
    return prisma.vehicles.findUnique({
      where: { vehicle_id },
    });
  }

  static async findServiceRecords(vehicle_id: number) {
    return prisma.service_records.findMany({
      where: { vehicle_id },
      include: { service_type: true },//join ma3 service type
      orderBy: { service_date: "desc" },
    });
  }

  static async createServiceRecord(vehicle_id: number, data: ServiceRecord) {
    return prisma.service_records.create({
      data: {
        vehicle_id,
        service_type_id: data.service_type_id,
        service_date: new Date(data.service_date),
        odometer: data.odometer,
      },
      include: { service_type: true },
    });
  }
}