import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get("admin_session_id")?.value;

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { organizationId: true, isActive: true },
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    const targetDate = new Date(dateParam);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const dayOfWeek = targetDate.getDay();

    // 1. Get operating hours
    const operatingHour = await prisma.operatingHour.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId: admin.organizationId,
          dayOfWeek,
        },
      },
    });

    if (!operatingHour || operatingHour.isClosed) {
      return NextResponse.json({ courts: [], message: "ปิดให้บริการในวันนี้" });
    }

    // 2. Check holiday
    const holiday = await prisma.holiday.findUnique({
      where: {
        organizationId_date: {
          organizationId: admin.organizationId,
          date: targetDate,
        },
      },
    });

    if (holiday?.isClosed) {
      return NextResponse.json({ courts: [], message: holiday.description || "วันหยุด" });
    }

    // 3. Get all courts
    const courts = await prisma.court.findMany({
      where: {
        organizationId: admin.organizationId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    // 4. Get all bookings for the date (all courts)
    const existingItems = await prisma.bookingItem.findMany({
      where: {
        date: targetDate,
        courtId: { in: courts.map((court) => court.id) },
        booking: { status: { not: "cancelled" } },
      },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            notes: true,
            user: {
              select: { displayName: true, phone: true },
            },
          },
        },
      },
    });

    // 5. Build slot matrix for each court
    const openHour = parseInt(operatingHour.openTime.split(":")[0]);
    let closeHour = parseInt(operatingHour.closeTime.split(":")[0]);

    if (closeHour === 0 && openHour === 0) {
      closeHour = 24;
    } else if (closeHour <= openHour) {
      closeHour += 24;
    }

    const courtsWithSlots = courts.map((court) => {
      const slots = [];
      for (let h = openHour; h < closeHour; h++) {
        const displayStartH = h % 24;
        const displayEndH = (h + 1) % 24;
        const startTime = `${displayStartH.toString().padStart(2, "0")}:00`;
        const endTime = `${displayEndH.toString().padStart(2, "0")}:00`;

        // Find matching booking item
        const matchedItem = existingItems.find((item) => {
          if (item.courtId !== court.id) return false;
          const itemStart = parseInt(item.startTime.split(":")[0]);
          let itemEnd = parseInt(item.endTime.split(":")[0]);
          
          if (itemEnd === 0 && itemStart === 0) itemEnd = 24;
          else if (itemEnd <= itemStart) itemEnd += 24;

          return h < itemEnd && (h + 1) > itemStart;
        });

        slots.push({
          startTime,
          endTime,
          isAvailable: !matchedItem,
          bookedBy: matchedItem?.booking?.user?.displayName || null,
          customerPhone: matchedItem?.booking?.user?.phone || null,
          bookingStatus: matchedItem?.booking?.status || null,
          bookingId: matchedItem?.booking?.id || null,
          notes: matchedItem?.booking?.notes || null,
        });
      }

      return {
        id: court.id,
        name: court.name,
        slots,
      };
    });

    return NextResponse.json({ courts: courtsWithSlots });
  } catch (error) {
    console.error("Error fetching admin availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
