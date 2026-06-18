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

export type AdminBookingCancelledNotificationPayload = {
  bookingId: string;
  customerName: string;
  customerPhone?: string | null;
  courtName: string;
  bookingDate: string;
  slots: BookingTimeSlot[];
  totalPrice: number;
};

export type CustomerBookingCancelledByAdminPayload = {
  lineUserId: string;
  bookingId: string;
  courtName: string;
  bookingDate: string;
  slots: BookingTimeSlot[];
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

function buildCustomerHistoryUrl() {
  const appUrl = resolvePublicAppUrl();

  if (!appUrl) {
    return null;
  }

  return `${appUrl}/history`;
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

function buildAdminBookingCancelledFlexMessage(
  payload: AdminBookingCancelledNotificationPayload
) {
  const adminBookingDetailUrl =
    buildAdminBookingDetailUrl(payload.bookingId);

  return {
    type: "flex" as const,
    altText: `ลูกค้ายกเลิกการจอง: ${payload.customerName} ยกเลิก ${payload.courtName} วันที่ ${payload.bookingDate}`,
    contents: {
      type: "bubble" as const,
      size: "giga" as const,
      header: {
        type: "box" as const,
        layout: "vertical" as const,
        backgroundColor: "#DC2626",
        paddingAll: "20px",
        contents: [
          {
            type: "text" as const,
            text: "ลูกค้ายกเลิกการจอง",
            color: "#FFFFFF",
            weight: "bold" as const,
            size: "xl" as const,
          },
          {
            type: "text" as const,
            text: `รหัสการจอง ${payload.bookingId.slice(-8).toUpperCase()}`,
            color: "#FEE2E2",
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
          buildInfoRow("สถานะล่าสุด", "ยกเลิกโดยลูกค้า"),
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
                color: "#DC2626",
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

function buildCustomerBookingCancelledByAdminFlexMessage(
  payload: CustomerBookingCancelledByAdminPayload
) {
  const historyUrl = buildCustomerHistoryUrl();

  return {
    type: "flex" as const,
    altText: `รายการจอง ${payload.courtName} ของคุณถูกยกเลิกโดยเจ้าของสนาม`,
    contents: {
      type: "bubble" as const,
      size: "mega" as const,
      header: {
        type: "box" as const,
        layout: "vertical" as const,
        backgroundColor: "#DC2626",
        paddingAll: "20px",
        contents: [
          {
            type: "text" as const,
            text: "รายการจองถูกยกเลิก",
            color: "#FFFFFF",
            weight: "bold" as const,
            size: "xl" as const,
          },
          {
            type: "text" as const,
            text: "เจ้าของสนามได้ยกเลิกรายการจองของคุณ",
            color: "#FEE2E2",
            size: "sm" as const,
            wrap: true,
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
          buildInfoRow(
            "รหัสการจอง",
            payload.bookingId
              .slice(-8)
              .toUpperCase()
          ),
          buildInfoRow("สนาม", payload.courtName),
          buildInfoRow("วันที่", payload.bookingDate),
          buildInfoRow(
            "เวลา",
            formatTimeSlots(payload.slots)
          ),
          {
            type: "text" as const,
            text: "หากต้องการดูรายการจองล่าสุด สามารถกดปุ่มด้านล่างได้ทันที",
            wrap: true,
            size: "sm" as const,
            color: "#4B5563",
            margin: "sm" as const,
          },
        ],
      },
      footer: historyUrl
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
                color: "#DC2626",
                action: {
                  type: "uri" as const,
                  label: "ดูประวัติการจอง",
                  uri: historyUrl,
                },
              },
            ],
          }
        : undefined,
    },
  };
}

async function sendLinePushMessage(
  lineUserId: string,
  messages: unknown[],
) {
  const channelAccessToken =
    process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();

  if (!lineUserId || !channelAccessToken) {
    return;
  }

  const response = await fetch(LINE_PUSH_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${channelAccessToken}`,
    },
    body: JSON.stringify({
      to: lineUserId,
      messages,
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

export async function sendAdminBookingNotification(
  payload: AdminBookingNotificationPayload
) {
  const adminLineUserId =
    process.env.ADMIN_LINE_USER_ID?.trim();
  if (!adminLineUserId) {
    return;
  }

  await sendLinePushMessage(adminLineUserId, [
    buildAdminBookingFlexMessage(payload),
  ]);
}

export async function sendAdminBookingCancelledNotification(
  payload: AdminBookingCancelledNotificationPayload
) {
  const adminLineUserId =
    process.env.ADMIN_LINE_USER_ID?.trim();
  if (!adminLineUserId) {
    return;
  }

  await sendLinePushMessage(adminLineUserId, [
    buildAdminBookingCancelledFlexMessage(
      payload
    ),
  ]);
}

export async function sendCustomerBookingCancelledByAdminNotification(
  payload: CustomerBookingCancelledByAdminPayload
) {
  if (
    !payload.lineUserId ||
    payload.lineUserId.startsWith("offline_")
  ) {
    return;
  }

  await sendLinePushMessage(
    payload.lineUserId,
    [
      buildCustomerBookingCancelledByAdminFlexMessage(
        payload
      ),
    ],
  );
}
