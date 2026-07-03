import crypto from "crypto";

const CHECKOUT_INIT_PATH =
  "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const CHECKOUT_RETRIEVE_PATH = "/payment/iyzipos/checkoutform/auth/ecom/detail";

export function isIyzicoConfigured(): boolean {
  return Boolean(
    process.env.IYZICO_API_KEY &&
      process.env.IYZICO_SECRET_KEY &&
      process.env.IYZICO_BASE_URL,
  );
}

function getConfig() {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL?.replace(/\/$/, "");

  if (!apiKey || !secretKey || !baseUrl) {
    throw new Error("iyzico yapılandırması eksik.");
  }

  return { apiKey, secretKey, baseUrl };
}

export function getSiteBaseUrl(): string {
  const url =
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

function buildAuthorization(
  apiKey: string,
  secretKey: string,
  uriPath: string,
  body: string,
): { authorization: string; randomKey: string } {
  const randomKey = crypto.randomBytes(16).toString("hex");
  const payload = randomKey + uriPath + body;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(payload)
    .digest("hex");

  const authString = [
    `apiKey:${apiKey}`,
    `randomKey:${randomKey}`,
    `signature:${signature}`,
  ].join("&");

  return { authorization: `IYZWSv2 ${Buffer.from(authString).toString("base64")}`, randomKey };
}

async function iyzicoPost<T extends Record<string, unknown>>(
  uriPath: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { apiKey, secretKey, baseUrl } = getConfig();
  const bodyStr = JSON.stringify(body);
  const { authorization, randomKey } = buildAuthorization(
    apiKey,
    secretKey,
    uriPath,
    bodyStr,
  );

  const res = await fetch(`${baseUrl}${uriPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
      "x-iyzi-rnd": randomKey,
    },
    body: bodyStr,
  });

  const data = (await res.json()) as T & {
    status?: string;
    errorMessage?: string;
  };

  if (data.status === "failure") {
    throw new Error(data.errorMessage || "iyzico isteği başarısız.");
  }

  return data;
}

type PaymentBuyer = {
  id: string;
  name: string;
  surname: string;
  email: string;
  gsmNumber: string;
  identityNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  ip: string;
};

type BasketItem = {
  id: string;
  name: string;
  category: string;
  price: string;
};

export function buildCheckoutRequest({
  orderNumber,
  total,
  buyer,
  basketItems,
  shippingAddress,
}: {
  orderNumber: string;
  total: number;
  buyer: PaymentBuyer;
  basketItems: BasketItem[];
  shippingAddress: {
    contactName: string;
    city: string;
    country: string;
    address: string;
  };
}) {
  const baseUrl = getSiteBaseUrl();
  const price = total.toFixed(2);

  return {
    locale: "tr",
    conversationId: orderNumber,
    price,
    paidPrice: price,
    currency: "TRY",
    basketId: orderNumber,
    paymentGroup: "PRODUCT",
    callbackUrl: `${baseUrl}/api/shop/payment/callback`,
    enabledInstallments: [1],
    buyer: {
      id: buyer.id,
      name: buyer.name,
      surname: buyer.surname,
      gsmNumber: buyer.gsmNumber,
      email: buyer.email,
      identityNumber: buyer.identityNumber,
      lastLoginDate: "2024-01-01 12:00:00",
      registrationDate: "2024-01-01 12:00:00",
      registrationAddress: buyer.registrationAddress,
      ip: buyer.ip,
      city: buyer.city,
      country: buyer.country,
      zipCode: "34000",
    },
    shippingAddress: {
      contactName: shippingAddress.contactName,
      city: shippingAddress.city,
      country: shippingAddress.country,
      address: shippingAddress.address,
      zipCode: "34000",
    },
    billingAddress: {
      contactName: shippingAddress.contactName,
      city: shippingAddress.city,
      country: shippingAddress.country,
      address: shippingAddress.address,
      zipCode: "34000",
    },
    basketItems: basketItems.map((item) => ({
      id: item.id,
      name: item.name,
      category1: item.category,
      itemType: "PHYSICAL",
      price: item.price,
    })),
  };
}

export async function initializeCheckout(
  request: ReturnType<typeof buildCheckoutRequest>,
): Promise<{ checkoutFormContent?: string; token?: string; errorMessage?: string }> {
  const data = await iyzicoPost<{
    checkoutFormContent?: string;
    token?: string;
    errorMessage?: string;
  }>(CHECKOUT_INIT_PATH, request);

  return {
    checkoutFormContent: data.checkoutFormContent,
    token: data.token,
    errorMessage: data.errorMessage,
  };
}

export async function retrieveCheckoutResult(token: string): Promise<{
  paymentStatus?: string;
  paymentId?: string;
  conversationId?: string;
  errorMessage?: string;
}> {
  const data = await iyzicoPost<{
    paymentStatus?: string;
    paymentId?: string;
    conversationId?: string;
    errorMessage?: string;
  }>(CHECKOUT_RETRIEVE_PATH, { locale: "tr", token });

  return {
    paymentStatus: data.paymentStatus,
    paymentId: data.paymentId,
    conversationId: data.conversationId,
    errorMessage: data.errorMessage,
  };
}
