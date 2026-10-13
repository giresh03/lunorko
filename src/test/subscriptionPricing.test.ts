import { describe, expect, it } from "vitest";
import { getPurchasePrice, matchesCapturedPayment } from "../../supabase/functions/_shared/subscriptionPricing";

describe("subscription prices in paise", () => {
  it("keeps Pro at ₹150 without a coupon", () => expect(getPurchasePrice("pro").amount).toBe(15000));
  it("keeps Premium at ₹250 without a coupon", () => expect(getPurchasePrice("premium").amount).toBe(25000));
  it("keeps Professional at ₹500 without a coupon", () => expect(getPurchasePrice("professional").amount).toBe(50000));
  it("discounts Pro to ₹59", () => expect(getPurchasePrice("pro", "DUSHERA2026").amount).toBe(5900));
  it("discounts Premium to ₹99", () => expect(getPurchasePrice("premium", "DUSHERA2026").amount).toBe(9900));
  it("discounts Professional to ₹169", () => expect(getPurchasePrice("professional", "DUSHERA2026").amount).toBe(16900));
  it("normalizes coupon entry", () => expect(getPurchasePrice("pro", " dushera2026 ").couponCode).toBe("DUSHERA2026"));
  it("rejects unknown coupons", () => expect(() => getPurchasePrice("pro", "FREE")).toThrow("Invalid coupon"));
  it("keeps top-ups at ₹50", () => expect(getPurchasePrice("topup").amount).toBe(5000));
  it("does not discount top-ups", () => expect(() => getPurchasePrice("topup", "DUSHERA2026")).toThrow("subscriptions only"));
  it("rejects unknown plans", () => expect(() => getPurchasePrice("constructor")).toThrow("Invalid plan"));
});

describe("captured payment checks", () => {
  const order = { id: "order_test", amount: 5900, currency: "INR" };
  const payment = { order_id: "order_test", amount: 5900, currency: "INR", status: "captured", captured: true };
  it("accepts a matching captured festival payment", () => expect(matchesCapturedPayment(order, payment)).toBe(true));
  it("rejects an underpayment", () => expect(matchesCapturedPayment(order, { ...payment, amount: 100 })).toBe(false));
  it("rejects an uncaptured payment", () => expect(matchesCapturedPayment(order, { ...payment, status: "authorized", captured: false })).toBe(false));
  it("rejects another order", () => expect(matchesCapturedPayment(order, { ...payment, order_id: "other" })).toBe(false));
  it("rejects another currency", () => expect(matchesCapturedPayment(order, { ...payment, currency: "USD" })).toBe(false));
});