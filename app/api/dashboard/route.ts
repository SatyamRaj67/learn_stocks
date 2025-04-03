import { NextResponse } from "next/server";
import { getDashboardData } from "@/app/(protected)/dashboard/actions";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[DASHBOARD_API]", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
