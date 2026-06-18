import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getHistoryBookingsByUserId } from "@/app/history/bookingHistoryData";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch bookings for the logged-in user
    const bookings =
      await getHistoryBookingsByUserId(sessionUserId);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
