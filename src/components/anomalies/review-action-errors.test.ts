import { describe, expect, it } from "vitest";
import { formatActionSaveError } from "./review-action-errors";

describe("formatActionSaveError", () => {
  it("adds a specific hint for invalid_origin", () => {
    const message = formatActionSaveError("Unable to save this action right now.", "invalid_origin");

    expect(message).toContain("Unable to save this action right now.");
    expect(message).toContain("DEMO_BASE_URL");
  });

  it("adds a session hint for unauthenticated", () => {
    const message = formatActionSaveError("Unable to save this action right now.", "unauthenticated");

    expect(message).toContain("Unable to save this action right now.");
    expect(message).toContain("expired");
  });

  it("falls back to the raw server error when unknown", () => {
    const message = formatActionSaveError("Unable to save this action right now.", "custom_error");

    expect(message).toBe("Unable to save this action right now. Server error: custom_error.");
  });
});
