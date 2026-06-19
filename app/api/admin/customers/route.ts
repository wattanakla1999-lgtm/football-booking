import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { getAdminSessionId } from "@/src/lib/session";
import { internalError } from "@/src/lib/apiResponse";

async function getAdminSession() {
  const adminId = await getAdminSessionId();

  if (!adminId) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      id: true,
      organizationId: true,
      isActive: true,
    },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  return admin;
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminSession();

    if (!admin) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบผู้ดูแล", code: "unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "";

    if (query.length < 1) {
      return NextResponse.json({ customers: [] });
    }

    const customers = await prisma.user.findMany({
      where: {
        organizationId: admin.organizationId,
        OR: [
          {
            displayName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        displayName: true,
        phone: true,
        pictureUrl: true,
        lineUserId: true,
        createdAt: true,
      },
      orderBy: [
        { displayName: "asc" },
        { createdAt: "desc" },
      ],
      take: 8,
    });

    return NextResponse.json({
      customers: customers.map((customer) => ({
        ...customer,
        createdAt: customer.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error searching admin customers:", error);
    return internalError();
  }
}
