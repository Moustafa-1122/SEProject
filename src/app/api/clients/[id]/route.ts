
import NotFoundException from "@/exceptions/not-found-exception";
import UniqueExecption from "@/exceptions/unique-exception";
import { logError } from "@/lib/logger";
import { userRepository } from "@/repository/user-repository";
import { UserService } from "@/services/user-service";
import { updateClientSchema } from "@/types/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client_id = Number(id);

  if (!Number.isInteger(client_id)) {
    return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
  }

  try {
    const client = await UserService.getClientById(client_id);
    return NextResponse.json({ client }, { status: 200 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    logError("GET /api/clients/:id failed:", error);
    return NextResponse.json({ error: "Error fetching client" }, { status: 500 });
  }  
}


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client_id = Number(id);

  if (!Number.isInteger(client_id)) {
    return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parseData = updateClientSchema.safeParse(body);
  if (!parseData.success) {
    return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
  }

  try {
    const client = await UserService.updateClient(client_id, parseData.data);
    return NextResponse.json({ client }, { status: 200 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof UniqueExecption) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("PATCH /api/clients/:id failed:", error);
    return NextResponse.json({ error: "Error updating client" }, { status: 500 });
  }
}

