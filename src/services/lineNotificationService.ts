type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired"
  | "no_show";

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

export type CustomerBookingRequestedPayload = {
  lineUserId: string;
  bookingId: string;
  courtName: string;
  bookingDate: string;
  slots: BookingTimeSlot[];
};

export type CustomerBookingCancelledByAdminPayload = {
  lineUserId: string;
  bookingId: string;
  courtName: string;
  bookingDate: string;
  slots: BookingTimeSlot[];
};

export type CustomerBookingConfirmedByAdminPayload = {
  lineUserId: string;
  bookingId: string;
  courtName: string;
  bookingDate: string;
  slots: BookingTimeSlot[];
};

export type CustomerBookingReminderPayload = {
  lineUserId: string;
  bookingId: string;
  courtName: string;
  bookingDate: string;
  slots: BookingTimeSlot[];
};

const LINE_PUSH_API_URL =
  "https://api.line.me/v2/bot/message/push";

const bookingStatusLabels: Record<BookingStatus, string> = {
  pending: "รอแอดมินยืนยัน",
  confirmed: "ยืนยันแล้ว",
  cancelled: "ยกเลิกแล้ว",
  completed: "ใช้งานเสร็จสิ้น",
  expired: "หมดเวลารอ",
  no_show: "ลูกค้าไม่มา",
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
  bookingId: string,
) {
  const appUrl = resolvePublicAppUrl();
  return appUrl
    ? `${appUrl}/admin/bookings/${bookingId}`
    : null;
}

function buildCustomerHistoryUrl() {
  const appUrl = resolvePublicAppUrl();
  return appUrl ? `${appUrl}/history` : null;
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

function buildActionFooter(label: string, uri: string | null, color: string) {
  if (!uri) {
    return undefined;
  }

  return {
    type: "box" as const,
    layout: "vertical" as const,
    spacing: "sm" as const,
    paddingAll: "20px",
    contents: [
      {
        type: "button" as const,
        style: "primary" as const,
        height: "sm" as const,
        color,
        action: {
          type: "uri" as const,
          label,
          uri,
        },
      },
    ],
  };
}

function buildAdminBookingFlexMessage(
  payload: AdminBookingNotificationPayload,
) {
  return {
    type: "flex" as const,
    altText: `มีคำขอจองใหม่: ${payload.customerName} จอง ${payload.courtName} วันที่ ${payload.bookingDate}`,
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
            text: "มีคำขอจองใหม่",
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
          buildInfoRow("เบอร์โทร", payload.customerPhone?.trim() || "-"),
          buildInfoRow("วันที่", payload.bookingDate),
          buildInfoRow("เวลา", formatTimeSlots(payload.slots)),
          buildInfoRow("ยอดรวม", formatPrice(payload.totalPrice)),
          buildInfoRow(
            "สถานะการจอง",
            bookingStatusLabels[payload.bookingStatus],
          ),
        ],
      },
      footer: buildActionFooter(
        "ดูรายละเอียดการจอง",
        buildAdminBookingDetailUrl(payload.bookingId),
        "#16A34A",
      ),
    },
  };
}

function buildAdminBookingCancelledFlexMessage(
  payload: AdminBookingCancelledNotificationPayload,
) {
  return {
    type: "flex" as const,
    altText: `ลูกค้ายกเลิกการจอง ${payload.courtName}`,
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
          buildInfoRow("ลูกค้า", payload.customerName),
          buildInfoRow("เบอร์โทร", payload.customerPhone?.trim() || "-"),
          buildInfoRow("สนาม", payload.courtName),
          buildInfoRow("วันที่", payload.bookingDate),
          buildInfoRow("เวลา", formatTimeSlots(payload.slots)),
          buildInfoRow("ยอดรวม", formatPrice(payload.totalPrice)),
          buildInfoRow("สถานะล่าสุด", "ยกเลิกโดยลูกค้า"),
        ],
      },
      footer: buildActionFooter(
        "ดูรายละเอียดการจอง",
        buildAdminBookingDetailUrl(payload.bookingId),
        "#DC2626",
      ),
    },
  };
}

function buildCustomerBubble(
  title: string,
  subtitle: string,
  accentColor: string,
  payload:
    | CustomerBookingRequestedPayload
    | CustomerBookingCancelledByAdminPayload
    | CustomerBookingConfirmedByAdminPayload
    | CustomerBookingReminderPayload,
  footerLabel: string,
) {
  return {
    type: "flex" as const,
    altText: title,
    contents: {
      type: "bubble" as const,
      size: "mega" as const,
      header: {
        type: "box" as const,
        layout: "vertical" as const,
        backgroundColor: accentColor,
        paddingAll: "20px",
        contents: [
          {
            type: "text" as const,
            text: title,
            color: "#FFFFFF",
            weight: "bold" as const,
            size: "xl" as const,
          },
          {
            type: "text" as const,
            text: subtitle,
            color: "#E5E7EB",
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
          buildInfoRow("รหัสการจอง", payload.bookingId.slice(-8).toUpperCase()),
          buildInfoRow("สนาม", payload.courtName),
          buildInfoRow("วันที่", payload.bookingDate),
          buildInfoRow("เวลา", formatTimeSlots(payload.slots)),
        ],
      },
      footer: buildActionFooter(
        footerLabel,
        buildCustomerHistoryUrl(),
        accentColor,
      ),
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
      `LINE push request failed (${response.status}): ${errorText}`,
    );
  }
}

function canPushToCustomer(lineUserId: string) {
  return Boolean(lineUserId && !lineUserId.startsWith("offline_"));
}

export function isAdminLineUser(lineUserId?: string | null) {
  const adminLineUserId =
    process.env.ADMIN_LINE_USER_ID?.trim();

  return Boolean(
    lineUserId &&
      adminLineUserId &&
      lineUserId === adminLineUserId,
  );
}

export async function sendAdminBookingNotification(
  payload: AdminBookingNotificationPayload,
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
  payload: AdminBookingCancelledNotificationPayload,
) {
  const adminLineUserId =
    process.env.ADMIN_LINE_USER_ID?.trim();

  if (!adminLineUserId) {
    return;
  }

  await sendLinePushMessage(adminLineUserId, [
    buildAdminBookingCancelledFlexMessage(payload),
  ]);
}

export async function sendCustomerBookingRequestedNotification(
  payload: CustomerBookingRequestedPayload,
) {
  if (!canPushToCustomer(payload.lineUserId)) {
    return;
  }

  await sendLinePushMessage(payload.lineUserId, [
    buildCustomerBubble(
      "ส่งคำขอจองแล้ว",
      "ระบบได้รับคำขอจองของคุณแล้ว และกำลังรอแอดมินยืนยัน",
      "#16A34A",
      payload,
      "ดูประวัติการจอง",
    ),
  ]);
}

export async function sendCustomerBookingCancelledByAdminNotification(
  payload: CustomerBookingCancelledByAdminPayload,
) {
  if (!canPushToCustomer(payload.lineUserId)) {
    return;
  }

  await sendLinePushMessage(payload.lineUserId, [
    buildCustomerBubble(
      "รายการจองถูกยกเลิก",
      "เจ้าของสนามได้ยกเลิกรายการจองของคุณแล้ว",
      "#DC2626",
      payload,
      "ดูประวัติการจอง",
    ),
  ]);
}

export async function sendCustomerBookingConfirmedByAdminNotification(
  payload: CustomerBookingConfirmedByAdminPayload,
) {
  if (!canPushToCustomer(payload.lineUserId)) {
    return;
  }

  await sendLinePushMessage(payload.lineUserId, [
    buildCustomerBubble(
      "ยืนยันการจองแล้ว",
      "เจ้าของสนามได้ยืนยันรายการจองของคุณแล้ว",
      "#2563EB",
      payload,
      "ดูประวัติการจอง",
    ),
  ]);
}

export async function sendCustomerBookingReminderNotification(
  payload: CustomerBookingReminderPayload,
) {
  if (!canPushToCustomer(payload.lineUserId)) {
    return;
  }

  await sendLinePushMessage(payload.lineUserId, [
    buildCustomerBubble(
      "ใกล้ถึงเวลาลงสนามแล้ว",
      "เตรียมตัวให้พร้อม แล้วพบกันตามเวลาที่จองไว้",
      "#16A34A",
      payload,
      "ดูประวัติการจอง",
    ),
  ]);
}
