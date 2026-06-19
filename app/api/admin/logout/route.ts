import { NextRequest, NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/src/lib/session";

export async function GET(request: NextRequest) {
  await clearAdminSessionCookie();
  return NextResponse.redirect(
    new URL("/admin/login", request.url),
  );
}
