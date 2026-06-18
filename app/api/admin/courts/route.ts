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

// GET: Fetch all courts for the organization
export async function GET() {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Create a new court
export async function POST(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, surface, maxPlayers, pricePerHour, imageUrl } = body;

    if (!name || !pricePerHour) {
      return NextResponse.json({ error: "กรุณาระบุชื่อสนามและราคาต่อชั่วโมง" }, { status: 400 });
    }

    const court = await prisma.$transaction(async (tx : any) => {
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH: Update court details
export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { courtId, name, description, surface, maxPlayers, pricePerHour, imageUrl, isActive } = body;

    if (!courtId || !name || !pricePerHour) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    // Verify ownership
    const existingCourt = await prisma.court.findFirst({
      where: {
        id: courtId,
        organizationId: admin.organizationId,
      },
    });

    if (!existingCourt) {
      return NextResponse.json({ error: "ไม่พบสนามบอลที่ระบุ" }, { status: 404 });
    }

    const court = await prisma.$transaction(async (tx : any) => {
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Delete a court safely
export async function DELETE(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courtId = searchParams.get("courtId");

    if (!courtId) {
      return NextResponse.json({ error: "Missing courtId" }, { status: 400 });
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
      return NextResponse.json({ error: "ไม่พบสนามบอลที่ระบุ" }, { status: 404 });
    }

    // Check if it has any bookings
    if (existingCourt._count.bookings > 0) {
      return NextResponse.json(
        { error: "ไม่สามารถลบสนามนี้ได้เนื่องจากมีประวัติการจองอยู่แล้ว กรุณาปิดการใช้งานสนามแทนเพื่อความปลอดภัยของข้อมูล" },
        { status: 409 }
      );
    }

    // Perform deletion
    await prisma.court.delete({
      where: { id: courtId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting court:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
