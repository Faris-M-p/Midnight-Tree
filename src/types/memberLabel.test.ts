import { describe, expect, it } from "vitest";
import { memberLabel } from "./database";

describe("memberLabel", () => {
  it("prefers display_name", () => {
    expect(
      memberLabel({
        display_name: "Aunt Mae",
        first_name: "Mae",
        last_name: "Smith",
        member_type: "real"
      })
    ).toBe("Aunt Mae");
  });

  it("joins first + last", () => {
    expect(
      memberLabel({
        display_name: null,
        first_name: "John",
        last_name: "Doe",
        member_type: "real"
      })
    ).toBe("John Doe");
  });

  it("marks empty placeholders as Unknown", () => {
    expect(
      memberLabel({
        display_name: null,
        first_name: "",
        last_name: null,
        member_type: "placeholder"
      })
    ).toBe("Unknown");
  });
});
