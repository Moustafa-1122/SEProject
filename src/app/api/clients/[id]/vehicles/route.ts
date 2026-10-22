import NotFoundException from "@/exceptions/not-found-exception";
import UniqueExecption from "@/exceptions/unique-exception";
import { UserService } from "@/services/user-service";
import { vehicleSchema } from "@/types/client";
import { NextRequest, NextResponse } from "next/server";



export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const {id} = await params;
    const client_id = Number(id);

    if(!Number.isInteger(client_id)) {
        return  NextResponse.json({error: "Invalid client id"}, {status: 400});
    }

    const body = await request.json().catch(()=>null);
    const parseData = vehicleSchema.safeParse(body);
    if(!parseData.success) {
        return NextResponse.json({error: parseData.error.issues[0].message}, {status: 400});
    }

    try {
    const vehicle = await UserService.addVehicleToClient(client_id, parseData.data);
    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof UniqueExecption) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("POST /api/clients/:id/vehicles failed:", error);
    return NextResponse.json({ error: "Error adding vehicle" }, { status: 500 });
  }




}