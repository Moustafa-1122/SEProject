import { ReminderService } from "@/services/reminderService";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const dashboard = await ReminderService.getDashboard();//get all the reminders
        return NextResponse.json(dashboard, { status: 200 });
    } catch (error) {
        console.error("GET /api/dashboard failed:", error);
        return NextResponse.json({ error: "Error fetching dashboard" }, { status: 500 });
    }
}