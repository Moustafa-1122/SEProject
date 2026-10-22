import NotFoundException from "@/exceptions/not-found-exception";
import { UserService } from "@/services/user-service";
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {

    const { id } = await params
    const client_id = Number(id)

    if (!Number.isInteger(client_id)) {
        return NextResponse.json({ error: "Invalid client id" }, { status: 400 });
    }
    try {
        const client = await UserService.deactivateClient(client_id);
        return NextResponse.json({ client }, { status: 200 });

    } catch (error: any) {
        if (error instanceof NotFoundException) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        console.error("POST /api/clients/:id/deactivate failed:", error);
        return NextResponse.json({ error: "Error deactivating client" }, { status: 500 });
    }

}
