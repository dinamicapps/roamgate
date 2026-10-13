import type { GitStatusSummary, Workspace } from "./types";

export function workspaceDisplayName(workspace: Workspace): string {
  return workspace.label || workspace.workspace_id;
}

export function showWorkspaceBranchBadge(workspace: Workspace): boolean {
  const branch = workspace.worktree?.git_status?.branch;
  if (!branch) return true;
  return !(
    workspace.worktree?.is_linked_worktree === true &&
    workspaceDisplayName(workspace).trim() === branch.trim()
  );
}

export function gitStatusTitle(status?: GitStatusSummary) {
  if (!status) return "";
  if (status.error) return `git status unavailable: ${status.error}`;
  const parts = [
    status.branch ? `branch: ${status.branch}` : null,
    status.upstream ? `upstream: ${status.upstream}` : null,
    status.ahead ? `ahead: ${status.ahead}` : null,
    status.behind ? `behind: ${status.behind}` : null,
    status.staged ? `staged: ${status.staged}` : null,
    status.unstaged ? `unstaged: ${status.unstaged}` : null,
    status.untracked ? `untracked: ${status.untracked}` : null,
    status.conflicted ? `conflicted: ${status.conflicted}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function workspaceLocationTitle(workspace: Workspace): string {
  return workspace.worktree
    ? [
        `${workspace.worktree.repo_name} · ${workspace.worktree.checkout_path}`,
        gitStatusTitle(workspace.worktree.git_status),
      ]
        .filter(Boolean)
        .join("\n")
    : workspace.workspace_id;
}
