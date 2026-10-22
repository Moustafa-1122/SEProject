import NotFoundException from "@/exceptions/not-found-exception";
import { ReminderService } from "@/services/reminderService";
import { postponeReminderSchema } from "@/types/reminder";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const reminder_id = Number(id);

  const body = await request.json().catch(() => null);
  const parseData = postponeReminderSchema.safeParse(body);
  if (!parseData.success) {
    return NextResponse.json({ error: parseData.error.issues[0].message }, { status: 400 });
  }

  try {
    const reminder = await ReminderService.postponeReminder(reminder_id, parseData.data);
    return NextResponse.json(reminder, { status: 200 });
  } catch (error: any) {
    if (error instanceof NotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("PATCH /api/reminders/[id] failed:", error);
    return NextResponse.json({ error: "Error postponing reminder" }, { status: 500 });
  }
}