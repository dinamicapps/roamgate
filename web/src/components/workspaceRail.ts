import type { Pane, Workspace } from "../types";
import { workspaceDisplayName } from "../workspaceTreeBadges";
import { isWorkspacePinned } from "../workspacePins";
import { buildWorkspaceHierarchy } from "../worktree";
import {
  AGENT_STATE_PRIORITY,
  type AgentStateKind,
  agentStateKind,
  groupAgentPanesByWorkspace,
} from "./agentSession";

export type RailAgentStatus = AgentStateKind;

export type RailMenuEntry =
  | { kind: "workspace"; workspace: Workspace; active: boolean }
  | { kind: "agent"; pane: Pane; active: boolean }
  | {
      kind: "worktree";
      workspace: Workspace;
      status: RailAgentStatus | null;
      active: boolean;
      entries: RailMenuEntry[];
    };

export type RailItem = {
  workspace: Workspace;
  initials: string;
  status: RailAgentStatus | null;
  pinned: boolean;
  active: boolean;
  entries: RailMenuEntry[];
};

export function workspaceInitials(name: string): string {
  const words = name
    .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2")
    .split(/[\s\-_./]+/u)
    .map((word) => Array.from(word.replace(/[^\p{L}\p{N}]/gu, "")))
    .filter((chars) => chars.length > 0);
  if (words.length === 0) return "?";
  const initials =
    words.length > 1
      ? `${words[0][0]}${words[1][0]}`
      : words[0].slice(0, 2).join("");
  return initials.toLocaleUpperCase();
}

export function aggregateAgentStatus(
  panes: readonly Pick<Pane, "agent_status">[],
): RailAgentStatus | null {
  let status: RailAgentStatus | null = null;
  for (const pane of panes) {
    const candidate = agentStateKind(pane.agent_status);
    if (
      !status ||
      AGENT_STATE_PRIORITY[candidate] > AGENT_STATE_PRIORITY[status]
    ) {
      status = candidate;
    }
  }
  return status;
}

export function isActiveAgentPane(
  pane: Pane,
  activePaneId: string | null,
): boolean {
  return pane.pane_id === activePaneId || (!activePaneId && pane.focused);
}

export function workspaceSubtreeContainsActiveItem(
  workspace: Workspace,
  childrenByParent: ReadonlyMap<string, Workspace[]>,
  agentsByWorkspace: ReadonlyMap<string, Pane[]>,
  activePaneId: string | null,
): boolean {
  if (workspace.focused) return true;
  const agents = agentsByWorkspace.get(workspace.workspace_id) ?? [];
  if (agents.some((pane) => isActiveAgentPane(pane, activePaneId))) {
    return true;
  }
  return (childrenByParent.get(workspace.workspace_id) ?? []).some((child) =>
    workspaceSubtreeContainsActiveItem(
      child,
      childrenByParent,
      agentsByWorkspace,
      activePaneId,
    ),
  );
}

type RailSubtree = {
  entries: RailMenuEntry[];
  agents: Pane[];
};

// The rail always renders the nested hierarchy, whatever agent layout the
// tree uses, so the flyout of a worktree mirrors the one of its parent.
export function buildRailItems({
  workspaces,
  panes,
  pinnedWorkspaceKeys,
  activePaneId,
}: {
  workspaces: Workspace[];
  panes: readonly Pane[];
  pinnedWorkspaceKeys: ReadonlySet<string>;
  activePaneId: string | null;
}): RailItem[] {
  const { topLevel, childrenByParent } = buildWorkspaceHierarchy(
    workspaces,
    pinnedWorkspaceKeys,
  );
  const agentsByWorkspace = groupAgentPanesByWorkspace(panes);

  const subtree = (workspace: Workspace): RailSubtree => {
    const ownAgents = agentsByWorkspace.get(workspace.workspace_id) ?? [];
    const agentEntries = ownAgents.map(
      (pane): RailMenuEntry => ({
        kind: "agent",
        pane,
        active: isActiveAgentPane(pane, activePaneId),
      }),
    );
    const agents = [...ownAgents];
    const worktreeEntries: RailMenuEntry[] = [];
    for (const child of childrenByParent.get(workspace.workspace_id) ?? []) {
      const nested = subtree(child);
      agents.push(...nested.agents);
      worktreeEntries.push({
        kind: "worktree",
        workspace: child,
        status: aggregateAgentStatus(nested.agents),
        active: subtreeActive(child),
        entries: nested.entries,
      });
    }
    return {
      entries: [
        { kind: "workspace", workspace, active: workspace.focused },
        ...agentEntries,
        ...worktreeEntries,
      ],
      agents,
    };
  };
  const subtreeActive = (workspace: Workspace) =>
    workspaceSubtreeContainsActiveItem(
      workspace,
      childrenByParent,
      agentsByWorkspace,
      activePaneId,
    );

  return topLevel.map((workspace) => {
    const nested = subtree(workspace);
    return {
      workspace,
      initials: workspaceInitials(workspaceDisplayName(workspace)),
      status: aggregateAgentStatus(nested.agents),
      pinned: isWorkspacePinned(pinnedWorkspaceKeys, workspace),
      active: subtreeActive(workspace),
      entries: nested.entries,
    };
  });
}
