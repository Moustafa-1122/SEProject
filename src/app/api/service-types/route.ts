import UniqueExecption from "@/exceptions/unique-exception";
import { logError } from "@/lib/logger";
import { ServiceTypeService } from "@/services/type_service";
import { serviceValidatiomSchema } from "@/types/service_types";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    const body = await request.json().catch(() => null);

    const parseData = serviceValidatiomSchema.safeParse(body);
  if (!parseData.success) {
    return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
  }
  try {
    const service = await ServiceTypeService.createServiceType(parseData.data);
    return NextResponse.json(service, { status: 201 });
    
  } catch (error: unknown) {
    if (error instanceof UniqueExecption) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    logError("POST /api/service_type failed:", error);
    return NextResponse.json({ error: "Error creating service type" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const serviceTypes = await ServiceTypeService.getServiceTypes();
    return NextResponse.json({ serviceTypes }, { status: 200 });
  } catch (error: unknown) {
    logError("GET /api/service_type failed:", error);
    return NextResponse.json({ error: "Error fetching service types" }, { status: 500 });
  }
}