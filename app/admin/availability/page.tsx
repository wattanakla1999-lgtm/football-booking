import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import AdminAvailabilityView from "./AdminAvailabilityView";
import { getAdminAvailabilityData } from "./adminAvailabilityData";

export const metadata: Metadata = {
  title: "ตารางสนามว่าง — Admin",
  description: "ดูตารางว่างของสนามแต่ละวัน",
};

export default async function AdminAvailabilityPage() {
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

  const initialDate = new Date();
  const initialAvailability =
    await getAdminAvailabilityData({
      organizationId: admin.organizationId,
      targetDate: initialDate,
    });

  return (
    <div className="flex flex-col gap-lg">
      <div className="p-md flex justify-between items-center border-b border-outline-variant/10 mb-md">
        <h2 className="text-headline-md font-headline-md">ตารางสนามว่าง (Availability)</h2>
      </div>
      <AdminAvailabilityView
        initialSelectedDate={initialDate.toISOString()}
        initialCourts={initialAvailability.courts}
        initialMessage={initialAvailability.message}
      />
    </div>
  );
}
