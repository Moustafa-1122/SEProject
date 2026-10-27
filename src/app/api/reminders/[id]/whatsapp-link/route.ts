import NotFoundException from "@/exceptions/not-found-exception";
import { logError } from "@/lib/logger";
import { ReminderService } from "@/services/reminderService";

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reminder_id = Number(id);

  try {
    const result = await ReminderService.getWhatsappLink(reminder_id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    logError("GET /api/reminders/[id]/whatsapp-link failed:", error);
    return NextResponse.json({ error: "Error generating WhatsApp link" }, { status: 500 });
  }
}