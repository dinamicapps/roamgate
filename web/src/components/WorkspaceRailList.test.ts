import { expect, spyOn, test } from "bun:test";
import { Window } from "happy-dom";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { roamgateLocalStorage } from "../browserStorage";
import { connectionStorageKey } from "../connectionStorage";
import { __storeTesting, store } from "../store";
import type { Pane, Workspace } from "../types";
import { WORKSPACE_AGENT_LAYOUT_STORAGE_KEY } from "../workspaceAgentLayout";
import { WORKSPACE_PINS_STORAGE_KEY } from "../workspacePins";
import { buildRailItems } from "./workspaceRail";
import { WorkspaceRailList } from "./WorkspaceRailList";
import { WorkspaceTree } from "./WorkspaceTree";

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
  label: string,
  overrides: Partial<Workspace> = {},
): Workspace {
  return {
    workspace_id: id,
    number,
    label,
    focused: false,
    pane_count: 1,
    tab_count: 1,
    agent_status: "unknown",
    ...overrides,
  };
}

function pane(id: string, workspaceId: string, status: string): Pane {
  return {
    pane_id: id,
    terminal_id: `t-${id}`,
    workspace_id: workspaceId,
    tab_id: `tab-${id}`,
    focused: false,
    cwd: `/projects/${id}`,
    agent: "claude",
    agent_status: status,
    revision: 1,
  };
}

const workspaces = [
  workspace("w1", 1, "roam gate", { worktree: mainWorktree, focused: true }),
  workspace("w2", 2, "feature", {
    worktree: {
      ...mainWorktree,
      checkout_path: "/repo-feature",
      is_linked_worktree: true,
      parent_workspace_id: "w1",
    },
  }),
  workspace("w3", 3, "notes"),
];
const panes = [pane("p1", "w1", "idle"), pane("p2", "w2", "blocked")];

// Isolate browser globals and React's module graph from other Bun tests.
if (process.env.ROAMGATE_WORKSPACE_RAIL_DOM_TEST !== "1") {
  test("workspace rail in an isolated runtime", async () => {
    const child = Bun.spawn([process.execPath, "test", import.meta.path], {
      env: { ...process.env, ROAMGATE_WORKSPACE_RAIL_DOM_TEST: "1" },
      stdout: "pipe",
      stderr: "pipe",
    });
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    if (code !== 0) throw new Error(`${stdout}\n${stderr}`);
    expect(code).toBe(0);
  }, 15_000);
} else {
  const browser = new Window({ url: "http://localhost" });
  for (const [key, value] of Object.entries({
    window: browser,
    document: browser.document,
    navigator: browser.navigator,
    HTMLElement: browser.HTMLElement,
    Element: browser.Element,
    Node: browser.Node,
    localStorage: browser.localStorage,
    sessionStorage: browser.sessionStorage,
    IS_REACT_ACT_ENVIRONMENT: true,
  })) {
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }

  const pointer = (type: string, target: Element, pointerType = "mouse") =>
    act(async () => {
      target.dispatchEvent(
        new browser.PointerEvent(type, {
          bubbles: true,
          pointerType,
        }) as unknown as Event,
      );
    });
  const click = (target: Element | null) =>
    act(async () => {
      (target as HTMLElement | null)?.click();
    });
  const flyouts = () =>
    [...document.querySelectorAll("[data-rail-flyout]")] as Element[];
  const entryKeys = (menu: Element) =>
    [...menu.querySelectorAll('[role="menuitem"]')].map((item) =>
      item.getAttribute("data-rail-entry"),
    );

  async function mount(element: ReturnType<typeof createElement>) {
    const container = document.createElement("div");
    document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(element));
    return {
      container,
      async unmount() {
        await act(async () => root.unmount());
        container.remove();
      },
    };
  }

  test("tree rail renders top-level items and nests worktrees in flyouts", async () => {
    const previousState = store.get();
    const focusWorkspace = spyOn(store, "focusWorkspace").mockImplementation(
      () => Promise.resolve(),
    );
    const focusPane = spyOn(store, "focusPane").mockImplementation(() =>
      Promise.resolve(),
    );
    const selected: string[] = [];
    roamgateLocalStorage.setItem(
      WORKSPACE_AGENT_LAYOUT_STORAGE_KEY,
      "separate",
    );
    roamgateLocalStorage.setItem(
      connectionStorageKey("alpha", WORKSPACE_PINS_STORAGE_KEY),
      '["workspace:w3"]',
    );
    __storeTesting.replaceState({
      ...previousState,
      activeConnectionId: "alpha",
      workspaces,
      panes,
      tabs: [],
    });
    const view = await mount(
      createElement(WorkspaceTree, {
        rail: true,
        onRailChange() {},
        onSelect: (w: Workspace) => selected.push(w.workspace_id),
        onSelectAgent: (p: Pane) => selected.push(p.pane_id),
      }),
    );
    try {
      const items = [
        ...view.container.querySelectorAll(".workspace-rail-item"),
      ] as HTMLElement[];
      expect(items.map((item) => item.textContent)).toEqual(["NO", "RG"]);
      const [notes, roam] = items;
      expect(notes.querySelector(".workspace-rail-pin")).not.toBeNull();
      expect(notes.querySelector(".workspace-rail-dot")).toBeNull();
      expect(roam.querySelector(".workspace-rail-pin")).toBeNull();
      expect(
        roam
          .querySelector(".workspace-rail-dot")
          ?.classList.contains("is-blocked"),
      ).toBe(true);
      expect(roam.classList.contains("is-active")).toBe(true);
      expect(roam.getAttribute("aria-haspopup")).toBe("menu");
      expect(roam.getAttribute("aria-label")).toBe("roam gate, agents blocked");
      expect(roam.getAttribute("title")).toBe("roam gate\nrepo · /repo");

      await click(roam);
      expect(focusWorkspace).toHaveBeenCalledWith("w1");
      expect(selected).toEqual(["w1"]);
      expect(roam.getAttribute("aria-expanded")).toBe("true");
      // Separate layout still lists agents in the flyout.
      expect(flyouts().map(entryKeys)).toEqual([
        ["workspace:w1", "agent:p1", "worktree:w2"],
      ]);
      const worktree = flyouts()[0].querySelector(
        '[data-rail-entry="worktree:w2"]',
      ) as HTMLElement;
      expect(worktree.getAttribute("aria-haspopup")).toBe("menu");

      // Touch taps toggle the worktree sub-flyout instead of choosing it.
      await pointer("pointerdown", worktree, "touch");
      await click(worktree);
      expect(worktree.getAttribute("aria-expanded")).toBe("true");
      expect(flyouts().map(entryKeys)).toEqual([
        ["workspace:w1", "agent:p1", "worktree:w2"],
        ["workspace:w2", "agent:p2"],
      ]);

      await pointer("pointerdown", flyouts()[1], "mouse");
      await click(flyouts()[1].querySelector('[data-rail-entry="agent:p2"]'));
      expect(focusPane).toHaveBeenCalledWith("p2");
      expect(selected).toEqual(["w1", "p2"]);
      expect(flyouts()).toEqual([]);
      expect(
        roamgateLocalStorage.getItem(WORKSPACE_AGENT_LAYOUT_STORAGE_KEY),
      ).toBe("separate");

      // A pinned flyout closes on an outside pointer down and on Escape.
      await click(roam);
      expect(flyouts()).toHaveLength(1);
      await pointer("pointerdown", document.body);
      expect(flyouts()).toEqual([]);
      await click(roam);
      await act(async () => {
        browser.dispatchEvent(
          new browser.KeyboardEvent("keydown", { key: "Escape" }),
        );
      });
      expect(flyouts()).toEqual([]);
    } finally {
      await view.unmount();
      focusWorkspace.mockRestore();
      focusPane.mockRestore();
      __storeTesting.replaceState(previousState);
      roamgateLocalStorage.removeItem(WORKSPACE_AGENT_LAYOUT_STORAGE_KEY);
    }
  });

  test("hover opens flyouts after a delay and closes after leaving", async () => {
    const items = buildRailItems({
      workspaces,
      panes,
      pinnedWorkspaceKeys: new Set(),
      activePaneId: null,
    });
    const wait = () =>
      act(async () => {
        await Bun.sleep(30);
      });
    const view = await mount(
      createElement(WorkspaceRailList, {
        items,
        tabs: [],
        hoverOpenMs: 5,
        hoverCloseMs: 5,
      }),
    );
    try {
      const roam = view.container.querySelector(
        '[data-rail-item="w1"]',
      ) as HTMLElement;
      await pointer("pointerover", roam, "touch");
      await wait();
      expect(flyouts()).toEqual([]);
      await pointer("pointerover", roam);
      expect(flyouts()).toEqual([]);
      await wait();
      expect(flyouts()).toHaveLength(1);

      // Moving from the rail item into the flyout keeps it open.
      await pointer("pointerout", roam);
      const worktree = flyouts()[0].querySelector(
        '[data-rail-entry="worktree:w2"]',
      ) as HTMLElement;
      await pointer("pointerover", worktree);
      await wait();
      expect(flyouts().map(entryKeys)[1]).toEqual(["workspace:w2", "agent:p2"]);

      // Hovering a sibling entry closes the sub-flyout.
      await pointer(
        "pointerover",
        flyouts()[0].querySelector('[data-rail-entry="agent:p1"]') as Element,
      );
      await wait();
      expect(flyouts()).toHaveLength(1);

      await pointer("pointerout", flyouts()[0]);
      await wait();
      expect(flyouts()).toEqual([]);
    } finally {
      await view.unmount();
    }
  });

  test("keyboard navigates the rail and nested flyouts", async () => {
    const focusWorkspace = spyOn(store, "focusWorkspace").mockImplementation(
      () => Promise.resolve(),
    );
    const contextMenus: string[] = [];
    const items = buildRailItems({
      workspaces,
      panes,
      pinnedWorkspaceKeys: new Set(),
      activePaneId: null,
    });
    const key = (target: Element | null, keyName: string, shiftKey = false) =>
      act(async () => {
        target?.dispatchEvent(
          new browser.KeyboardEvent("keydown", {
            key: keyName,
            shiftKey,
            bubbles: true,
            cancelable: true,
          }) as unknown as Event,
        );
      });
    const focused = () =>
      (document.activeElement as HTMLElement | null)?.getAttribute(
        "data-rail-item",
      ) ??
      (document.activeElement as HTMLElement | null)?.getAttribute(
        "data-rail-entry",
      );
    const view = await mount(
      createElement(WorkspaceRailList, {
        items,
        tabs: [],
        hoverOpenMs: 5,
        hoverCloseMs: 5,
        onWorkspaceContextMenu: (w: Workspace) =>
          contextMenus.push(w.workspace_id),
        onAgentContextMenu: (p: Pane) => contextMenus.push(p.pane_id),
      }),
    );
    try {
      const rail = (id: string) =>
        view.container.querySelector(`[data-rail-item="${id}"]`) as HTMLElement;
      expect(rail("w1").tabIndex).toBe(0);
      expect(rail("w3").tabIndex).toBe(-1);

      rail("w1").focus();
      await key(rail("w1"), "ArrowDown");
      expect(focused()).toBe("w3");
      await key(rail("w3"), "Home");
      expect(focused()).toBe("w1");
      await key(rail("w1"), "End");
      expect(focused()).toBe("w3");
      await key(rail("w3"), "ArrowUp");
      expect(focused()).toBe("w1");

      // ArrowRight opens without focusing the workspace.
      await key(rail("w1"), "ArrowRight");
      expect(focusWorkspace).not.toHaveBeenCalled();
      expect(focused()).toBe("workspace:w1");
      await key(document.activeElement, "ArrowDown");
      expect(focused()).toBe("agent:p1");
      await key(document.activeElement, "End");
      expect(focused()).toBe("worktree:w2");
      await key(document.activeElement, "ArrowRight");
      expect(flyouts()).toHaveLength(2);
      expect(focused()).toBe("workspace:w2");
      await key(document.activeElement, "ArrowLeft");
      expect(flyouts()).toHaveLength(1);
      expect(focused()).toBe("worktree:w2");
      await key(document.activeElement, "ArrowRight");
      await key(document.activeElement, "Escape");
      expect(flyouts()).toHaveLength(1);
      expect(focused()).toBe("worktree:w2");
      await key(document.activeElement, "Escape");
      expect(flyouts()).toEqual([]);
      expect(focused()).toBe("w1");

      // Shift+F10 opens the context menu for rail items and flyout entries.
      await key(rail("w1"), "F10", true);
      expect(contextMenus).toEqual(["w1"]);
      await key(rail("w1"), "Enter");
      expect(focusWorkspace).toHaveBeenCalledWith("w1");
      expect(focused()).toBe("workspace:w1");
      await key(document.activeElement, "ArrowDown");
      await key(document.activeElement, "ContextMenu");
      expect(contextMenus).toEqual(["w1", "p1"]);
      expect(flyouts()).toEqual([]);
      expect(focused()).toBe("w1");
    } finally {
      await view.unmount();
      focusWorkspace.mockRestore();
    }
  });

  test("an open flyout follows the pointer to other rail items", async () => {
    const focusWorkspace = spyOn(store, "focusWorkspace").mockImplementation(
      () => Promise.resolve(),
    );
    const items = buildRailItems({
      workspaces,
      panes,
      pinnedWorkspaceKeys: new Set(),
      activePaneId: null,
    });
    const view = await mount(
      createElement(WorkspaceRailList, {
        items,
        tabs: [],
        hoverOpenMs: 1000,
        hoverCloseMs: 5,
      }),
    );
    try {
      const rail = (id: string) =>
        view.container.querySelector(`[data-rail-item="${id}"]`) as HTMLElement;
      await click(rail("w1"));
      expect(focusWorkspace).toHaveBeenCalledTimes(1);
      await pointer("pointerover", rail("w3"));
      expect(rail("w1").getAttribute("aria-expanded")).toBe("false");
      expect(rail("w3").getAttribute("aria-expanded")).toBe("true");
      expect(flyouts().map(entryKeys)).toEqual([["workspace:w3"]]);
      expect(focusWorkspace).toHaveBeenCalledTimes(1);

      // The switched flyout stays pinned after the pointer leaves.
      await pointer("pointerout", rail("w3"));
      await act(async () => {
        await Bun.sleep(30);
      });
      expect(flyouts()).toHaveLength(1);
    } finally {
      await view.unmount();
      focusWorkspace.mockRestore();
    }
  });
}
