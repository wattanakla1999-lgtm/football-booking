import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import {
  sendCustomerBookingCancelledByAdminNotification,
  sendCustomerBookingConfirmedByAdminNotification,
} from "@/src/services/lineNotificationService";

export const dynamic = "force-dynamic";


// Helper: verify admin session
async function getAdmin() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;
  if (!adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, organizationId: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) return null;
  return admin;
}

// GET: Fetch all bookings for the admin's organization
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: admin.organizationId,
      },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true,
            lineUserId: true,
            phone: true,
          },
        },
        items: {
          include: {
            court: {
              select: { name: true },
            },
          },
          orderBy: { startTime: "asc" },
        },
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Admin bookings fetched, first booking user:", bookings[0]?.user);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Update a booking status
export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Missing bookingId or status" }, { status: 400 });
    }

    // Validate status
    const validStatuses = ["pending", "paid", "confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify the booking belongs to the admin's organization
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId: admin.organizationId,
      },
      include: {
        user: {
          select: {
            lineUserId: true,
          },
        },
        items: {
          include: {
            court: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [
            { date: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    const firstItem = booking.items[0];
    const uniqueCourtNames = Array.from(
      new Set(
        booking.items.map(
          (item) => item.court.name,
        ),
      ),
    );

    const courtName =
      uniqueCourtNames.length <= 1
        ? uniqueCourtNames[0] ||
          "ไม่ระบุสนาม"
        : `${uniqueCourtNames[0]} +${
            uniqueCourtNames.length - 1
          } สนาม`;

    if (
      status === "cancelled" &&
      booking.status !== "cancelled"
    ) {
      try {
        await sendCustomerBookingCancelledByAdminNotification(
          {
            lineUserId:
              booking.user.lineUserId,
            bookingId: booking.id,
            courtName,
            bookingDate: firstItem
              ? firstItem.date
                  .toISOString()
                  .slice(0, 10)
              : "-",
            slots: booking.items.map(
              (item) => ({
                startTime: item.startTime,
                endTime: item.endTime,
              }),
            ),
          },
        );
      } catch (notificationError) {
        console.error(
          "Failed to send LINE customer cancellation notification:",
          notificationError,
        );
      }
    }

    if (
      status === "confirmed" &&
      booking.status !== "confirmed"
    ) {
      try {
        await sendCustomerBookingConfirmedByAdminNotification(
          {
            lineUserId:
              booking.user.lineUserId,
            bookingId: booking.id,
            courtName,
            bookingDate: firstItem
              ? firstItem.date
                  .toISOString()
                  .slice(0, 10)
              : "-",
            slots: booking.items.map(
              (item) => ({
                startTime: item.startTime,
                endTime: item.endTime,
              }),
            ),
          },
        );
      } catch (notificationError) {
        console.error(
          "Failed to send LINE customer confirmation notification:",
          notificationError,
        );
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
