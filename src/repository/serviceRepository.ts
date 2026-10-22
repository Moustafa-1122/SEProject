import prisma from "@/lib/db";
import { ServiceSchema } from "@/types/service_types";


export class serviceTypeRepository {
  static async create(data: ServiceSchema) {
    return prisma.service_types.create({ data });
  }
static async findMany() {
    return prisma.service_types.findMany({
      orderBy: { service_name: "asc" },
    });
  }

   static async findById(service_type_id: number) {
    return prisma.service_types.findUnique({
      where: { service_type_id },
    });
  }

}