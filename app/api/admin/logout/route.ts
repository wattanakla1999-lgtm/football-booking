import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.set("admin_session_id", "", { maxAge: 0, path: "/" });
  return NextResponse.redirect(
    new URL("/admin/login", request.url),
  );
}
