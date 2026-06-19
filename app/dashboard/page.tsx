import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import { getUserSessionId } from "@/src/lib/session";
import DashboardQuickActions from "./DashboardQuickActions";

export const metadata: Metadata = {
  title: "Dashboard — Football Booking",
  description: "จัดการการจองสนามฟุตบอลของคุณ",
};

export default async function DashboardPage() {
  const sessionUserId = await getUserSessionId();

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

  return (
    <DashboardQuickActions
      user={{
        displayName: user.displayName,
        pictureUrl: user.pictureUrl,
      }}
    />
  );
}
