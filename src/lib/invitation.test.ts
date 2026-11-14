import { describe, expect, it } from "vitest";
import { EVENT, HOME, calendarUrl, directionsUrl, getCountdown, sharingUrl } from "./invitation";

describe("Invitation rules", () => {
  it("uses November 27 at 9:30 AM in India regardless of viewer timezone", () => {
    expect(Date.parse(EVENT.start)).toBe(Date.parse("2026-11-27T04:00:00Z"));
    expect(getCountdown(Date.parse("2026-11-26T02:58:57Z"))).toEqual([1, 1, 1, 3]);
  });
  it("never displays negative time after the ceremony starts", () => {
    expect(getCountdown(Date.parse("2026-11-28T04:00:00Z"))).toEqual([0, 0, 0, 0]);
  });
  it("preserves the three exact ceremony times", () => {
    expect(EVENT.schedule.map(({ title, time }) => [title, time])).toEqual([["Vastu Pooja", "9:30 AM"], ["Havan", "5:00 PM"], ["Dinner", "7:30 PM onwards"]]);
  });
  it("uses the exact full residence for directions and calendar", () => {
    const address = "6, Shreenathji Villa, Opp. Panetar Park, Near Girirajji Temple, Umreth.";
    expect(new URL(directionsUrl).searchParams.get("destination")).toBe(address);
    expect(new URL(calendarUrl).searchParams.get("location")).toBe(address);
  });
  it("creates the calendar in Indian time with the exact morning start", () => {
    expect(new URL(calendarUrl).searchParams.get("dates")).toBe("20261127T040000Z/20261127T143000Z");
    expect(new URL(calendarUrl).searchParams.get("ctz")).toBe("Asia/Kolkata");
  });
  it("preserves all inviting family names", () => {
    expect(EVENT.family).toEqual(["Dilip & Shilpa Doshi", "Arpan & Krishna Doshi", "Vannya Doshi", "Kayaan Doshi"]);
  });
  it("shares the actual invitation link and ceremony information", () => {
    const text = new URL(sharingUrl("https://example.com/invitation")).searchParams.get("text");
    expect(text).toContain("https://example.com/invitation");
    expect(text).toContain("Friday, November 27, 2026");
    expect(text).toContain("Dinner — 7:30 PM onwards");
  });
  it("names the home exactly AANANDI everywhere it is shared", () => {
    expect(HOME.name).toBe("AANANDI");
    expect(new URL(calendarUrl).searchParams.get("text")).toContain("AANANDI");
    expect(new URL(sharingUrl("https://example.com")).searchParams.get("text")).toContain("AANANDI");
    expect(new URL(calendarUrl).searchParams.get("text")).not.toContain("Shubh");
  });
});
