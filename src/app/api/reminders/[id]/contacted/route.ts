import NotFoundException from "@/exceptions/not-found-exception";
import { logError } from "@/lib/logger";
import { ReminderService } from "@/services/reminderService";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reminder_id = Number(id);

  try {
    const reminder = await ReminderService.markContacted(reminder_id);
    return NextResponse.json(reminder, { status: 200 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    logError("PATCH /api/reminders/[id]/contacted failed:", error);
    return NextResponse.json({ error: "Error marking reminder as contacted" }, { status: 500 });
  }
}