import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import AdminBookingList from "./AdminBookingList";

export const metadata: Metadata = {
  title: "Admin Dashboard — Football Booking",
  description: "จัดการระบบจองสนามฟุตบอล",
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;

  if (!adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { displayName: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
  }

  return (
    <div className="flex flex-col gap-lg">
      <AdminBookingList />
    </div>
  );
}
