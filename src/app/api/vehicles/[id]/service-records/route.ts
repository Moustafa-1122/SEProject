import NotFoundException from "@/exceptions/not-found-exception";
import { VehicleService } from "@/services/vehicle-service";
import { serviceRecordSchema } from "@/types/service-record";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vehicle_id = Number(id);

  try {
    const records = await VehicleService.getServiceRecords(vehicle_id);
    return NextResponse.json(records, { status: 200 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("GET /api/vehicles/[id]/service-records failed:", error);
    return NextResponse.json({ error: "Error fetching service records" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const vehicle_id = Number(id);

  const body = await request.json().catch(() => null);
  const parseData = serviceRecordSchema.safeParse(body);
  if (!parseData.success) {
    return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
  }

  try {
    const record = await VehicleService.addServiceRecord(vehicle_id, parseData.data);
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("POST /api/vehicles/[id]/service-records failed:", error);
    return NextResponse.json({ error: "Error creating service record" }, { status: 500 });
  }
}