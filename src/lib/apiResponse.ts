import { NextResponse } from "next/server";

type ErrorBody = {
  error: string;
  code:
    | "bad_request"
    | "unauthorized"
    | "forbidden"
    | "not_found"
    | "conflict"
    | "internal_error";
};

export function badRequest(message: string) {
  return NextResponse.json<ErrorBody>(
    { error: message, code: "bad_request" },
    { status: 400 },
  );
}

export function unauthorized(
  message = "กรุณาเข้าสู่ระบบ",
) {
  return NextResponse.json<ErrorBody>(
    { error: message, code: "unauthorized" },
    { status: 401 },
  );
}

export function forbidden(
  message = "ไม่มีสิทธิ์เข้าถึงข้อมูลนี้",
) {
  return NextResponse.json<ErrorBody>(
    { error: message, code: "forbidden" },
    { status: 403 },
  );
}

export function notFound(message: string) {
  return NextResponse.json<ErrorBody>(
    { error: message, code: "not_found" },
    { status: 404 },
  );
}

export function conflict(message: string) {
  return NextResponse.json<ErrorBody>(
    { error: message, code: "conflict" },
    { status: 409 },
  );
}

export function internalError(
  message = "ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง",
) {
  return NextResponse.json<ErrorBody>(
    { error: message, code: "internal_error" },
    { status: 500 },
  );
}
