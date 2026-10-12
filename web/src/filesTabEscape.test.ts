import { describe, expect, test } from "bun:test";
import { filesTabEscapeStep } from "./filesTabEscape";

describe("files tab Esc cascade", () => {
  const idle = { handled: false, overlayOpen: false, compactDetailOpen: false };

  test("leaves Esc to inner handlers and open overlays", () => {
    expect(filesTabEscapeStep({ ...idle, handled: true })).toBe("ignore");
    expect(
      filesTabEscapeStep({
        ...idle,
        overlayOpen: true,
        compactDetailOpen: true,
      }),
    ).toBe("ignore");
  });

  test("returns from the compact detail before leaving the tab", () => {
    expect(filesTabEscapeStep({ ...idle, compactDetailOpen: true })).toBe(
      "close-detail",
    );
  });

  test("shows the console once nothing transient is left", () => {
    expect(filesTabEscapeStep(idle)).toBe("show-console");
  });
});
