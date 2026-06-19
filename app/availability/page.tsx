import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getUserSessionId } from "@/src/lib/session";
import { getBookingCourtsByOrganizationId } from "../booking/bookingData";
import AvailabilityViewer from "./AvailabilityViewer";

export const metadata: Metadata = {
  title: "สนามว่าง — Football Booking",
  description: "ตรวจสอบสนามว่างและช่วงเวลาที่พร้อมให้บริการ",
};

export default async function AvailabilityPage() {
  const sessionUserId = await getUserSessionId();

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
