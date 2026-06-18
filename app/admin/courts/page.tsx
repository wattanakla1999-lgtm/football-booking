import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/src/lib/prisma";
import CourtsListView from "./CourtsListView";
import {
  createPaginationMeta,
  parsePageParam,
} from "@/src/utils/pagination";

export const metadata: Metadata = {
  title: "จัดการสนามฟุตบอล — Admin",
  description: "จัดการสนามฟุตบอล เพิ่ม/แก้ไข/ลบสนาม",
};

const PAGE_LIMIT = 10;

type AdminCourtsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function AdminCourtsPage({
  searchParams,
}: AdminCourtsPageProps) {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;
  const resolvedSearchParams = await searchParams;

  if (!adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      displayName: true,
      role: true,
      isActive: true,
      organizationId: true,
    },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
  }

  const total = await prisma.court.count({
    where: {
      organizationId: admin.organizationId,
    },
  });

  const pagination = createPaginationMeta({
    total,
    page: parsePageParam(
      resolvedSearchParams.page,
    ),
    limit: PAGE_LIMIT,
  });

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
    skip: (pagination.page - 1) * PAGE_LIMIT,
    take: PAGE_LIMIT,
  });

  const serializedCourts = courts.map((court) => ({
    id: court.id,
    name: court.name,
    description: court.description,
    surface: court.surface,
    maxPlayers: court.maxPlayers,
    pricePerHour: court.pricePerHour.toString(),
    isActive: court.isActive,
    images: court.images.map((image) => ({
      id: image.id,
      url: image.url,
    })),
  }));

  return (
    <div className="flex flex-col gap-lg">
      <div className="p-md flex justify-between items-center border-b border-outline-variant/10 mb-md">
        <h2 className="text-headline-md font-headline-md">จัดการสนามฟุตบอล (Fields)</h2>
      </div>
      <CourtsListView
        initialCourts={serializedCourts}
        pagination={pagination}
      />
    </div>
  );
}
