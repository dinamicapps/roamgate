import { expect, test } from "bun:test";
import { parseSidebarRail, serializeSidebarRail } from "./sidebarRail";

test("parses a stored rail flag, defaulting to expanded", () => {
  expect(parseSidebarRail("true")).toBe(true);
  expect(parseSidebarRail("false")).toBe(false);
  expect(parseSidebarRail(null)).toBe(false);
  expect(parseSidebarRail("")).toBe(false);
  expect(parseSidebarRail("1")).toBe(false);
});

test("round-trips through serialization", () => {
  expect(parseSidebarRail(serializeSidebarRail(true))).toBe(true);
  expect(parseSidebarRail(serializeSidebarRail(false))).toBe(false);
});
