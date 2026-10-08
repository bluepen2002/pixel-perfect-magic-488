import { describe, expect, it } from "vitest";
import { daysWaiting, fundBreakdown, isOverdue } from "./insights";

const now = new Date("2026-10-07T12:00:00Z");

describe("review queue", () => {
  it("flags open requests waiting 7 or more days", () => {
    expect(isOverdue("SUBMITTED", "2026-09-30T12:00:00Z", now)).toBe(true);
    expect(isOverdue("SUBMITTED", "2026-10-01T12:00:00Z", now)).toBe(false);
  });
  it("never flags decided requests", () => {
    expect(isOverdue("APPROVED", "2026-09-01T12:00:00Z", now)).toBe(false);
  });
  it("counts whole days", () => {
    expect(daysWaiting("2026-10-04T12:00:00Z", now)).toBe(3);
  });
});

describe("fund breakdown", () => {
  it("held = contributed minus sent", () => {
    expect(fundBreakdown(1000, 250)).toMatchObject({ held: 750, sentPct: 25, heldPct: 75 });
  });
  it("handles an empty fund", () => {
    expect(fundBreakdown(0, 0)).toMatchObject({ held: 0, sentPct: 0, heldPct: 0 });
  });
});
