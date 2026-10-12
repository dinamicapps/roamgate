import type { State } from "./store";

type OwnerSnapshot = Pick<State, "workspaces" | "tabs" | "layout">;

/** The console Herdr shows for a workspace, if it still exists there. */
export function activeTabIdForWorkspace(
  snapshot: OwnerSnapshot,
  workspaceId: string,
): string | undefined {
  const workspace = snapshot.workspaces.find(
    (candidate) => candidate.workspace_id === workspaceId,
  );
  if (!workspace) return undefined;
  const tabs = snapshot.tabs.filter((tab) => tab.workspace_id === workspaceId);
  const tabIds = new Set(tabs.map((tab) => tab.tab_id));
  return [
    workspace.active_tab_id,
    snapshot.layout?.tab_id,
    tabs.find((tab) => tab.focused)?.tab_id,
  ].find((tabId): tabId is string => !!tabId && tabIds.has(tabId));
}

export function activeTabIdForSnapshot(
  snapshot: OwnerSnapshot,
): string | undefined {
  const workspace = snapshot.workspaces.find((candidate) => candidate.focused);
  return workspace
    ? activeTabIdForWorkspace(snapshot, workspace.workspace_id)
    : undefined;
}

/**
 * Owner console of a file link: the tab of the pane that printed it, not the
 * active console. Falls back to the workspace's active console when the pane
 * is gone.
 */
export function filesTabOwnerForPane(
  snapshot: OwnerSnapshot & Pick<State, "panes">,
  workspaceId: string,
  paneId: string | undefined,
): string | undefined {
  const pane = paneId
    ? snapshot.panes.find((candidate) => candidate.pane_id === paneId)
    : undefined;
  if (
    pane &&
    snapshot.tabs.some(
      (tab) => tab.tab_id === pane.tab_id && tab.workspace_id === workspaceId,
    )
  )
    return pane.tab_id;
  return activeTabIdForWorkspace(snapshot, workspaceId);
}
