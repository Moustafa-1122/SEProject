import UniqueExecption from "@/exceptions/unique-exception";
import { serviceTypeRepository } from "@/repository/serviceRepository";
import { ServiceSchema } from "@/types/service_types";


export class ServiceTypeService {
  static async createServiceType(data: ServiceSchema) {
    try {
      const serviceType = await serviceTypeRepository.create(data);
      return {
        id: serviceType.service_type_id,
        name: serviceType.service_name,
        interval_month: serviceType.interval_month,
      };
    } catch (error: any) {
      if (error.message?.includes("Unique constraint failed on the constraint")) {
        throw new UniqueExecption("service type already exists");
      }
      throw new Error("failed to create service type");
    }
  }
  static async getServiceTypes() {
    const types = await serviceTypeRepository.findMany();
    return types.map((t) => ({
      id: t.service_type_id,
      name: t.service_name,
      interval_month: t.interval_month,
    }));
  }
}
