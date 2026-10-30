import NotFoundException from "@/exceptions/not-found-exception";
import UniqueExecption from "@/exceptions/unique-exception";
import { formatDate } from "@/lib/formate-date";
import { userRepository } from "@/repository/user-repository";
import { ClientShema, UpdateClient, vehicleSchema } from "@/types/client";

export class UserService {
    static async createClients(data: ClientShema) {
    try {
      const client = await userRepository.createClients(data);
      return {
        id: client.client_id,
        name: client.name,
        mobile_number: client.mobile_number,
        is_active: client.is_active,
        vehicles: client.vehicles.map((v) => ({
          id: v.vehicle_id,
          plate_number: v.plate_number,
          make: v.make,
          model: v.model,
          year: v.year,
        })),
      };
    } catch (error: any) {
      if (error.message?.includes("Unique constraint failed on the constraint")) {
        if (error.meta?.target?.includes("mobile_number")) {//error.meta hada haded aya min b zabet 3emel dublicate
          throw new UniqueExecption("mobile number already exists");
        }
        if (error.meta?.target?.includes("plate_number")) {
          throw new UniqueExecption("plate number already exists");
        }
        throw new UniqueExecption("duplicate value");
      }
      throw new Error("failed to create client");
    }
  }

    static async getClients(search?: string) {
        const clients = await userRepository.findMany(search);
        return clients.map((c) => ({
            id: c.client_id,
            name: c.name,
            mobile_number: c.mobile_number,
            is_active: c.is_active,
            created_at: formatDate(c.created_at),
        }));
    }

    static async getClientById(client_id: number) {
        const client = await userRepository.findById(client_id);
        if (!client) {
            throw new NotFoundException("Client not found");
        }
        return {
            id: client.client_id,
            name: client.name,
            mobile_number: client.mobile_number,
            is_active: client.is_active,
            created_at: formatDate(client.created_at),
            vehicles: client.vehicles.map((v) => ({
                id: v.vehicle_id,
                plate_number: v.plate_number,
                make: v.make,
                model: v.model,
                year: v.year,
            })),
        };
    }
static async updateClient(client_id: number, data: UpdateClient) {
  try {
    const client = await userRepository.update(client_id, data);
    return {
      id: client.client_id,
      name: client.name,
      mobile_number: client.mobile_number,
      is_active: client.is_active,
    };
  } catch (error: any) {
    if (error.code === "P2025") {
      throw new NotFoundException("Client not found");
    }
    if (error.message?.includes("Unique constraint failed on the constraint")) {
      throw new UniqueExecption("mobile number already exists");
    }
    throw new Error("failed to update client");
  }
}

static async deactivateClient(client_id: number) {
    try {
        const client = await userRepository.deactivate(client_id);
        return{
            id:client.client_id,
            name:client.name,
            mobile_number:client.mobile_number,
            is_active:client.is_active,
        }
    } catch (error:any) {
        if(error.code === "P2025"){
           throw new NotFoundException("Client not found");
    }
}
    throw new Error("failed to deactivate client");
}

static async activateClient(client_id: number) {
    try {
        const client = await userRepository.activate(client_id);
        return{
            id:client.client_id,
            name:client.name,
            mobile_number:client.mobile_number,
            is_active:client.is_active,
        }
    } catch (error:any) {
        if(error.code === "P2025"){
           throw new NotFoundException("Client not found");
    }
}
    throw new Error("failed to activate client");
}


static async addVehicleToClient(client_id: number, data: vehicleSchema) {
  const client = await userRepository.findById(client_id);
  if(!client){
    throw new NotFoundException("Client not found");
}
try {
  const vahicle = await userRepository.addVehicleToClient(client_id, data);
  return {
    id: vahicle.vehicle_id,
    plate_number: vahicle.plate_number,
    make: vahicle.make,
    model: vahicle.model,
    year: vahicle.year,

  }
} catch (error: any) {
  if(error.message?.includes("Unique constraint failed on the constraint")) {
    throw new UniqueExecption("plate number already exists");
}
throw new Error("failed to add vehicle to client");
}

}
}

