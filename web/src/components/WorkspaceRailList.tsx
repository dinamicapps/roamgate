import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Pin } from "lucide-react";
import { store } from "../store";
import type { Pane, Tab, Workspace } from "../types";
import {
  workspaceDisplayName,
  workspaceLocationTitle,
} from "../workspaceTreeBadges";
import type { FloatingMenuPosition } from "./contextMenuPosition";
import {
  RailFlyoutMenu,
  railFlyoutAnchor,
  resolveRailFlyoutLevels,
} from "./RailFlyoutMenu";
import {
  focusRovingItem,
  keyboardContextMenuPoint,
  treeKeyboardAction,
} from "./treeKeyboard";
import type { RailItem, RailMenuEntry } from "./workspaceRail";
import "./WorkspaceRail.css";

export const RAIL_HOVER_OPEN_MS = 150;
export const RAIL_HOVER_CLOSE_MS = 250;

/** One open flyout level: the rail item (index 0) or an expanded worktree. */
type RailOpenStep = { id: string; anchor: FloatingMenuPosition };

function railItemLabel(item: RailItem): string {
  const name = workspaceDisplayName(item.workspace);
  return `${name}, ${item.status ? `agents ${item.status}` : "no agents"}`;
}

export function WorkspaceRailList({
  items,
  tabs,
  onSelect,
  onSelectAgent,
  onWorkspaceContextMenu,
  onAgentContextMenu,
  hoverOpenMs = RAIL_HOVER_OPEN_MS,
  hoverCloseMs = RAIL_HOVER_CLOSE_MS,
}: {
  items: RailItem[];
  tabs: readonly Tab[];
  onSelect?: (workspace: Workspace) => void;
  onSelectAgent?: (pane: Pane) => void;
  onWorkspaceContextMenu?: (workspace: Workspace, x: number, y: number) => void;
  onAgentContextMenu?: (pane: Pane, x: number, y: number) => void;
  hoverOpenMs?: number;
  hoverCloseMs?: number;
}) {
  // The open path is the single source of truth for every flyout level.
  const [openPath, setOpenPath] = useState<RailOpenStep[]>([]);
  // A click pins the flyout until an outside click, Escape, or a choice.
  const [pinned, setPinned] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerType = useRef("mouse");
  // Depth of a level opened from the keyboard whose first entry gets focus.
  const pendingFocusDepth = useRef<number | null>(null);
  const isOpen = openPath.length > 0;

  const clearTimer = () => {
    if (!timer.current) return;
    clearTimeout(timer.current);
    timer.current = null;
  };
  const schedule = (delay: number, action: () => void) => {
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      action();
    }, delay);
  };
  const close = () => {
    clearTimer();
    setOpenPath([]);
    setPinned(false);
  };
  const scheduleClose = (type: string) => {
    if (type === "touch" || pinned) return;
    schedule(hoverCloseMs, close);
  };
  const openSubmenu = (depth: number, id: string, element: HTMLElement) => {
    const anchor = railFlyoutAnchor(element);
    setOpenPath((current) => [...current.slice(0, depth + 1), { id, anchor }]);
  };

  const railButtons = () =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-rail-item]") ?? [],
    );
  const railButton = (id: string | undefined) =>
    railButtons().find((button) => button.dataset.railItem === id);
  /** The rail item or worktree entry that opened the level at `depth`. */
  const levelOpener = (depth: number) => {
    if (depth === 0) return railButton(openPath[0]?.id);
    const key = `worktree:${openPath[depth]?.id}`;
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-rail-flyout="${depth - 1}"] [data-rail-entry]`,
      ),
    ).find((entry) => entry.dataset.railEntry === key);
  };
  // Keyboard closes move focus out of the flyout first so it never falls
  // back to the document body.
  const closeToRail = () => {
    railButton(openPath[0]?.id)?.focus();
    close();
  };
  const collapseLevel = (depth: number) => {
    levelOpener(depth)?.focus();
    if (depth === 0) {
      close();
      return;
    }
    clearTimer();
    setOpenPath((current) => current.slice(0, depth));
  };
  const openFromKeyboard = (id: string, element: HTMLElement) => {
    clearTimer();
    pendingFocusDepth.current = 0;
    setOpenPath([{ id, anchor: railFlyoutAnchor(element) }]);
    setPinned(true);
  };

  useEffect(() => clearTimer, []);

  useLayoutEffect(() => {
    const depth = pendingFocusDepth.current;
    if (depth === null || openPath.length <= depth) return;
    pendingFocusDepth.current = null;
    document
      .querySelector<HTMLElement>(
        `[data-rail-flyout="${depth}"] [role='menuitem']`,
      )
      ?.focus();
  }, [openPath]);

  useEffect(() => {
    if (!isOpen) return;
    const insideRail = (target: EventTarget | null) =>
      target instanceof Node &&
      (!!listRef.current?.contains(target) ||
        (target instanceof Element && !!target.closest("[data-rail-flyout]")));
    const onPointerDown = (event: PointerEvent) => {
      if (!insideRail(event.target)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) close();
    };
    const onScroll = (event: Event) => {
      if (
        !(
          event.target instanceof Element &&
          event.target.closest("[data-rail-flyout]")
        )
      ) {
        close();
      }
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  const selectWorkspace = (workspace: Workspace) => {
    store.focusWorkspace(workspace.workspace_id);
    onSelect?.(workspace);
  };

  const onEntryHover = (
    entry: RailMenuEntry,
    depth: number,
    element: HTMLElement,
    type: string,
  ) => {
    pointerType.current = type;
    if (type === "touch") return;
    if (entry.kind === "worktree") {
      const id = entry.workspace.workspace_id;
      if (openPath[depth + 1]?.id === id && openPath.length === depth + 2) {
        clearTimer();
      } else {
        schedule(hoverOpenMs, () => openSubmenu(depth, id, element));
      }
    } else if (openPath.length > depth + 1) {
      schedule(hoverOpenMs, () =>
        setOpenPath((current) => current.slice(0, depth + 1)),
      );
    } else {
      clearTimer();
    }
  };

  const onChoose = (
    entry: RailMenuEntry,
    depth: number,
    element: HTMLElement,
    viaKeyboard = false,
  ) => {
    if (
      entry.kind === "worktree" &&
      !viaKeyboard &&
      pointerType.current === "touch"
    ) {
      // Touch has no hover: a tap toggles the sub-flyout, whose first entry
      // chooses the worktree itself.
      clearTimer();
      setPinned(true);
      if (openPath[depth + 1]?.id === entry.workspace.workspace_id) {
        setOpenPath((current) => current.slice(0, depth + 1));
      } else {
        openSubmenu(depth, entry.workspace.workspace_id, element);
      }
      return;
    }
    if (viaKeyboard) closeToRail();
    else close();
    if (entry.kind === "agent") {
      void store.focusPane(entry.pane.pane_id);
      onSelectAgent?.(entry.pane);
    } else {
      selectWorkspace(entry.workspace);
    }
  };

  const openItem = items.find(
    (item) => item.workspace.workspace_id === openPath[0]?.id,
  );
  const levels = openItem
    ? resolveRailFlyoutLevels(openItem.entries, openPath)
    : [];

  return (
    <>
      <ul ref={listRef} className="workspace-rail-items">
        {items.map((item) => {
          const { workspace } = item;
          const id = workspace.workspace_id;
          const name = workspaceDisplayName(workspace);
          const expanded = openPath[0]?.id === id;
          const tabStop =
            (items.find((candidate) => candidate.active) ?? items[0]) === item;
          return (
            <li key={id}>
              <button
                type="button"
                className={`workspace-rail-item ${item.active ? "is-active" : ""} ${
                  expanded ? "is-expanded" : ""
                }`}
                data-rail-item={id}
                tabIndex={tabStop ? 0 : -1}
                title={`${name}\n${workspaceLocationTitle(workspace)}`}
                aria-label={railItemLabel(item)}
                aria-haspopup="menu"
                aria-expanded={expanded}
                aria-current={item.active ? "true" : undefined}
                onPointerDown={(event) => {
                  pointerType.current = event.pointerType;
                }}
                onPointerEnter={(event) => {
                  pointerType.current = event.pointerType;
                  if (event.pointerType === "touch") return;
                  clearTimer();
                  if (expanded) return;
                  const element = event.currentTarget;
                  // Menubar behavior: an open flyout follows the pointer.
                  if (isOpen) {
                    setOpenPath([{ id, anchor: railFlyoutAnchor(element) }]);
                    return;
                  }
                  schedule(hoverOpenMs, () =>
                    setOpenPath([{ id, anchor: railFlyoutAnchor(element) }]),
                  );
                }}
                onPointerLeave={(event) => scheduleClose(event.pointerType)}
                onClick={(event) => {
                  clearTimer();
                  selectWorkspace(workspace);
                  if (expanded && pinned) {
                    close();
                    return;
                  }
                  setOpenPath([
                    { id, anchor: railFlyoutAnchor(event.currentTarget) },
                  ]);
                  setPinned(true);
                }}
                onKeyUp={(event) => {
                  // Space activates on keydown; keep keyup from clicking too.
                  if (event.key === " ") event.preventDefault();
                }}
                onKeyDown={(event) => {
                  const element = event.currentTarget;
                  if (event.key === "Escape") {
                    if (!expanded) return;
                    event.preventDefault();
                    close();
                    return;
                  }
                  const action = treeKeyboardAction(event.key, event.shiftKey);
                  if (!action) return;
                  event.preventDefault();
                  switch (action) {
                    case "next":
                    case "previous":
                    case "first":
                    case "last":
                      focusRovingItem(railButtons(), element, action);
                      return;
                    case "activate":
                      selectWorkspace(workspace);
                      openFromKeyboard(id, element);
                      return;
                    case "expand":
                      openFromKeyboard(id, element);
                      return;
                    case "collapse":
                      if (expanded) close();
                      return;
                    case "context-menu": {
                      const { x, y } = keyboardContextMenuPoint(element);
                      close();
                      onWorkspaceContextMenu?.(workspace, x, y);
                    }
                  }
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  close();
                  onWorkspaceContextMenu?.(
                    workspace,
                    event.clientX,
                    event.clientY,
                  );
                }}
              >
                <span className="workspace-rail-initials" aria-hidden="true">
                  {item.initials}
                </span>
                {item.status ? (
                  <span
                    className={`workspace-rail-dot workspace-rail-item-dot is-${item.status}`}
                    aria-hidden="true"
                  />
                ) : null}
                {item.pinned ? (
                  <Pin
                    className="workspace-rail-pin"
                    size={9}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      {levels.map((level, depth) => {
        const head = level.entries[0];
        return (
          <RailFlyoutMenu
            key={`${depth}:${level.id}`}
            level={level}
            depth={depth}
            label={
              head && head.kind !== "agent"
                ? workspaceDisplayName(head.workspace)
                : level.id
            }
            tabs={tabs}
            expandedId={levels[depth + 1]?.id ?? null}
            onEntryHover={onEntryHover}
            onChoose={onChoose}
            onExpand={(entry, entryDepth, element) => {
              clearTimer();
              pendingFocusDepth.current = entryDepth + 1;
              openSubmenu(entryDepth, entry.workspace.workspace_id, element);
            }}
            onCollapse={collapseLevel}
            onTab={closeToRail}
            onPointerDown={(type) => {
              pointerType.current = type;
            }}
            onPointerEnter={clearTimer}
            onPointerLeave={scheduleClose}
            onWorkspaceContextMenu={(workspace, x, y) => {
              closeToRail();
              onWorkspaceContextMenu?.(workspace, x, y);
            }}
            onAgentContextMenu={(pane, x, y) => {
              closeToRail();
              onAgentContextMenu?.(pane, x, y);
            }}
          />
        );
      })}
    </>
  );
}
