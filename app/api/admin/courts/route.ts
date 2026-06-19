import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminSessionId } from "@/src/lib/session";
import {
  badRequest,
  conflict,
  internalError,
  notFound,
  unauthorized,
} from "@/src/lib/apiResponse";
import { auditLog } from "@/src/lib/audit";

// Helper: verify admin session
async function getAdmin() {
  const adminId = await getAdminSessionId();
  if (!adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, organizationId: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) return null;
  return admin;
}

// GET: Fetch all courts for the organization
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) {
      auditLog({ event: "auth.admin.failed", level: "warn", actorType: "admin", message: "courts GET unauthorized" });
      return unauthorized("กรุณาเข้าสู่ระบบผู้ดูแล");
    }

    const courts = await prisma.court.findMany({
      where: {
        organizationId: admin.organizationId,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courts });
  } catch (error) {
    console.error("Error fetching courts:", error);
    return internalError();
  }
}

// POST: Create a new court
export async function POST(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      auditLog({ event: "auth.admin.failed", level: "warn", actorType: "admin", message: "courts POST unauthorized" });
      return unauthorized("กรุณาเข้าสู่ระบบผู้ดูแล");
    }

    const body = await request.json();
    const { name, description, surface, maxPlayers, pricePerHour, imageUrl } = body;

    if (!name || !pricePerHour) {
      return badRequest("กรุณาระบุชื่อสนามและราคาต่อชั่วโมง");
    }

    const court = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create court
      const newCourt = await tx.court.create({
        data: {
          name,
          description: description || null,
          surface: surface || null,
          maxPlayers: maxPlayers ? parseInt(maxPlayers) : null,
          pricePerHour: parseFloat(pricePerHour),
          organizationId: admin.organizationId,
        },
      });

      // 2. Add image if provided
      if (imageUrl) {
        await tx.courtImage.create({
          data: {
            url: imageUrl,
            isPrimary: true,
            courtId: newCourt.id,
          },
        });
      }

      return newCourt;
    });

    return NextResponse.json({ success: true, court });
  } catch (error) {
    console.error("Error creating court:", error);
    return internalError();
  }
}

// PATCH: Update court details
export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return unauthorized("กรุณาเข้าสู่ระบบผู้ดูแล");
    }

    const body = await request.json();
    const { courtId, name, description, surface, maxPlayers, pricePerHour, imageUrl, isActive } = body;

    if (!courtId || !name || !pricePerHour) {
      return badRequest("ข้อมูลไม่ครบถ้วน");
    }

    // Verify ownership
    const existingCourt = await prisma.court.findFirst({
      where: {
        id: courtId,
        organizationId: admin.organizationId,
      },
    });

    if (!existingCourt) {
      return notFound("ไม่พบสนามบอลที่ระบุ");
    }

    const court = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Update court details
      const updatedCourt = await tx.court.update({
        where: { id: courtId },  
        data: {
          name,
          description: description || null,
          surface: surface || null,
          maxPlayers: maxPlayers ? parseInt(maxPlayers) : null,
          pricePerHour: parseFloat(pricePerHour),
          isActive: isActive !== undefined ? isActive : existingCourt.isActive,
        },
      });

      // 2. Manage image if updated
      if (imageUrl) {
        // Delete old primary images
        await tx.courtImage.deleteMany({
          where: { courtId },
        });

        // Insert new primary image
        await tx.courtImage.create({
          data: {
            url: imageUrl,
            isPrimary: true,
            courtId,
          },
        });
      }

      return updatedCourt;
    });

    return NextResponse.json({ success: true, court });
  } catch (error) {
    console.error("Error updating court:", error);
    return internalError();
  }
}

// DELETE: Delete a court safely
export async function DELETE(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return unauthorized("กรุณาเข้าสู่ระบบผู้ดูแล");
    }

    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");

    if (!courtId) {
      return badRequest("กรุณาระบุ courtId");
    }

    // Verify ownership
    const existingCourt = await prisma.court.findFirst({
      where: {
        id: courtId,
        organizationId: admin.organizationId,
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existingCourt) {
      return notFound("ไม่พบสนามบอลที่ระบุ");
    }

    // Check if it has any bookings
    if (existingCourt._count.bookings > 0) {
      return conflict(
        "ไม่สามารถลบสนามนี้ได้เนื่องจากมีประวัติการจองอยู่แล้ว กรุณาปิดการใช้งานสนามแทนเพื่อความปลอดภัยของข้อมูล",
      );
    }

    // Perform deletion
    await prisma.court.delete({
      where: { id: courtId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting court:", error);
    return internalError();
  }
}
