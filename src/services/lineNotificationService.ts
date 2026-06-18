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
  pending: "Pending",
  paid: "Paid",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "Unpaid",
  pending_verify: "Pending Verify",
  verified: "Verified",
  rejected: "Rejected",
};

function formatPrice(amount: number) {
  return `THB ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatTimeSlots(slots: BookingTimeSlot[]) {
  return slots
    .map((slot) => `${slot.startTime} - ${slot.endTime}`)
    .join(", ");
}

export function buildAdminBookingDetailUrl(
  bookingId: string
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!appUrl) {
    return null;
  }

  return `${appUrl.replace(/\/$/, "")}/admin/bookings/${bookingId}`;
}

function buildAdminBookingMessage(
  payload: AdminBookingNotificationPayload
) {
  const adminBookingDetailUrl =
    buildAdminBookingDetailUrl(payload.bookingId);

  const lines = [
    "🔔 New Booking",
    "",
    "Customer:",
    `- ${payload.customerName}`,
    `- ${payload.customerPhone?.trim() || "-"}`,
    "",
    "Booking:",
    `- ${payload.courtName}`,
    `- ${payload.bookingDate}`,
    `- ${formatTimeSlots(payload.slots)}`,
    `- ${formatPrice(payload.totalPrice)}`,
    `- ${bookingStatusLabels[payload.bookingStatus]}`,
    `- ${paymentStatusLabels[payload.paymentStatus]}`,
  ];

  if (adminBookingDetailUrl) {
    lines.push("", `Admin Detail: ${adminBookingDetailUrl}`);
  }

  return lines.join("\n");
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
