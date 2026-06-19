import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import DashboardQuickActions from "./DashboardQuickActions";

export const metadata: Metadata = {
  title: "Dashboard — Football Booking",
  description: "จัดการการจองสนามฟุตบอลของคุณ",
};

export default async function DashboardPage() {
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
      pictureUrl: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  const bookingsCount = await prisma.booking.count({
    where: {
      userId: user.id,
    },
  });

  return (
    <DashboardQuickActions
      user={{
        displayName: user.displayName,
        pictureUrl: user.pictureUrl,
      }}
      bookingsCount={bookingsCount}
    />
  );
}
