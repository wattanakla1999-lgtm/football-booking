import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getBookingCourtsByOrganizationId } from "../booking/bookingData";
import AvailabilityViewer from "./AvailabilityViewer";

export const metadata: Metadata = {
  title: "สนามว่าง — Football Booking",
  description: "ตรวจสอบสนามว่างและช่วงเวลาที่พร้อมให้บริการ",
};

export default async function AvailabilityPage() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("session_user_id")?.value;

  if (!sessionUserId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUserId },
    select: {
      id: true,
      displayName: true,
      organizationId: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const initialCourts =
    await getBookingCourtsByOrganizationId(
      user.organizationId,
    );

  return (
    <AvailabilityViewer
      userName={user.displayName}
      initialCourts={initialCourts}
    />
  );
}
