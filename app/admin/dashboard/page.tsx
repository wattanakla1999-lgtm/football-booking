import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionId } from "@/src/lib/session";
import AdminBookingList from "./AdminBookingList";
import { getAdminBookingsByOrganizationId } from "./adminBookingData";

export const metadata: Metadata = {
  title: "Admin Dashboard — Football Booking",
  description: "จัดการระบบจองสนามฟุตบอล",
};

export default async function AdminDashboardPage() {
  const adminId = await getAdminSessionId();

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

  const initialBookings =
    await getAdminBookingsByOrganizationId(
      admin.organizationId,
    );

  return (
    <div className="flex flex-col gap-lg">
      <AdminBookingList
        initialBookings={initialBookings}
      />
    </div>
  );
}
