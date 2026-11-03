import { logError } from "@/lib/logger";
import { StatsService } from "@/services/stats-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stats = await StatsService.getDashboardStats();
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    logError("GET /api/dashboard/stats failed:", error);
    return NextResponse.json({ error: "Error fetching dashboard stats" }, { status: 500 });
  }
}