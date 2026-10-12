import { defaultShortcutBindings } from "./shortcutBindings";
import { describe, expect, test } from "bun:test";
import {
  adjacentStripEntry,
  closeShortcutTarget,
  tabShortcutAction as resolveShortcut,
} from "./tabShortcuts";

const tabShortcutAction = (event: Parameters<typeof resolveShortcut>[0]) =>
  resolveShortcut(event, defaultShortcutBindings("mac"));

function keyEvent(
  overrides: Partial<Parameters<typeof tabShortcutAction>[0]> = {},
): Parameters<typeof tabShortcutAction>[0] {
  return {
    key: "",
    code: "",
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    ...overrides,
  };
}

describe("tab shortcuts", () => {
  test("recognizes the macOS tab management shortcuts", () => {
    expect(tabShortcutAction(keyEvent({ key: "t", metaKey: true }))).toBe(
      "create",
    );
    expect(tabShortcutAction(keyEvent({ key: "W", metaKey: true }))).toBe(
      "close",
    );
    expect(
      tabShortcutAction(
        keyEvent({ key: "ArrowLeft", metaKey: true, altKey: true }),
      ),
    ).toBe("previous");
    expect(
      tabShortcutAction(
        keyEvent({ key: "ArrowRight", metaKey: true, altKey: true }),
      ),
    ).toBe("next");
  });

  test("rejects extra or non-Command modifiers", () => {
    expect(
      tabShortcutAction(keyEvent({ key: "t", metaKey: true, shiftKey: true })),
    ).toBeNull();
    expect(tabShortcutAction(keyEvent({ key: "w", ctrlKey: true }))).toBeNull();
    expect(
      tabShortcutAction(
        keyEvent({ key: "ArrowLeft", metaKey: true, ctrlKey: true }),
      ),
    ).toBeNull();
  });
});

describe("close shortcut target", () => {
  const panes = [
    { pane_id: "one", tab_id: "split", focused: true },
    { pane_id: "two", tab_id: "split", focused: false },
    { pane_id: "other", tab_id: "single", focused: true },
  ];

  test("closes the selected pane rather than its split tab", () => {
    expect(closeShortcutTarget("split", panes, "two")).toEqual({
      type: "pane",
      id: "two",
    });
  });

  test("ignores stale selection from another tab and uses local focus", () => {
    expect(closeShortcutTarget("split", panes, "other")).toEqual({
      type: "pane",
      id: "one",
    });
    expect(closeShortcutTarget("split", panes, undefined)).toEqual({
      type: "pane",
      id: "one",
    });
  });

  test("falls back to a tab-local pane when focus is missing", () => {
    expect(
      closeShortcutTarget(
        "split",
        panes.map((pane) => ({ ...pane, focused: false })),
        undefined,
      ),
    ).toEqual({ type: "pane", id: "one" });
  });

  test("closes only the files tab while it hides its console", () => {
    expect(closeShortcutTarget("split", panes, "two", true)).toEqual({
      type: "files",
      id: "split",
    });
    expect(closeShortcutTarget("single", panes, "other", true)).toEqual({
      type: "files",
      id: "single",
    });
    expect(closeShortcutTarget(undefined, panes, undefined, true)).toBeNull();
  });

  test("closes the tab when it has at most one pane", () => {
    expect(closeShortcutTarget("single", panes, "other")).toEqual({
      type: "tab",
      id: "single",
    });
    expect(closeShortcutTarget("empty", panes, undefined)).toEqual({
      type: "tab",
      id: "empty",
    });
  });

  test("does nothing without an active tab", () => {
    expect(closeShortcutTarget(undefined, panes, "one")).toBeNull();
  });
});

describe("adjacent tab selection", () => {
  // Herdr's list order, not its stable tab numbers, is the strip order.
  const tabs = [
    { tab_id: "first", number: 3 },
    { tab_id: "second", number: 1 },
    { tab_id: "third", number: 2 },
  ];
  const consoleTab = (tabId: string) => ({ kind: "console" as const, tabId });
  const filesTab = (ownerTabId: string) => ({
    kind: "files" as const,
    ownerTabId,
  });
  const adjacentTabId = (
    tabId: string | undefined,
    direction: "previous" | "next",
    pinned?: ReadonlySet<string>,
    list = tabs,
  ) => {
    const entry = adjacentStripEntry(
      list,
      tabId ? consoleTab(tabId) : null,
      direction,
      pinned,
    );
    return entry?.kind === "console" ? entry.tabId : null;
  };

  test("switches in tab-list order and wraps", () => {
    expect(adjacentTabId("first", "next")).toBe("second");
    expect(adjacentTabId("third", "next")).toBe("first");
    expect(adjacentTabId("first", "previous")).toBe("third");
  });

  test("uses a deterministic edge when the active tab is unknown", () => {
    expect(adjacentTabId(undefined, "next")).toBe("first");
    expect(adjacentTabId("missing", "previous")).toBe("third");
    expect(adjacentTabId(undefined, "next", undefined, [])).toBeNull();
  });

  test("follows the tab strip when pinned tabs lead it", () => {
    const pinned = new Set(["third"]);
    expect(adjacentTabId("third", "next", pinned)).toBe("first");
    expect(adjacentTabId("second", "next", pinned)).toBe("third");
    expect(adjacentTabId("first", "previous", pinned)).toBe("third");
  });

  test("passes through a linked files tab right after its console", () => {
    const linked = new Set(["second"]);
    const step = (
      current: ReturnType<typeof consoleTab> | ReturnType<typeof filesTab>,
      direction: "previous" | "next",
    ) => adjacentStripEntry(tabs, current, direction, new Set(), linked);
    expect(step(consoleTab("second"), "next")).toEqual(filesTab("second"));
    expect(step(filesTab("second"), "next")).toEqual(consoleTab("third"));
    expect(step(filesTab("second"), "previous")).toEqual(consoleTab("second"));
    expect(step(consoleTab("third"), "previous")).toEqual(filesTab("second"));
  });
});
