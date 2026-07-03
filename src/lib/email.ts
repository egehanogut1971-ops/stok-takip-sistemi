import { Resend } from "resend";
import { formatCurrency } from "@/lib/profit";

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

export function isEmailConfigured(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.ADMIN_ORDER_EMAIL);
}

type OrderEmailPayload = {
  orderNumber: string;
  total: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    lineTotal: number;
  }[];
};

export async function sendNewOrderEmail(order: OrderEmailPayload): Promise<void> {
  if (!isEmailConfigured()) return;

  const client = getResendClient();
  if (!client) return;

  const siteUrl =
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "";
  const panelLink = siteUrl
    ? `${siteUrl}/panel/siparisler`
    : "/panel/siparisler";

  const itemLines = order.items
    .map(
      (item) =>
        `- ${item.productName} (${item.size}) × ${item.quantity} — ${formatCurrency(item.lineTotal)}`,
    )
    .join("\n");

  const from = process.env.EMAIL_FROM || "Siparis <onboarding@resend.dev>";

  await client.emails.send({
    from,
    to: process.env.ADMIN_ORDER_EMAIL!,
    subject: `Yeni sipariş #${order.orderNumber}`,
    text: [
      "Yeni sipariş alındı!",
      "",
      `Sipariş: #${order.orderNumber}`,
      `Toplam: ${formatCurrency(order.total)}`,
      "",
      `Müşteri: ${order.guestName}`,
      `E-posta: ${order.guestEmail}`,
      `Telefon: ${order.guestPhone}`,
      "",
      "Kalemler:",
      itemLines,
      "",
      `Siparişler paneli: ${panelLink}`,
    ].join("\n"),
  });
}

export function notifyNewOrder(order: OrderEmailPayload): void {
  sendNewOrderEmail(order).catch((error) => {
    console.error("Admin sipariş e-postası gönderilemedi:", error);
  });
}
