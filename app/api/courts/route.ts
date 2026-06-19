import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import {
  internalError,
  notFound,
  unauthorized,
} from "@/src/lib/apiResponse";
import { getUserSessionId } from "@/src/lib/session";

export async function GET() {
  try {
    const sessionUserId = await getUserSessionId();

    if (!sessionUserId) {
      return unauthorized();
    }

    // Find the user's organization to scope the courts (for SaaS multi-tenant)
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { organizationId: true }
    });

    if (!user) {
      return notFound("ไม่พบข้อมูลผู้ใช้งาน");
    }

    const courts = await prisma.court.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return internalError();
  }
}
