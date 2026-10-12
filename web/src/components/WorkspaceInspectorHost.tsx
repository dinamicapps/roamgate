import {
  FileDiff,
  GitFork,
  GitGraph,
  History,
  Maximize2,
  Minimize2,
  PanelBottom,
  PanelRight,
  X,
} from "lucide-react";
import {
  Suspense,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { ConnectionClient } from "../api";
import { connectionClientScopeKey } from "../useConnectionClient";
import { roamgateLocalStorage, subscribeLocalStorage } from "../browserStorage";
import {
  type NewReviewAnnotation,
  type ReviewAnnotation,
} from "../annotations";
import { lazyWithReload } from "../lazyWithReload";
import { shortcutTitle, useShortcutPreferences } from "../shortcutPreferences";
import type { GitDiffEntry, Pane, Workspace } from "../types";
import {
  DEFAULT_INSPECTOR_NAVIGATION_RATIO,
  inspectorNavigationRatioAtPosition,
  preferencesStorageKey,
  readInspectorPreferences,
  resourceOwnerKey,
  resourceStateKey,
  writeInspectorNavigationRatio,
  type InspectorDock,
  type InspectorView,
  type WorkspaceInspectorState,
} from "../workspaceResource";
import { AgentHistoryDrawer } from "./AgentHistoryDrawer";
import { paneHasAgentHistory } from "./agentSession";
import {
  type ActiveDiffSelection,
  DiffViewerPanel,
  type DiffViewerPanelHandle,
  type DiffViewerPanelProps,
} from "./DiffViewerPanel";
import {
  INSPECTOR_RESOURCE_HORIZONTAL_PADDING,
  InspectorSplitResizer,
} from "./InspectorSplitResizer";
import { workspaceInspectorLayout } from "./workspaceInspectorLayout";
import { PullRequestCard } from "./PullRequestCard";
import "./WorkspaceInspectorHost.css";

const DiffContentView = lazyWithReload("diff-content-view", () =>
  import("./DiffContentView").then((module) => ({
    default: module.DiffContentView,
  })),
);
const GitCommitHistory = lazyWithReload("git-commit-history", () =>
  import("./GitCommitHistory").then((module) => ({
    default: module.GitCommitHistory,
  })),
);

function changedCount(workspace?: Workspace) {
  const status = workspace?.worktree?.git_status;
  return status
    ? status.staged + status.unstaged + status.untracked + status.conflicted
    : 0;
}

/** Working-tree entries to select in Changes once its panel is mounted. */
export interface InspectorChangesRequest {
  id: number;
  entries: GitDiffEntry[];
}

function checkoutLabel(workspace?: Workspace) {
  if (!workspace) return "Unavailable checkout";
  return (
    workspace.worktree?.git_status?.branch ||
    workspace.worktree?.repo_name ||
    workspace.label ||
    workspace.workspace_id
  );
}

export function WorkspaceInspectorHost({
  state,
  onReady,
  visible,
  workspace,
  historyPane,
  diffSelection,
  changesRequest,
  onChangesRequestHandled,
  connectionClient,
  onDiffSelectionChange,
  onOpenDiffFile,
  annotations,
  onCreateAnnotation,
  onReanchorDiffAnnotations,
  onEditAnnotation,
  onViewChange,
  onDockChange,
  onExpandedChange,
  onClose,
  onBack,
}: {
  state: WorkspaceInspectorState;
  onReady?: () => void;
  visible: boolean;
  workspace?: Workspace;
  historyPane?: Pane;
  diffSelection: ActiveDiffSelection;
  changesRequest?: InspectorChangesRequest | null;
  onChangesRequestHandled?: (id: number) => void;
  connectionClient: ConnectionClient;
  onDiffSelectionChange: DiffViewerPanelProps["onSelectionChange"];
  onOpenDiffFile: (entry: ActiveDiffSelection["entry"]) => void;
  annotations: readonly ReviewAnnotation[];
  onCreateAnnotation: (input: NewReviewAnnotation) => void;
  onReanchorDiffAnnotations: (
    path: string,
    kind: GitDiffEntry["kind"],
    patch: string,
  ) => void;
  onEditAnnotation: (id: string) => void;
  onViewChange: (view: InspectorView) => void;
  onDockChange: (dock: InspectorDock) => void;
  onExpandedChange: (expanded: boolean) => void;
  onClose: () => void;
  onBack: () => void;
}) {
  const hostRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    onReady?.();
  }, [onReady]);
  const changesTabRef = useRef<HTMLButtonElement | null>(null);
  const commitsTabRef = useRef<HTMLButtonElement | null>(null);
  const historyTabRef = useRef<HTMLButtonElement | null>(null);
  const diffViewerRef = useRef<DiffViewerPanelHandle | null>(null);
  const splitId = useId();
  const [hostWidth, setHostWidth] = useState(0);
  const [changesDrillIn, setChangesDrillIn] = useState(false);
  const resourceKey = resourceOwnerKey(state.scope);
  const contentResourceKey = resourceStateKey(state.scope);
  const [commitsVisitedKey, setCommitsVisitedKey] = useState("");
  useEffect(() => {
    if (state.view === "commits") setCommitsVisitedKey(contentResourceKey);
  }, [contentResourceKey, state.view]);
  const [navigationPreferences, setNavigationPreferences] = useState(() =>
    readInspectorPreferences(roamgateLocalStorage, state.scope),
  );
  useShortcutPreferences();
  const defaultNavigationRatio = state.expanded
    ? inspectorNavigationRatioAtPosition(
        300,
        hostWidth - INSPECTOR_RESOURCE_HORIZONTAL_PADDING,
      )
    : DEFAULT_INSPECTOR_NAVIGATION_RATIO;
  const changesNavigationRatio = state.expanded
    ? (navigationPreferences.expandedNavigationRatios.changes ??
      defaultNavigationRatio)
    : navigationPreferences.changesNavigationRatio;
  const { compact, splitEnabled } = workspaceInspectorLayout(hostWidth);
  // The navigation/detail split is draggable whenever both panes fit side by
  // side, not only in the expanded layout, so docked inspectors can resize
  // the Changes list too.
  const changesNavigationId = `${splitId}-changes-navigation`;
  const changesDetailId = `${splitId}-changes-detail`;

  const setChangesNavigationRatio = (ratio: number) => {
    setNavigationPreferences((current) =>
      state.expanded
        ? { ...current, expandedNavigationRatios: { changes: ratio } }
        : { ...current, changesNavigationRatio: ratio },
    );
  };
  const commitChangesNavigationRatio = (ratio: number) => {
    writeInspectorNavigationRatio(
      roamgateLocalStorage,
      state.scope,
      ratio,
      state.expanded,
    );
  };
  const changeCount = changedCount(workspace);
  const historyAvailable = paneHasAgentHistory(historyPane);
  const hasDetail =
    state.view === "changes" && !!diffSelection.entry && changesDrillIn;

  useEffect(() => {
    if (!changesRequest) return;
    diffViewerRef.current?.selectWorkingEntries(changesRequest.entries);
    onChangesRequestHandled?.(changesRequest.id);
    // Only a new request id triggers; the handler identity is irrelevant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changesRequest?.id]);

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    const views: InspectorView[] = historyAvailable
      ? ["changes", "commits", "history"]
      : ["changes", "commits"];
    const currentIndex = Math.max(0, views.indexOf(state.view));
    const nextView: InspectorView | undefined =
      event.key === "Home"
        ? views[0]
        : event.key === "End"
          ? views[views.length - 1]
          : event.key === "ArrowLeft"
            ? views[(currentIndex - 1 + views.length) % views.length]
            : event.key === "ArrowRight"
              ? views[(currentIndex + 1) % views.length]
              : undefined;
    if (!nextView) return;
    event.preventDefault();
    onViewChange(nextView);
    const refs = {
      changes: changesTabRef,
      commits: commitsTabRef,
      history: historyTabRef,
    };
    refs[nextView].current?.focus();
  };

  useEffect(() => {
    const refresh = () =>
      setNavigationPreferences(
        readInspectorPreferences(roamgateLocalStorage, state.scope),
      );
    refresh();
    return subscribeLocalStorage((key) => {
      if (key === null || key === preferencesStorageKey(state.scope)) refresh();
    });
  }, [contentResourceKey, state.scope]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const update = () => setHostWidth(host.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <aside
      ref={hostRef}
      className={`workspace-inspector workspace-inspector-${state.dock} ${
        state.expanded ? "is-expanded" : ""
      } ${compact ? "is-compact" : ""} ${hasDetail ? "has-detail" : ""}`}
      aria-label="Workspace Inspector"
      data-view={state.view}
    >
      <header className="workspace-inspector-head">
        <div className="workspace-inspector-identity">
          <span className="workspace-inspector-repo">
            {workspace?.worktree?.repo_name || workspace?.label || "Workspace"}
          </span>
          <span className="workspace-inspector-checkout">
            {checkoutLabel(workspace)}
            {workspace?.worktree?.is_linked_worktree ? (
              <span className="workspace-inspector-wt" title="Linked worktree">
                <GitFork size={11} aria-hidden="true" /> Worktree
              </span>
            ) : null}
          </span>
          {workspace?.worktree?.checkout_path || workspace?.cwd ? (
            <code
              className="workspace-inspector-path"
              title={workspace.worktree?.checkout_path ?? workspace.cwd}
            >
              {workspace.worktree?.checkout_path ?? workspace.cwd}
            </code>
          ) : null}
        </div>
        <div className="workspace-inspector-tabs" role="tablist">
          <button
            ref={changesTabRef}
            type="button"
            role="tab"
            aria-selected={state.view === "changes"}
            tabIndex={state.view === "changes" ? 0 : -1}
            className={state.view === "changes" ? "is-active" : ""}
            onClick={() => onViewChange("changes")}
            onKeyDown={handleTabKeyDown}
          >
            <FileDiff size={14} /> Changes
            {changeCount > 0 ? (
              <span className="workspace-inspector-count">{changeCount}</span>
            ) : null}
          </button>
          <button
            ref={commitsTabRef}
            type="button"
            role="tab"
            aria-selected={state.view === "commits"}
            tabIndex={state.view === "commits" ? 0 : -1}
            className={state.view === "commits" ? "is-active" : ""}
            onClick={() => onViewChange("commits")}
            onKeyDown={handleTabKeyDown}
          >
            <GitGraph size={14} /> Commits
          </button>
          <button
            ref={historyTabRef}
            type="button"
            role="tab"
            aria-selected={state.view === "history"}
            tabIndex={state.view === "history" ? 0 : -1}
            className={state.view === "history" ? "is-active" : ""}
            title={
              historyAvailable
                ? "Agent history"
                : "Select an active agent pane to view history"
            }
            disabled={!historyAvailable && state.view !== "history"}
            onClick={() => {
              if (historyAvailable) onViewChange("history");
            }}
            onKeyDown={handleTabKeyDown}
          >
            <History size={14} /> History
          </button>
        </div>
        <div className="workspace-inspector-actions">
          <button
            type="button"
            className="workspace-inspector-dock-action"
            title={state.dock === "right" ? "Dock at bottom" : "Dock at right"}
            aria-label={
              state.dock === "right"
                ? "Dock Inspector at bottom"
                : "Dock Inspector at right"
            }
            onClick={() =>
              onDockChange(state.dock === "right" ? "bottom" : "right")
            }
          >
            {state.dock === "right" ? (
              <PanelBottom size={15} />
            ) : (
              <PanelRight size={15} />
            )}
          </button>
          <button
            type="button"
            className="workspace-inspector-expand-action"
            title={shortcutTitle(
              state.expanded ? "Restore Inspector dock" : "Expand Inspector",
              "inspector.expand",
            )}
            aria-label={
              state.expanded ? "Restore Inspector dock" : "Expand Inspector"
            }
            aria-pressed={state.expanded}
            onClick={() => onExpandedChange(!state.expanded)}
          >
            {state.expanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          <button
            type="button"
            title="Close Inspector"
            aria-label="Close Workspace Inspector"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {visible && state.open && workspace ? (
        <PullRequestCard
          key={connectionClientScopeKey(
            connectionClient,
            connectionClient.serverRuntimeGeneration,
            contentResourceKey,
            workspace.workspace_id,
            workspace.worktree?.checkout_path,
            workspace.cwd,
            workspace.worktree?.git_status?.branch,
          )}
          client={connectionClient}
          workspaceId={workspace.workspace_id}
          branch={workspace.worktree?.git_status?.branch}
        />
      ) : null}

      {!workspace ? (
        <div className="workspace-inspector-unavailable">
          <strong>Checkout unavailable</strong>
          <span>
            The workspace used to route this Inspector is no longer open.
          </span>
        </div>
      ) : (
        <div className="workspace-inspector-body">
          <div
            className={`workspace-inspector-resource inspector-changes-resource ${
              state.view === "changes" ? "" : "is-hidden"
            } ${splitEnabled ? "has-split-resizer" : ""}`}
            style={
              splitEnabled
                ? ({
                    "--workspace-inspector-navigation-width": `${changesNavigationRatio * 100}%`,
                  } as CSSProperties)
                : undefined
            }
          >
            <div
              id={changesNavigationId}
              className="workspace-inspector-navigation"
            >
              <DiffViewerPanel
                ref={diffViewerRef}
                workspaceId={workspace.workspace_id}
                resourceKey={resourceKey}
                onOpenFile={onOpenDiffFile}
                onSelectionChange={(selection, meta) => {
                  if (selection.entry && meta?.userInitiated)
                    setChangesDrillIn(true);
                  onDiffSelectionChange?.(selection, meta);
                }}
              />
            </div>
            {splitEnabled ? (
              <InspectorSplitResizer
                ratio={changesNavigationRatio}
                resetRatio={defaultNavigationRatio}
                navigationId={changesNavigationId}
                detailId={changesDetailId}
                onChange={setChangesNavigationRatio}
                onCommit={commitChangesNavigationRatio}
              />
            ) : null}
            <div id={changesDetailId} className="workspace-inspector-detail">
              {state.view === "changes" ? (
                <Suspense
                  fallback={
                    <div className="diff-content-view">
                      <div className="diff-content-state">
                        <span className="file-loading-spinner" />
                        Loading Diff Viewer
                      </div>
                    </div>
                  }
                >
                  <DiffContentView
                    key={contentResourceKey}
                    selectionRevision={diffSelection.selectionRevision}
                    entry={diffSelection.entry}
                    file={diffSelection.file}
                    loading={diffSelection.loading}
                    error={diffSelection.error}
                    entries={diffSelection.entries}
                    files={diffSelection.files}
                    fileErrors={diffSelection.fileErrors}
                    loadingKeys={diffSelection.loadingKeys}
                    summaryLoading={diffSelection.summaryLoading}
                    mobile={compact}
                    resourceKey={contentResourceKey}
                    connectionClient={connectionClient}
                    annotations={annotations}
                    onCreateAnnotation={onCreateAnnotation}
                    onReanchorAnnotations={onReanchorDiffAnnotations}
                    onEditAnnotation={onEditAnnotation}
                    onSelectFile={(target) =>
                      diffViewerRef.current?.selectEntry(target)
                    }
                    onNearbyFilesChange={(targets) =>
                      diffViewerRef.current?.loadNearbyEntries(targets)
                    }
                    onVisibleFileChange={(target) =>
                      diffViewerRef.current?.highlightEntry(target)
                    }
                    onOpenFile={onOpenDiffFile}
                    backAction={
                      compact && hasDetail
                        ? {
                            label: "Changed files",
                            onClick: () => {
                              setChangesDrillIn(false);
                              onBack();
                            },
                          }
                        : undefined
                    }
                  />
                </Suspense>
              ) : null}
            </div>
          </div>
          <div
            className={`workspace-inspector-resource inspector-commits-resource ${state.view === "commits" ? "" : "is-hidden"}`}
          >
            {state.view === "commits" ||
            commitsVisitedKey === contentResourceKey ? (
              <Suspense
                fallback={
                  <div className="workspace-inspector-unavailable">
                    Loading commits
                  </div>
                }
              >
                <GitCommitHistory
                  key={connectionClientScopeKey(
                    connectionClient,
                    connectionClient.serverRuntimeGeneration,
                    contentResourceKey,
                    workspace.workspace_id,
                    workspace.worktree?.checkout_path,
                    workspace.cwd,
                    workspace.worktree?.git_status?.branch,
                  )}
                  client={connectionClient}
                  workspaceId={workspace.workspace_id}
                  resourceKey={contentResourceKey}
                  compact={compact}
                  active={visible && state.open && state.view === "commits"}
                />
              </Suspense>
            ) : null}
          </div>
          <div
            className={`workspace-inspector-resource inspector-history-resource ${
              state.view === "history" ? "" : "is-hidden"
            }`}
          >
            {historyAvailable && historyPane ? (
              <AgentHistoryDrawer
                pane={historyPane}
                open={visible && state.open && state.view === "history"}
                embedded
                wide={!compact}
                onOpenChange={(open) => {
                  if (!open) onClose();
                }}
              />
            ) : (
              <div className="workspace-inspector-unavailable">
                <strong>No active agent session</strong>
                <span>Select an agent pane to inspect its history.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
