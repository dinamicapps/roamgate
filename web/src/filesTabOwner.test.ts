import { describe, expect, test } from "bun:test";
import {
  activeTabIdForSnapshot,
  activeTabIdForWorkspace,
  filesTabOwnerForPane,
} from "./filesTabOwner";
import type { Pane, Tab, Workspace } from "./types";

function workspace(
  workspace_id: string,
  focused: boolean,
  active_tab_id?: string,
): Workspace {
  return {
    workspace_id,
    number: 1,
    label: workspace_id,
    focused,
    pane_count: 1,
    tab_count: 1,
    active_tab_id,
    agent_status: "idle",
  };
}

function tab(tab_id: string, workspace_id: string, focused = false): Tab {
  return {
    tab_id,
    workspace_id,
    number: 1,
    label: tab_id,
    focused,
    pane_count: 1,
    agent_status: "idle",
  };
}

function pane(pane_id: string, tab_id: string, workspace_id: string): Pane {
  return {
    pane_id,
    terminal_id: pane_id,
    workspace_id,
    tab_id,
    focused: false,
    agent_status: "idle",
    revision: 1,
  };
}

const snapshot = {
  workspaces: [workspace("A", true, "web"), workspace("B", false, "docs")],
  tabs: [tab("api", "A"), tab("web", "A"), tab("docs", "B")],
  panes: [
    pane("api-1", "api", "A"),
    pane("api-2", "api", "A"),
    pane("web-1", "web", "A"),
    pane("docs-1", "docs", "B"),
  ],
  layout: null,
};

describe("files tab owner", () => {
  test("a link resolves to the console of the pane that printed it", () => {
    expect(filesTabOwnerForPane(snapshot, "A", "api-2")).toBe("api");
  });

  test("a link from a vanished pane falls back to the active console", () => {
    expect(filesTabOwnerForPane(snapshot, "A", "gone")).toBe("web");
    expect(filesTabOwnerForPane(snapshot, "A", undefined)).toBe("web");
  });

  test("a pane outside the link's workspace does not own it", () => {
    expect(filesTabOwnerForPane(snapshot, "B", "api-1")).toBe("docs");
  });

  test("resolves the active console of a workspace that is not focused", () => {
    expect(activeTabIdForWorkspace(snapshot, "B")).toBe("docs");
    expect(activeTabIdForSnapshot(snapshot)).toBe("web");
  });

  test("ignores an active tab id that no longer belongs to the workspace", () => {
    expect(
      activeTabIdForWorkspace(
        {
          ...snapshot,
          workspaces: [workspace("A", true, "docs")],
          tabs: [tab("api", "A", true), tab("docs", "B")],
        },
        "A",
      ),
    ).toBe("api");
    expect(activeTabIdForWorkspace(snapshot, "missing")).toBeUndefined();
  });
});
