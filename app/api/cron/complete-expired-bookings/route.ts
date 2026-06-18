import { NextResponse } from "next/server";

import { completeExpiredBookings } from "@/src/services/bookingLifecycleService";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== "production";
  }

  const authHeader =
    request.headers.get("authorization");

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const result =
      await completeExpiredBookings();

    return NextResponse.json({
      success: true,
      updatedCount: result.updatedCount,
      updatedBookingIds:
        result.updatedBookingIds,
      triggeredAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Cron failed to complete expired bookings:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to complete expired bookings",
      },
      { status: 500 },
    );
  }
}
