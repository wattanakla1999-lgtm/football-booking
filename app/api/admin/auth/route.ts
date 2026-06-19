import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { badRequest, forbidden, internalError, unauthorized } from "@/src/lib/apiResponse";
import { setAdminSessionCookie } from "@/src/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return badRequest("กรุณากรอกอีเมลและรหัสผ่าน");
    }

    // 1. Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return unauthorized("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    if (!admin.isActive) {
      return forbidden("บัญชีถูกระงับ กรุณาติดต่อผู้ดูแลระบบ");
    }

    // 2. Compare password
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
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

    return response;
  } catch (error) {
    console.error("Admin auth error:", error);
    return internalError();
  }
}
