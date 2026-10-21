export const FESTIVAL_COUPON = "DUSHERA2026";
export const REGULAR_PRICES = { pro: 15000, premium: 25000, professional: 50000, topup: 5000 } as const;
export const FESTIVAL_PRICES = { pro: 5900, premium: 9900, professional: 16900 } as const;
export type PurchasePlan = keyof typeof REGULAR_PRICES;

export function normalizeCoupon(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value !== "string" || value.length > 64) throw new Error("Invalid coupon code");
  return value.trim().toUpperCase();
}

export function getPurchasePrice(plan: unknown, coupon?: unknown): { amount: number; couponCode: string } {
  if (typeof plan !== "string" || !Object.prototype.hasOwnProperty.call(REGULAR_PRICES, plan)) {
    throw new Error("Invalid plan_id");
  }
  const code = normalizeCoupon(coupon);
  if (code && code !== FESTIVAL_COUPON) throw new Error("Invalid coupon code");
  if (code && plan === "topup") throw new Error("Coupon applies to subscriptions only");
  const id = plan as PurchasePlan;
  const amount = code && id !== "topup" ? FESTIVAL_PRICES[id] : REGULAR_PRICES[id];
  return { amount, couponCode: code };
}

export function matchesCapturedPayment(
  order: { id: string; amount: number; currency: string },
  payment: { order_id: string; amount: number; currency: string; status: string; captured: boolean },
): boolean {
  return payment.order_id === order.id && payment.amount === order.amount &&
    order.currency === "INR" && payment.currency === "INR" &&
    payment.status === "captured" && payment.captured === true;
}