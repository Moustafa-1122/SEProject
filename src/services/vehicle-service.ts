import NotFoundException from "@/exceptions/not-found-exception";
import { formatDate } from "@/lib/formate-date";
import { reminderRepository } from "@/repository/reminder-repository";
import { serviceTypeRepository } from "@/repository/serviceRepository";
import { vehicleRepository } from "@/repository/vehicle-repository";
import { ServiceRecord } from "@/types/service-record";


export class VehicleService {
  static async getServiceRecords(vehicle_id: number) {
    const vehicle = await vehicleRepository.findById(vehicle_id);
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const records = await vehicleRepository.findServiceRecords(vehicle_id);

    return records.map((r) => ({
      id: r.service_record_id,
      service_type: {
        id: r.service_type.service_type_id,
        name: r.service_type.service_name,
      },
      service_date: formatDate(r.service_date),
      odometer: r.odometer,
      created_at: formatDate(r.created_at),
    }));
  }

  static async addServiceRecord(vehicle_id: number, data: ServiceRecord) {
    const vehicle = await vehicleRepository.findById(vehicle_id);
    if (!vehicle) {
      throw new NotFoundException("Vehicle not found");
    }

    const serviceType = await serviceTypeRepository.findById(data.service_type_id);
    if (!serviceType) {
      throw new NotFoundException("Service type not found");
    }

    const record = await vehicleRepository.createServiceRecord(vehicle_id, data);
  const nextDueDate = new Date(data.service_date);
  nextDueDate.setMonth(nextDueDate.getMonth() + serviceType.interval_month);

  await reminderRepository.upsertReminder(
    vehicle_id,
    data.service_type_id,
    nextDueDate,
    record.service_record_id
  );


    return {
      id: record.service_record_id,
      service_type: {
        id: record.service_type.service_type_id,
        name: record.service_type.service_name,
      },
      service_date: formatDate(record.service_date),
      odometer: record.odometer,
      created_at: formatDate(record.created_at),
    };
  }
}