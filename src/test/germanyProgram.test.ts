import { describe, expect, it } from "vitest";
import { germanyProgram } from "../content/germanyProgram";

describe("Germany program payment deadline", () => {
  it("records the supplied last payment date as 20 November 2026", () => {
    expect(germanyProgram.paymentDeadline).toBe("2026-11-20");
  });
});