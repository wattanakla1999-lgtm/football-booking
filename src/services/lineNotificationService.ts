type BookingStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "cancelled"
  | "completed";

type PaymentStatus =
  | "unpaid"
  | "pending_verify"
  | "verified"
  | "rejected";

type BookingTimeSlot = {
  startTime: string;
  endTime: string;
};

export type AdminBookingNotificationPayload = {
  bookingId: string;
  customerName: string;
  customerPhone?: string | null;
  courtName: string;
  bookingDate: string;
  slots: BookingTimeSlot[];
  totalPrice: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
};

const LINE_PUSH_API_URL =
  "https://api.line.me/v2/bot/message/push";

const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "รอดำเนินการ",
  paid: "ชำระเงินแล้ว",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิกแล้ว",
  completed: "เสร็จสิ้น",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "ยังไม่ชำระเงิน",
  pending_verify: "รอตรวจสอบ",
  verified: "ตรวจสอบแล้ว",
  rejected: "ไม่ผ่านการตรวจสอบ",
};

function formatPrice(amount: number) {
  return `฿${amount.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatTimeSlots(slots: BookingTimeSlot[]) {
  return slots
    .map((slot) => `${slot.startTime} - ${slot.endTime}`)
    .join(", ");
}

function resolvePublicAppUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null,
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null,
  ];

  for (const candidate of candidates) {
    const value = candidate?.trim();

    if (value && !value.includes("localhost")) {
      return value.replace(/\/$/, "");
    }
  }

  return null;
}

export function buildAdminBookingDetailUrl(
  bookingId: string
) {
  const appUrl = resolvePublicAppUrl();

  if (!appUrl) {
    return null;
  }

  return `${appUrl}/admin/bookings/${bookingId}`;
}

function buildAdminBookingMessage(
  payload: AdminBookingNotificationPayload
) {
  const adminBookingDetailUrl =
    buildAdminBookingDetailUrl(payload.bookingId);

  const lines = [
    "มีรายการจองใหม่เข้ามา",
    "",
    "ข้อมูลลูกค้า",
    `ชื่อ: ${payload.customerName}`,
    `เบอร์โทร: ${payload.customerPhone?.trim() || "-"}`,
    "",
    "รายละเอียดการจอง",
    `สนาม: ${payload.courtName}`,
    `วันที่: ${payload.bookingDate}`,
    `เวลา: ${formatTimeSlots(payload.slots)}`,
    `ยอดชำระ: ${formatPrice(payload.totalPrice)}`,
    `สถานะการจอง: ${bookingStatusLabels[payload.bookingStatus]}`,
    `สถานะการชำระเงิน: ${paymentStatusLabels[payload.paymentStatus]}`,
  ];

  if (adminBookingDetailUrl) {
    lines.push("", `ดูรายละเอียด: ${adminBookingDetailUrl}`);
  }

  return lines.join("\n");
}

function buildInfoRow(label: string, value: string) {
  return {
    type: "box" as const,
    layout: "baseline" as const,
    spacing: "sm" as const,
    contents: [
      {
        type: "text" as const,
        text: label,
        color: "#6B7280",
        size: "sm" as const,
        flex: 3,
      },
      {
        type: "text" as const,
        text: value,
        wrap: true,
        color: "#111827",
        size: "sm" as const,
        flex: 5,
        align: "end" as const,
      },
    ],
  };
}

function buildAdminBookingFlexMessage(
  payload: AdminBookingNotificationPayload
) {
  const adminBookingDetailUrl =
    buildAdminBookingDetailUrl(payload.bookingId);

  return {
    type: "flex" as const,
    altText: `มีรายการจองใหม่: ${payload.customerName} จอง ${payload.courtName} วันที่ ${payload.bookingDate}`,
    contents: {
      type: "bubble" as const,
      size: "giga" as const,
      header: {
        type: "box" as const,
        layout: "vertical" as const,
        backgroundColor: "#16A34A",
        paddingAll: "20px",
        contents: [
          {
            type: "text" as const,
            text: "มีรายการจองใหม่",
            color: "#FFFFFF",
            weight: "bold" as const,
            size: "xl" as const,
          },
          {
            type: "text" as const,
            text: `รหัสการจอง ${payload.bookingId.slice(-8).toUpperCase()}`,
            color: "#DCFCE7",
            size: "xs" as const,
            margin: "md" as const,
          },
        ],
      },
      body: {
        type: "box" as const,
        layout: "vertical" as const,
        spacing: "md" as const,
        paddingAll: "20px",
        contents: [
          {
            type: "text" as const,
            text: payload.courtName,
            weight: "bold" as const,
            size: "lg" as const,
            color: "#111827",
            wrap: true,
          },
          {
            type: "separator" as const,
            margin: "sm" as const,
          },
          buildInfoRow("ลูกค้า", payload.customerName),
          buildInfoRow(
            "เบอร์โทร",
            payload.customerPhone?.trim() || "-"
          ),
          buildInfoRow("วันที่", payload.bookingDate),
          buildInfoRow(
            "เวลา",
            formatTimeSlots(payload.slots)
          ),
          buildInfoRow(
            "ยอดชำระ",
            formatPrice(payload.totalPrice)
          ),
          buildInfoRow(
            "สถานะการจอง",
            bookingStatusLabels[payload.bookingStatus]
          ),
          buildInfoRow(
            "สถานะชำระเงิน",
            paymentStatusLabels[payload.paymentStatus]
          ),
        ],
      },
      footer: adminBookingDetailUrl
        ? {
            type: "box" as const,
            layout: "vertical" as const,
            spacing: "sm" as const,
            paddingAll: "20px",
            contents: [
              {
                type: "button" as const,
                style: "primary" as const,
                height: "sm" as const,
                color: "#16A34A",
                action: {
                  type: "uri" as const,
                  label: "ดูรายละเอียดการจอง",
                  uri: adminBookingDetailUrl,
                },
              },
            ],
          }
        : undefined,
    },
  };
}

export async function sendAdminBookingNotification(
  payload: AdminBookingNotificationPayload
) {
  const adminLineUserId =
    process.env.ADMIN_LINE_USER_ID?.trim();
  const channelAccessToken =
    process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();

  if (!adminLineUserId || !channelAccessToken) {
    return;
  }

  const response = await fetch(LINE_PUSH_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: adminLineUserId,
      messages: [
        buildAdminBookingFlexMessage(payload),
        {
          type: "text",
          text: buildAdminBookingMessage(payload),
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LINE push request failed (${response.status}): ${errorText}`
    );
  }
}
