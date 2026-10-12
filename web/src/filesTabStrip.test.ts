import { describe, expect, test } from "bun:test";
import { filesTabId, stripEntries, type StripEntry } from "./filesTabStrip";

const tabs = [
  { tab_id: "api", number: 1 },
  { tab_id: "web", number: 2 },
  { tab_id: "logs", number: 3 },
];

function herdrTabIds(entries: StripEntry[]): string[] {
  return entries.flatMap((entry) =>
    entry.kind === "console" ? [entry.tabId] : [],
  );
}

describe("files tab strip", () => {
  test("places a linked files tab right after its console", () => {
    expect(stripEntries(tabs, new Set(), new Set(["web"]))).toEqual([
      { kind: "console", tabId: "api" },
      { kind: "console", tabId: "web" },
      { kind: "files", ownerTabId: "web" },
      { kind: "console", tabId: "logs" },
    ]);
  });

  test("keeps the files tab with its console when pins reorder the strip", () => {
    expect(
      stripEntries(tabs, new Set(["logs"]), new Set(["logs", "api"])),
    ).toEqual([
      { kind: "console", tabId: "logs" },
      { kind: "files", ownerTabId: "logs" },
      { kind: "console", tabId: "api" },
      { kind: "files", ownerTabId: "api" },
      { kind: "console", tabId: "web" },
    ]);
  });

  test("never yields the virtual id where Herdr tab ids are expected", () => {
    const entries = stripEntries(tabs, new Set(), new Set(["api", "web"]));
    expect(herdrTabIds(entries)).toEqual(["api", "web", "logs"]);
    expect(herdrTabIds(entries)).not.toContain(filesTabId("api"));
    expect(JSON.stringify(entries)).not.toContain(filesTabId("web"));
  });

  test("ignores links whose console is not in the strip", () => {
    expect(stripEntries(tabs, new Set(), new Set(["gone"]))).toEqual(
      tabs.map((tab) => ({ kind: "console", tabId: tab.tab_id })),
    );
  });

  test("builds the virtual id from the owner tab id", () => {
    expect(filesTabId("w1:t2")).toBe("files:w1:t2");
  });
});
