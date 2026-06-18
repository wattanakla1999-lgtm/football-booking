import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Helper: verify admin session
async function getAdmin() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;
  if (!adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, organizationId: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) return null;
  return admin;
}

// GET: Fetch the 7 operating hours records for the organization
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const operatingHours = await prisma.operatingHour.findMany({
      where: {
        organizationId: admin.organizationId,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return NextResponse.json({ operatingHours });
  } catch (error) {
    console.error("Error fetching operating hours:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Bulk update operating hours (for multiple days)
export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { hours } = body; // Array of { dayOfWeek: number, openTime: string, closeTime: string, isClosed: boolean }

    if (!hours || !Array.isArray(hours)) {
      return NextResponse.json({ error: "ข้อมูลช่วงเวลาเปิด-ปิดไม่ถูกต้อง" }, { status: 400 });
    }

    // Perform database operations in transaction
    const updatedHours = await prisma.$transaction(
      hours.map((hour : { dayOfWeek: number, openTime: string, closeTime: string, isClosed: boolean }) => {
        const { dayOfWeek, openTime, closeTime, isClosed } = hour;

        return prisma.operatingHour.upsert({
          where: {
            organizationId_dayOfWeek: {
              organizationId: admin.organizationId,
              dayOfWeek,
            },
          },
          update: {
            openTime,
            closeTime,
            isClosed,
          },
          create: {
            organizationId: admin.organizationId,
            dayOfWeek,
            openTime,
            closeTime,
            isClosed,
          },
        });
      })
    );

    return NextResponse.json({ success: true, operatingHours: updatedHours });
  } catch (error) {
    console.error("Error updating operating hours:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
