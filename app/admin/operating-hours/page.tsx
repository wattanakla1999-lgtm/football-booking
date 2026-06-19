import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionId } from "@/src/lib/session";
import OperatingHoursView from "./OperatingHoursView";

export const metadata: Metadata = {
  title: "ตั้งค่าเวลาเปิด-ปิด — Admin",
  description: "จัดการเวลาเปิด-ปิดทำการของสนามฟุตบอลในแต่ละวัน",
};

export default async function AdminOperatingHoursPage() {
  const adminId = await getAdminSessionId();

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
      <div className="p-md flex justify-between items-center border-b border-outline-variant/10 mb-md">
        <h2 className="text-headline-md font-headline-md">ตั้งค่าเวลาเปิด-ปิด (Operating Hours)</h2>
      </div>
      <OperatingHoursView />
    </div>
  );
}
