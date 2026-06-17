import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the user's organization to scope the courts (for SaaS multi-tenant)
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
