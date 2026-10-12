import { orderTabsForDisplay } from "./tabPins";
import type { Tab } from "./types";

const FILES_TAB_ID_PREFIX = "files:";

/**
 * Client-only id of a console's files tab. Herdr never sees it: strip entries
 * for files tabs carry the owner's id, never this one.
 */
export function filesTabId(ownerTabId: string): string {
  return `${FILES_TAB_ID_PREFIX}${ownerTabId}`;
}

export type StripEntry =
  | { kind: "console"; tabId: string }
  | { kind: "files"; ownerTabId: string };

/** Display order of the strip: each linked files tab right after its console. */
export function stripEntries(
  tabs: readonly Pick<Tab, "tab_id" | "number">[],
  pinnedTabIds: ReadonlySet<string>,
  linkedOwnerTabIds: ReadonlySet<string>,
): StripEntry[] {
  return orderTabsForDisplay(tabs, pinnedTabIds).flatMap((tab): StripEntry[] =>
    linkedOwnerTabIds.has(tab.tab_id)
      ? [
          { kind: "console", tabId: tab.tab_id },
          { kind: "files", ownerTabId: tab.tab_id },
        ]
      : [{ kind: "console", tabId: tab.tab_id }],
  );
}

export function sameStripEntry(left: StripEntry, right: StripEntry): boolean {
  return left.kind === "console"
    ? right.kind === "console" && right.tabId === left.tabId
    : right.kind === "files" && right.ownerTabId === left.ownerTabId;
}
