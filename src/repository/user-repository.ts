import prisma from "@/lib/db";
import { ClientShema, UpdateClient, vehicleSchema } from "@/types/client";

export class userRepository {
  static async createClients(data: ClientShema) {
        return prisma.clients.create({
      data: {
        name: data.name,
        mobile_number: data.mobile_number,
        vehicles: {
          create: {
            plate_number: data.vehicle.plate_number,
            make: data.vehicle.make,
            model: data.vehicle.model,
            year: data.vehicle.year,
          },
        },
      },
      include: { vehicles: true },// bt3mel join ma3 l vehicles
    });
  }

  static async findMany(search?: string) {//eza search ma ela value raj3li l undefined w ba3den btraje3 l all clients
    return prisma.clients.findMany({
      where: search//fini e3mel search by name or mobile number
        ? { OR: [
            { name: { contains: search, mode: "insensitive" } },//insensitive y3ni fini e3mel search by name without case sensitive Moustafa === moustafa
            { mobile_number: { contains: search } },
          ]}
        : undefined,
      orderBy: { name: "asc" },
    });
  }

  static async findById(client_id: number) {
    return prisma.clients.findUnique({
      where: { client_id },
      include: { vehicles: true },//bt3mel join ma3 l vehicles w btraje3 kel l vahivles l murtabitin bi hayda l client
      
    });
  }
static async update(client_id: number, data: UpdateClient) {
  return prisma.clients.update({
    where: { client_id },
    data,
  });
}

static async deactivate(client_id: number) {
  return prisma.clients.update({
    where: { client_id },
    data: { is_active: false },
  })
}

static async activate(client_id: number) {
  return prisma.clients.update({
    where: { client_id },
    data: { is_active: true },
  })
}

static async addVehicleToClient(client_id: number, data: vehicleSchema) {
  return prisma.vehicles.create({
    data:{
      client_id,
      plate_number: data.plate_number,
      make: data.make,
      model: data.model,
      year: data.year,
        
    },
  })
}

}