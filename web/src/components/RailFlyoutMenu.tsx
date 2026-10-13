import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";
import type { Pane, Tab, Workspace } from "../types";
import { shortId } from "../utils";
import {
  showWorkspaceBranchBadge,
  workspaceDisplayName,
} from "../workspaceTreeBadges";
import { AgentStatusIcon } from "./AgentStatusIcon";
import {
  type FloatingMenuPosition,
  observeClampedContextMenu,
} from "./contextMenuPosition";
import {
  focusRovingItem,
  keyboardContextMenuPoint,
  treeKeyboardAction,
} from "./treeKeyboard";
import { nestedAgentPaneIds, nestedAgentTitle } from "./WorkspaceAgentRows";
import type { RailMenuEntry } from "./workspaceRail";
import "./ContextMenu.css";
import "./WorkspaceRail.css";

export const RAIL_FLYOUT_GAP = 4;

export type RailFlyoutLevel = {
  /** Workspace id of the rail item (level 0) or the expanded worktree. */
  id: string;
  anchor: FloatingMenuPosition;
  entries: RailMenuEntry[];
};

export function railEntryKey(entry: RailMenuEntry): string {
  return entry.kind === "agent"
    ? `agent:${entry.pane.pane_id}`
    : `${entry.kind}:${entry.workspace.workspace_id}`;
}

/** Point to the right of an anchor element, top-aligned. */
export function railFlyoutAnchor(element: Element): FloatingMenuPosition {
  const rect = element.getBoundingClientRect();
  return { left: rect.right + RAIL_FLYOUT_GAP, top: rect.top };
}

/** Resolve the open worktree path into the entries shown at each level. */
export function resolveRailFlyoutLevels(
  rootEntries: RailMenuEntry[],
  path: readonly { id: string; anchor: FloatingMenuPosition }[],
): RailFlyoutLevel[] {
  const levels: RailFlyoutLevel[] = [];
  let entries = rootEntries;
  for (const [index, step] of path.entries()) {
    if (index > 0) {
      const worktree = entries.find(
        (entry) =>
          entry.kind === "worktree" && entry.workspace.workspace_id === step.id,
      );
      if (worktree?.kind !== "worktree") break;
      entries = worktree.entries;
    }
    levels.push({ ...step, entries });
  }
  return levels;
}

function agentTabLabel(pane: Pane, tabs: readonly Tab[]): string {
  return (
    tabs
      .find(
        (tab) =>
          tab.tab_id === pane.tab_id && tab.workspace_id === pane.workspace_id,
      )
      ?.label.trim() ?? ""
  );
}

export function RailFlyoutMenu({
  level,
  depth,
  label,
  tabs,
  expandedId,
  onEntryHover,
  onChoose,
  onExpand,
  onCollapse,
  onTab,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onWorkspaceContextMenu,
  onAgentContextMenu,
}: {
  level: RailFlyoutLevel;
  depth: number;
  label: string;
  tabs: readonly Tab[];
  /** Worktree id whose sub-flyout is open from this level. */
  expandedId: string | null;
  onEntryHover: (
    entry: RailMenuEntry,
    depth: number,
    element: HTMLElement,
    pointerType: string,
  ) => void;
  onChoose: (
    entry: RailMenuEntry,
    depth: number,
    element: HTMLElement,
    viaKeyboard?: boolean,
  ) => void;
  /** Keyboard request to open a worktree's sub-flyout and focus it. */
  onExpand: (
    entry: Extract<RailMenuEntry, { kind: "worktree" }>,
    depth: number,
    element: HTMLElement,
  ) => void;
  /** Keyboard request to close this level and refocus its opener. */
  onCollapse: (depth: number) => void;
  onTab: () => void;
  onPointerDown: (pointerType: string) => void;
  onPointerEnter: () => void;
  onPointerLeave: (pointerType: string) => void;
  onWorkspaceContextMenu?: (workspace: Workspace, x: number, y: number) => void;
  onAgentContextMenu?: (pane: Pane, x: number, y: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    return observeClampedContextMenu(menu, level.anchor);
  }, [level.anchor]);

  const agentPanes = level.entries.flatMap((entry) =>
    entry.kind === "agent" ? [entry.pane] : [],
  );
  const paneIdsToShow = nestedAgentPaneIds(agentPanes, tabs);
  const activeIndex = level.entries.findIndex((entry) => entry.active);
  const tabStopIndex = activeIndex >= 0 ? activeIndex : 0;

  const onEntryKeyDown = (
    entry: RailMenuEntry,
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    const element = event.currentTarget;
    if (event.key === "Tab") {
      onTab();
      return;
    }
    const action =
      event.key === "Escape"
        ? "collapse"
        : treeKeyboardAction(event.key, event.shiftKey);
    if (!action) return;
    event.preventDefault();
    switch (action) {
      case "next":
      case "previous":
      case "first":
      case "last":
        focusRovingItem(
          Array.from(
            ref.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ??
              [],
          ),
          element,
          action,
        );
        return;
      case "activate":
        onChoose(entry, depth, element, true);
        return;
      case "expand":
        if (entry.kind === "worktree") onExpand(entry, depth, element);
        return;
      case "collapse":
        onCollapse(depth);
        return;
      case "context-menu": {
        const { x, y } = keyboardContextMenuPoint(element);
        if (entry.kind === "agent") onAgentContextMenu?.(entry.pane, x, y);
        else onWorkspaceContextMenu?.(entry.workspace, x, y);
      }
    }
  };

  const renderEntry = (entry: RailMenuEntry, index: number) => {
    const common = {
      type: "button" as const,
      role: "menuitem",
      tabIndex: index === tabStopIndex ? 0 : -1,
      "data-rail-entry": railEntryKey(entry),
      onPointerEnter: (event: React.PointerEvent<HTMLButtonElement>) =>
        onEntryHover(entry, depth, event.currentTarget, event.pointerType),
      onClick: (event: React.MouseEvent<HTMLButtonElement>) =>
        onChoose(entry, depth, event.currentTarget),
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) =>
        onEntryKeyDown(entry, event),
    };
    if (entry.kind === "agent") {
      const { pane } = entry;
      const [primary, ...secondary] = nestedAgentTitle(
        pane,
        agentTabLabel(pane, tabs),
      );
      return (
        <button
          key={railEntryKey(entry)}
          {...common}
          className={`context-menu-item rail-flyout-item rail-flyout-agent ${
            entry.active ? "is-active" : ""
          }`}
          aria-current={entry.active ? "true" : undefined}
          aria-label={`${[primary, ...secondary].join(" · ")}, ${
            pane.agent?.trim() || "Agent"
          }, status ${pane.agent_status}`}
          onContextMenu={(event) => {
            event.preventDefault();
            onAgentContextMenu?.(pane, event.clientX, event.clientY);
          }}
        >
          <AgentStatusIcon agent={pane.agent} status={pane.agent_status} />
          <span className="context-menu-item-label rail-flyout-label">
            {primary}
            {secondary.map((part) => (
              <span key={part} className="muted">
                {" "}
                · {part}
              </span>
            ))}
            {paneIdsToShow.has(pane.pane_id) ? (
              <span className="muted"> · {shortId(pane.pane_id)}</span>
            ) : null}
          </span>
        </button>
      );
    }

    const { workspace } = entry;
    const name = workspaceDisplayName(workspace);
    const onContextMenu = (event: React.MouseEvent) => {
      event.preventDefault();
      onWorkspaceContextMenu?.(workspace, event.clientX, event.clientY);
    };
    if (entry.kind === "worktree") {
      const expanded = expandedId === workspace.workspace_id;
      return (
        <button
          key={railEntryKey(entry)}
          {...common}
          className={`context-menu-item rail-flyout-item rail-flyout-worktree ${
            entry.active ? "is-active" : ""
          } ${expanded ? "is-expanded" : ""}`}
          aria-haspopup="menu"
          aria-expanded={expanded}
          aria-current={entry.active ? "true" : undefined}
          onContextMenu={onContextMenu}
        >
          <span className="context-menu-item-label rail-flyout-label">
            {name}
          </span>
          {entry.status ? (
            <span
              className={`workspace-rail-dot is-${entry.status}`}
              aria-label={`status ${entry.status}`}
            />
          ) : null}
          <ChevronRight size={13} aria-hidden="true" />
        </button>
      );
    }

    const branch = workspace.worktree?.git_status?.branch;
    return (
      <button
        key={railEntryKey(entry)}
        {...common}
        className={`context-menu-item rail-flyout-item rail-flyout-workspace ${
          entry.active ? "is-active" : ""
        }`}
        aria-current={entry.active ? "true" : undefined}
        onContextMenu={onContextMenu}
      >
        <strong className="context-menu-item-label rail-flyout-label">
          {name}
        </strong>
        {branch && showWorkspaceBranchBadge(workspace) ? (
          <span className="git-badge git-branch">{branch}</span>
        ) : null}
      </button>
    );
  };

  return createPortal(
    <div
      ref={ref}
      className="context-menu rail-flyout"
      role="menu"
      aria-label={label}
      data-rail-flyout={depth}
      style={{
        position: "fixed",
        left: level.anchor.left,
        top: level.anchor.top,
        zIndex: 1000,
      }}
      onPointerDown={(event) => onPointerDown(event.pointerType)}
      onPointerEnter={onPointerEnter}
      onPointerLeave={(event) => onPointerLeave(event.pointerType)}
    >
      {level.entries.map(renderEntry)}
    </div>,
    document.body,
  );
}
