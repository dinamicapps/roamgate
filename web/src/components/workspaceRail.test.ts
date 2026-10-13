import { describe, expect, test } from "bun:test";
import type { Pane, Workspace } from "../types";
import { workspacePinKey } from "../workspacePins";
import {
  aggregateAgentStatus,
  buildRailItems,
  type RailMenuEntry,
  workspaceInitials,
} from "./workspaceRail";

const mainWorktree = {
  repo_key: "/repo/.git",
  repo_name: "repo",
  repo_root: "/repo",
  checkout_path: "/repo",
  is_linked_worktree: false,
};

function workspace(
  id: string,
  number: number,
  overrides: Partial<Workspace> = {},
): Workspace {
  return {
    workspace_id: id,
    number,
    label: id,
    focused: false,
    pane_count: 1,
    tab_count: 1,
    agent_status: "unknown",
    ...overrides,
  };
}

function linked(id: string, number: number, parentId: string): Workspace {
  return workspace(id, number, {
    worktree: {
      ...mainWorktree,
      checkout_path: `/repo-${id}`,
      is_linked_worktree: true,
      parent_workspace_id: parentId,
    },
  });
}

function pane(
  id: string,
  workspaceId: string,
  overrides: Partial<Pane> = {},
): Pane {
  return {
    pane_id: id,
    terminal_id: `t-${id}`,
    workspace_id: workspaceId,
    tab_id: `tab-${workspaceId}`,
    focused: false,
    agent: "claude",
    agent_status: "idle",
    revision: 1,
    ...overrides,
  };
}

function kinds(entries: RailMenuEntry[]) {
  return entries.map((entry) =>
    entry.kind === "agent"
      ? `agent:${entry.pane.pane_id}`
      : `${entry.kind}:${entry.workspace.workspace_id}`,
  );
}

describe("workspaceInitials", () => {
  test("uses the first letter of the first two words", () => {
    expect(workspaceInitials("roam gate")).toBe("RG");
    expect(workspaceInitials("agent os core")).toBe("AO");
  });

  test("splits on kebab, snake, dot and slash separators", () => {
    expect(workspaceInitials("sidebar-riel")).toBe("SR");
    expect(workspaceInitials("my_repo")).toBe("MR");
    expect(workspaceInitials("web.app")).toBe("WA");
    expect(workspaceInitials("org/project")).toBe("OP");
  });

  test("splits camelCase boundaries", () => {
    expect(workspaceInitials("roamGate")).toBe("RG");
    expect(workspaceInitials("DinamicApps")).toBe("DA");
  });

  test("uses the first two alphanumerics of a single word", () => {
    expect(workspaceInitials("roamgate")).toBe("RO");
    expect(workspaceInitials("x1")).toBe("X1");
    expect(workspaceInitials("42")).toBe("42");
    expect(workspaceInitials("ñandu")).toBe("ÑA");
  });

  test("keeps a single character", () => {
    expect(workspaceInitials("a")).toBe("A");
  });

  test("ignores symbols and falls back for names without alphanumerics", () => {
    expect(workspaceInitials("  #web!  ")).toBe("WE");
    expect(workspaceInitials("")).toBe("?");
    expect(workspaceInitials("   ")).toBe("?");
    expect(workspaceInitials("🚀🔥")).toBe("?");
    expect(workspaceInitials("--__")).toBe("?");
  });
});

describe("aggregateAgentStatus", () => {
  const withStatus = (...statuses: string[]) =>
    statuses.map((status, index) =>
      pane(`p${index}`, "w1", { agent_status: status }),
    );

  test("returns null without panes", () => {
    expect(aggregateAgentStatus([])).toBeNull();
  });

  test("prioritizes agents like the tab summary: blocked, working, idle, done, unknown", () => {
    expect(
      aggregateAgentStatus(
        withStatus("idle", "done", "working", "blocked", "x"),
      ),
    ).toBe("blocked");
    expect(aggregateAgentStatus(withStatus("idle", "working", "done"))).toBe(
      "working",
    );
    expect(aggregateAgentStatus(withStatus("idle", "done"))).toBe("idle");
    expect(aggregateAgentStatus(withStatus("unknown", "done"))).toBe("done");
    expect(aggregateAgentStatus(withStatus("unknown", "idle"))).toBe("idle");
    expect(aggregateAgentStatus(withStatus("mystery"))).toBe("unknown");
  });

  test("is case-insensitive", () => {
    expect(aggregateAgentStatus(withStatus("IDLE", "Blocked"))).toBe("blocked");
  });
});

describe("buildRailItems", () => {
  test("orders top-level workspaces like the tree, pins first", () => {
    const first = workspace("w1", 1);
    const second = workspace("w2", 2);
    const third = workspace("w3", 3);
    const items = buildRailItems({
      workspaces: [first, second, third],
      panes: [],
      pinnedWorkspaceKeys: new Set([workspacePinKey(third)]),
      activePaneId: null,
    });

    expect(items.map((item) => item.workspace.workspace_id)).toEqual([
      "w3",
      "w1",
      "w2",
    ]);
    expect(items.map((item) => item.pinned)).toEqual([true, false, false]);
    expect(items[0].initials).toBe("W3");
  });

  test("nests the workspace, its agents and its worktrees recursively", () => {
    const main = workspace("main", 1, {
      label: "roam gate",
      worktree: mainWorktree,
    });
    const childA = linked("wtA", 2, "main");
    const childB = linked("wtB", 3, "main");
    const items = buildRailItems({
      workspaces: [childB, main, childA],
      panes: [
        pane("p1", "main"),
        pane("shell", "main", { agent: undefined }),
        pane("blank", "main", { agent: "  " }),
        pane("p2", "wtA"),
      ],
      pinnedWorkspaceKeys: new Set(),
      activePaneId: null,
    });

    expect(items).toHaveLength(1);
    expect(items[0].initials).toBe("RG");
    expect(kinds(items[0].entries)).toEqual([
      "workspace:main",
      "agent:p1",
      "worktree:wtA",
      "worktree:wtB",
    ]);
    const worktreeA = items[0].entries[2];
    if (worktreeA.kind !== "worktree") throw new Error("expected worktree");
    expect(kinds(worktreeA.entries)).toEqual(["workspace:wtA", "agent:p2"]);
  });

  test("aggregates agent status over the whole subtree", () => {
    const main = workspace("main", 1, { worktree: mainWorktree });
    const child = linked("wt", 2, "main");
    const lonely = workspace("lonely", 3);
    const items = buildRailItems({
      workspaces: [main, child, lonely],
      panes: [
        pane("p1", "main", { agent_status: "idle" }),
        pane("p2", "wt", { agent_status: "blocked" }),
        pane("shell", "lonely", { agent: undefined, agent_status: "working" }),
      ],
      pinnedWorkspaceKeys: new Set(),
      activePaneId: null,
    });

    expect(items[0].status).toBe("blocked");
    const worktree = items[0].entries.find(
      (entry) => entry.kind === "worktree",
    );
    expect(worktree?.kind === "worktree" && worktree.status).toBe("blocked");
    expect(items[1].status).toBeNull();
  });

  test("propagates the active pane to its agent, worktree and rail item", () => {
    const main = workspace("main", 1, { worktree: mainWorktree });
    const child = linked("wt", 2, "main");
    const other = workspace("other", 3);
    const items = buildRailItems({
      workspaces: [main, child, other],
      panes: [pane("p1", "main"), pane("p2", "wt"), pane("p3", "other")],
      pinnedWorkspaceKeys: new Set(),
      activePaneId: "p2",
    });

    expect(items.map((item) => item.active)).toEqual([true, false]);
    const [workspaceEntry, agentEntry, worktreeEntry] = items[0].entries;
    expect(workspaceEntry.active).toBe(false);
    expect(agentEntry.active).toBe(false);
    expect(worktreeEntry.active).toBe(true);
    if (worktreeEntry.kind !== "worktree") throw new Error("expected worktree");
    expect(worktreeEntry.entries.map((entry) => entry.active)).toEqual([
      false,
      true,
    ]);
  });

  test("falls back to focused panes and workspaces without an active pane", () => {
    const focused = workspace("focused", 1, { focused: true });
    const other = workspace("other", 2);
    const items = buildRailItems({
      workspaces: [focused, other],
      panes: [pane("p1", "other", { focused: true })],
      pinnedWorkspaceKeys: new Set(),
      activePaneId: null,
    });

    expect(items.map((item) => item.active)).toEqual([true, true]);
    expect(items[0].entries[0].active).toBe(true);
    expect(items[1].entries[1].active).toBe(true);
  });

  test("ignores focused panes when an active pane id is known", () => {
    const items = buildRailItems({
      workspaces: [workspace("w1", 1)],
      panes: [pane("p1", "w1", { focused: true })],
      pinnedWorkspaceKeys: new Set(),
      activePaneId: "elsewhere",
    });

    expect(items[0].active).toBe(false);
    expect(items[0].entries[1].active).toBe(false);
  });
});
