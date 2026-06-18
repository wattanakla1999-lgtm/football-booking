import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getHistoryBookingPageByUserId,
} from "@/app/history/bookingHistoryData";
import { HISTORY_PAGE_LIMIT } from "@/app/history/constants";
import { parsePageParam } from "@/src/utils/pagination";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parsePageParam(
      searchParams.get("page") ?? "1",
    );
    const limit = Number(
      searchParams.get("limit") ?? HISTORY_PAGE_LIMIT,
    );
    const searchKeyword =
      searchParams.get("search") ?? "";
    const rawStatusFilter =
      searchParams.get("status") ?? "all";
    const statusFilter =
      rawStatusFilter === "pending" ||
      rawStatusFilter === "paid" ||
      rawStatusFilter === "confirmed" ||
      rawStatusFilter === "cancelled" ||
      rawStatusFilter === "completed"
        ? rawStatusFilter
        : "all";

    const data = await getHistoryBookingPageByUserId(
      sessionUserId,
      {
        page,
        limit,
        searchKeyword,
        statusFilter,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
