import { getShortcutSnapshot } from "./shortcutPreferences";
import { matchesShortcut, type ShortcutBindings } from "./shortcutBindings";
import { sameStripEntry, stripEntries, type StripEntry } from "./filesTabStrip";
import type { Pane, Tab } from "./types";

export type TabShortcutAction = "create" | "close" | "previous" | "next";

type TabShortcutEvent = Pick<
  KeyboardEvent,
  "key" | "code" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey"
>;

/** Resolve tab commands from the active preset. */
export function tabShortcutAction(
  event: TabShortcutEvent,
  bindings: ShortcutBindings = getShortcutSnapshot().preset.bindings,
): TabShortcutAction | null {
  for (const action of ["create", "close", "previous", "next"] as const) {
    if (matchesShortcut(event, `tab.${action}`, bindings)) return action;
  }
  return null;
}

/** Closes only the active pane in split tabs, otherwise the tab itself. */
export function closeShortcutTarget(
  tabId: string | undefined,
  panes: Pick<Pane, "pane_id" | "tab_id" | "focused">[],
  activePaneId: string | undefined,
): { type: "pane" | "tab"; id: string } | null {
  if (!tabId) return null;
  const tabPanes = panes.filter((pane) => pane.tab_id === tabId);
  if (tabPanes.length <= 1) return { type: "tab", id: tabId };
  const pane =
    tabPanes.find((pane) => pane.pane_id === activePaneId) ??
    tabPanes.find((pane) => pane.focused) ??
    tabPanes[0];
  return { type: "pane", id: pane.pane_id };
}

/**
 * Selects the adjacent strip entry, wrapping at each end. Linked files tabs
 * take part, unlike the number shortcuts, which address consoles only.
 */
export function adjacentStripEntry(
  tabs: Pick<Tab, "tab_id" | "number">[],
  current: StripEntry | null,
  direction: "previous" | "next",
  pinnedTabIds: ReadonlySet<string> = new Set(),
  linkedOwnerTabIds: ReadonlySet<string> = new Set(),
): StripEntry | null {
  const entries = stripEntries(tabs, pinnedTabIds, linkedOwnerTabIds);
  if (entries.length === 0) return null;
  const index = current
    ? entries.findIndex((entry) => sameStripEntry(entry, current))
    : -1;
  if (index < 0)
    return direction === "previous" ? entries[entries.length - 1] : entries[0];
  const offset = direction === "previous" ? -1 : 1;
  return entries[(index + offset + entries.length) % entries.length];
}
