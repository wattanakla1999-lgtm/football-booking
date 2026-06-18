import { prisma } from "@/src/lib/prisma";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminBookingsTable from "./AdminBookingsTable";

export const metadata: Metadata = {
  title: "รายการจองทั้งหมด — Admin",
  description: "ดูรายการจองสนามฟุตบอลทั้งหมดในรูปแบบตาราง",
};

export default async function AdminBookingsPage() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;

  if (!adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      displayName: true,
      role: true,
      isActive: true,
      organizationId: true,
    },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
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

  const serializedBookings = bookings.map((booking) => ({
    id: booking.id,
    totalPrice: booking.totalPrice.toString(),
    status: booking.status,
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
    user: {
      displayName: booking.user.displayName,
      pictureUrl: booking.user.pictureUrl,
      lineUserId: booking.user.lineUserId,
      phone: booking.user.phone,
    },
    items: booking.items.map((item) => ({
      id: item.id,
      date: item.date.toISOString(),
      startTime: item.startTime,
      endTime: item.endTime,
      price: item.price.toString(),
      court: {
        name: item.court.name,
      },
    })),
    payment: booking.payment
      ? {
        id: booking.payment.id,
        amount: booking.payment.amount.toString(),
        slipUrl: booking.payment.slipUrl,
        status: booking.payment.status,
      }
      : null,
  }));

  return (
    <div className="flex flex-col gap-lg">
      <AdminBookingsTable initialBookings={serializedBookings} />
    </div>
  );
}
