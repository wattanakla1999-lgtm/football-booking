import type { BookingStatus } from "@/src/types/status";

export const bookingStatusMeta: Record<
  BookingStatus,
  {
    label: string;
    shortLabel: string;
    icon: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
    borderClassName: string;
    softClassName: string;
  }
> = {
  pending: {
    label: "รอดำเนินการ",
    shortLabel: "รอชำระ",
    icon: "schedule",
    dotColor: "#f59e0b",
    bgColor: "rgba(245,158,11,0.08)",
    textColor: "#f59e0b",
    borderClassName:
      "border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
    softClassName:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
  },
  paid: {
    label: "รอตรวจสอบสลิป",
    shortLabel: "รอตรวจสอบ",
    icon: "payments",
    dotColor: "#3b82f6",
    bgColor: "rgba(59,130,246,0.08)",
    textColor: "#60a5fa",
    borderClassName:
      "border-blue-500/30 bg-blue-500/15 text-blue-400",
    softClassName:
      "border-blue-500/20 bg-blue-500/10 text-blue-400",
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    shortLabel: "ยืนยันแล้ว",
    icon: "verified",
    dotColor: "#10b981",
    bgColor: "rgba(16,185,129,0.08)",
    textColor: "#34d399",
    borderClassName:
      "border-green-500/30 bg-green-500/15 text-green-400",
    softClassName:
      "border-primary/20 bg-primary/10 text-primary",
  },
  completed: {
    label: "เสร็จสิ้น",
    shortLabel: "เสร็จสิ้น",
    icon: "task_alt",
    dotColor: "#6b7280",
    bgColor: "rgba(107,114,128,0.08)",
    textColor: "#9ca3af",
    borderClassName: "border-white/20 bg-white/10 text-white/60",
    softClassName:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  cancelled: {
    label: "ยกเลิกแล้ว",
    shortLabel: "ยกเลิก",
    icon: "cancel",
    dotColor: "#ef4444",
    bgColor: "rgba(239,68,68,0.08)",
    textColor: "#f87171",
    borderClassName:
      "border-red-500/30 bg-red-500/15 text-red-400",
    softClassName: "border-error/20 bg-error/10 text-error",
  },
};

export const feedbackColors = {
  error: {
    text: "#ef4444",
    background: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.15)",
  },
  success: {
    text: "#10b981",
    background: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.15)",
  },
  warning: {
    text: "#f59e0b",
    background: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.15)",
  },
  info: {
    text: "#60a5fa",
    background: "rgba(59, 130, 246, 0.08)",
    border: "rgba(59, 130, 246, 0.15)",
  },
} as const;
