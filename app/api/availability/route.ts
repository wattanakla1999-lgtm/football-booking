import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const courtId = searchParams.get("courtId");

    if (!dateParam || !courtId) {
      return NextResponse.json({ error: "Missing date or courtId" }, { status: 400 });
    }

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // 1. Get user and organization
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { organizationId: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 2. Check if it's a holiday
    const holiday = await prisma.holiday.findUnique({
      where: {
        organizationId_date: {
          organizationId: user.organizationId,
          date: targetDate,
        }
      }
    });

    if (holiday?.isClosed) {
      return NextResponse.json({ slots: [], message: holiday.description || "Closed for holiday" });
    }

    // 3. Get operating hours for the day of the week
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday
    const operatingHour = await prisma.operatingHour.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId: user.organizationId,
          dayOfWeek,
        }
      }
    });

    if (!operatingHour || operatingHour.isClosed) {
      return NextResponse.json({ slots: [], message: "Closed on this day" });
    }

    // 4. Fetch existing bookings for this court and date
    // Ignore cancelled bookings
    const existingBookingItems = await prisma.bookingItem.findMany({
      where: {
        courtId,
        date: targetDate,
        booking: {
          status: {
            not: "cancelled"
          }
        }
      }
    });

    // 5. Generate 1-hour slots
    const slots = [];
    let currentHour = parseInt(operatingHour.openTime.split(":")[0]);
    let closeHour = parseInt(operatingHour.closeTime.split(":")[0]);

    // Handle closing at midnight or crossing midnight
    if (closeHour === 0 && currentHour === 0) {
      closeHour = 24; // 24 hours open
    } else if (closeHour <= currentHour) {
      closeHour += 24;
    }

    // For simplicity, we assume round hours (e.g., 08:00, 09:00).
    while (currentHour < closeHour) {
      const displayStartH = currentHour % 24;
      const displayEndH = (currentHour + 1) % 24;

      const startTime = `${displayStartH.toString().padStart(2, "0")}:00`;
      const endTime = `${displayEndH.toString().padStart(2, "0")}:00`;

      // Check if this slot overlaps with any existing booking item
      // An existing item is booked if its startTime is exactly this slot's startTime
      const isBooked = existingBookingItems.some(item => {
        let itemStart = parseInt(item.startTime.split(":")[0]);
        let itemEnd = parseInt(item.endTime.split(":")[0]);

        // Adjust item times for crossing midnight
        if (itemEnd === 0 && itemStart === 0) itemEnd = 24;
        else if (itemEnd <= itemStart) itemEnd += 24;

        // Compare using the adjusted absolute hours
        let slotStartHour = displayStartH;
        let slotEndHour = displayEndH;
        
        // Adjust slot times to match item time frame logic
        if (slotEndHour === 0 && slotStartHour === 0) slotEndHour = 24;
        else if (slotEndHour <= slotStartHour) slotEndHour += 24;

        // If the item itself crosses midnight but the slot doesn't yet, we need to map the slot into the same 24h space.
        // The simplest robust way for 1-hour slots is just matching the exact start string, 
        // because we strictly enforce 1-hour slots aligned to the hour.
        return item.startTime === startTime;
      });

      slots.push({
        startTime,
        endTime,
        isAvailable: !isBooked,
      });

      currentHour++;
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error checking availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
