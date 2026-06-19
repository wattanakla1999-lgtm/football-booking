import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { badRequest, forbidden, internalError, unauthorized } from "@/src/lib/apiResponse";
import { setAdminSessionCookie } from "@/src/lib/session";
import { auditLog } from "@/src/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      auditLog({
        event: "auth.admin.failed",
        level: "warn",
        actorType: "admin",
        message: "missing credentials",
      });
      return badRequest("กรุณากรอกอีเมลและรหัสผ่าน");
    }

    // 1. Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      auditLog({
        event: "auth.admin.failed",
        level: "warn",
        actorType: "admin",
        message: "admin not found",
        meta: { email },
      });
      return unauthorized("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    if (!admin.isActive) {
      auditLog({
        event: "auth.admin.failed",
        level: "warn",
        actorType: "admin",
        actorId: admin.id,
        organizationId: admin.organizationId,
        message: "admin inactive",
      });
      return forbidden("บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ");
    }

    // 2. Compare password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      auditLog({
        event: "auth.admin.failed",
        level: "warn",
        actorType: "admin",
        actorId: admin.id,
        organizationId: admin.organizationId,
        message: "invalid password",
      });
      return unauthorized("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        displayName: admin.displayName,
        role: admin.role,
      },
    });

    setAdminSessionCookie(response, admin.id);

    auditLog({
      event: "auth.admin.succeeded",
      actorType: "admin",
      actorId: admin.id,
      organizationId: admin.organizationId,
    });

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return internalError();
  }
}
