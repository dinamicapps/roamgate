import {
  FileDiff,
  FolderTree,
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
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
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
  readResourceFileTabs,
  writeResourceFileTabs,
  type InspectorDock,
  type InspectorSplitView,
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
import type { FileExplorerPanel } from "./FileExplorerDialog";
import type { ActiveFilePreviewSelection } from "./FilePreviewContent";
import {
  INSPECTOR_RESOURCE_HORIZONTAL_PADDING,
  InspectorSplitResizer,
} from "./InspectorSplitResizer";
import { type FileTabsStore, WorkspaceFilesView } from "./WorkspaceFilesView";
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
  fileSelection,
  onSelectFileTab,
  previewRequestRef,
  diffSelection,
  connectionClient,
  onFileSelectionChange,
  onDiffSelectionChange,
  onOpenDiffFile,
  annotations,
  onCreateAnnotation,
  onReanchorFileAnnotations,
  onReanchorDiffAnnotations,
  onEditAnnotation,
  onOpenDocument,
  onRefreshFile,
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
  fileSelection: ActiveFilePreviewSelection;
  onSelectFileTab: (path: string) => void;
  previewRequestRef: React.MutableRefObject<number>;
  diffSelection: ActiveDiffSelection;
  connectionClient: ConnectionClient;
  onFileSelectionChange: Parameters<
    typeof FileExplorerPanel
  >[0]["onPreviewChange"];
  onDiffSelectionChange: DiffViewerPanelProps["onSelectionChange"];
  onOpenDocument: (path: string, fragment?: string) => void;
  onRefreshFile: () => void;
  onOpenDiffFile: (entry: ActiveDiffSelection["entry"]) => void;
  annotations: readonly ReviewAnnotation[];
  onCreateAnnotation: (input: NewReviewAnnotation) => void;
  onReanchorFileAnnotations: (path: string, text: string) => void;
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
  const fileTabsStore = useMemo<FileTabsStore>(
    () => ({
      read: () => readResourceFileTabs(roamgateLocalStorage, state.scope),
      write: (tabs) =>
        writeResourceFileTabs(roamgateLocalStorage, state.scope, tabs),
    }),
    [state.scope],
  );

  useLayoutEffect(() => {
    onReady?.();
  }, [onReady]);
  const filesTabRef = useRef<HTMLButtonElement | null>(null);
  const changesTabRef = useRef<HTMLButtonElement | null>(null);
  const commitsTabRef = useRef<HTMLButtonElement | null>(null);
  const historyTabRef = useRef<HTMLButtonElement | null>(null);
  const diffViewerRef = useRef<DiffViewerPanelHandle | null>(null);
  const splitId = useId();
  const [hostWidth, setHostWidth] = useState(0);
  const [drillInByView, setDrillInByView] = useState<
    Record<InspectorView, boolean>
  >(() => ({
    files:
      state.view === "files" &&
      state.initialDirectory === undefined &&
      !!fileSelection.entry,
    changes: false,
    commits: false,
    history: false,
  }));
  const setFilesDrillIn = useCallback(
    (files: boolean) => setDrillInByView((current) => ({ ...current, files })),
    [],
  );
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
  const navigationRatios = {
    files: state.expanded
      ? (navigationPreferences.expandedNavigationRatios.files ??
        defaultNavigationRatio)
      : navigationPreferences.filesNavigationRatio,
    changes: state.expanded
      ? (navigationPreferences.expandedNavigationRatios.changes ??
        defaultNavigationRatio)
      : navigationPreferences.changesNavigationRatio,
  };
  const { compact, splitEnabled } = workspaceInspectorLayout(hostWidth);
  // The navigation/detail split is draggable whenever both panes fit side by
  // side, not only in the expanded layout, so docked inspectors can resize
  // the Files/Changes list too.
  const navigationIds = {
    changes: `${splitId}-changes-navigation`,
  };
  const detailIds = {
    changes: `${splitId}-changes-detail`,
  };

  const setNavigationRatio = (view: InspectorSplitView, ratio: number) => {
    setNavigationPreferences((current) =>
      state.expanded
        ? {
            ...current,
            expandedNavigationRatios: {
              ...current.expandedNavigationRatios,
              [view]: ratio,
            },
          }
        : {
            ...current,
            [view === "files"
              ? "filesNavigationRatio"
              : "changesNavigationRatio"]: ratio,
          },
    );
  };
  const commitNavigationRatio = (view: InspectorSplitView, ratio: number) => {
    writeInspectorNavigationRatio(
      roamgateLocalStorage,
      state.scope,
      view,
      ratio,
      state.expanded,
    );
  };
  const splitStyle = (view: InspectorSplitView) =>
    ({
      "--workspace-inspector-navigation-width": `${navigationRatios[view] * 100}%`,
    }) as CSSProperties;
  const changeCount = changedCount(workspace);
  const historyAvailable = paneHasAgentHistory(historyPane);
  const detailAvailable =
    state.view === "files"
      ? !!fileSelection.entry
      : state.view === "changes"
        ? !!diffSelection.entry
        : false;
  const hasDetail = detailAvailable && drillInByView[state.view];

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" && state.view === "files") {
      const treeItem = hostRef.current?.querySelector<HTMLElement>(
        ".inspector-files-resource .file-row[role='treeitem'][tabindex='0']",
      );
      if (treeItem) {
        event.preventDefault();
        treeItem.focus({ preventScroll: true });
        treeItem.scrollIntoView({ block: "nearest" });
      }
      return;
    }
    const views: InspectorView[] = historyAvailable
      ? ["files", "changes", "commits", "history"]
      : ["files", "changes", "commits"];
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
      files: filesTabRef,
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
            ref={filesTabRef}
            type="button"
            role="tab"
            aria-selected={state.view === "files"}
            tabIndex={state.view === "files" ? 0 : -1}
            className={state.view === "files" ? "is-active" : ""}
            onClick={() => onViewChange("files")}
            onKeyDown={handleTabKeyDown}
          >
            <FolderTree size={14} /> Files
          </button>
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
          <WorkspaceFilesView
            workspaceId={workspace.workspace_id}
            scope={state.scope}
            tabsStore={fileTabsStore}
            active={state.view === "files"}
            compact={compact}
            initialDirectory={state.initialDirectory}
            split={
              splitEnabled
                ? {
                    ratio: navigationRatios.files,
                    resetRatio: defaultNavigationRatio,
                    onChange: (ratio) => setNavigationRatio("files", ratio),
                    onCommit: (ratio) => commitNavigationRatio("files", ratio),
                  }
                : undefined
            }
            drillIn={drillInByView.files}
            onDrillInChange={setFilesDrillIn}
            fileSelection={fileSelection}
            onSelectFileTab={onSelectFileTab}
            previewRequestRef={previewRequestRef}
            onFileSelectionChange={onFileSelectionChange}
            onOpenDocument={onOpenDocument}
            onRefreshFile={onRefreshFile}
            annotations={annotations}
            onCreateAnnotation={onCreateAnnotation}
            onReanchorAnnotations={onReanchorFileAnnotations}
            onOpenFileChanges={(entries) =>
              diffViewerRef.current?.selectWorkingEntries(entries)
            }
            renderFileChanges={({ entries, changesKey }) => {
              const fileDiffSelectionMatches = entries.some(
                (entry) =>
                  diffSelection.entry?.path === entry.path &&
                  diffSelection.entry.kind === entry.kind,
              );
              return (
                <Suspense
                  fallback={
                    <div className="diff-content-state">
                      <span className="file-loading-spinner" />
                      Loading diff viewer
                    </div>
                  }
                >
                  <DiffContentView
                    key={`${contentResourceKey}:file-changes`}
                    entry={
                      fileDiffSelectionMatches
                        ? diffSelection.entry
                        : entries[entries.length - 1]
                    }
                    file={fileDiffSelectionMatches ? diffSelection.file : null}
                    loading={!fileDiffSelectionMatches || diffSelection.loading}
                    error={
                      fileDiffSelectionMatches ? diffSelection.error : null
                    }
                    entries={entries}
                    files={fileDiffSelectionMatches ? diffSelection.files : {}}
                    fileErrors={
                      fileDiffSelectionMatches ? diffSelection.fileErrors : {}
                    }
                    resourceKey={`${contentResourceKey}:file:${changesKey}`}
                    mobile={compact}
                    connectionClient={connectionClient}
                    annotations={annotations}
                    onCreateAnnotation={onCreateAnnotation}
                    onReanchorAnnotations={onReanchorDiffAnnotations}
                    onEditAnnotation={onEditAnnotation}
                    onSelectFile={(entry) =>
                      diffViewerRef.current?.selectWorkingEntry(entry)
                    }
                    embedded
                  />
                </Suspense>
              );
            }}
            onEmptyFocusFallback={() => filesTabRef.current?.focus()}
            onClose={onClose}
            onBack={onBack}
          />
          <div
            className={`workspace-inspector-resource inspector-changes-resource ${
              state.view === "changes" ? "" : "is-hidden"
            } ${splitEnabled ? "has-split-resizer" : ""}`}
            style={splitEnabled ? splitStyle("changes") : undefined}
          >
            <div
              id={navigationIds.changes}
              className="workspace-inspector-navigation"
            >
              <DiffViewerPanel
                ref={diffViewerRef}
                workspaceId={workspace.workspace_id}
                resourceKey={resourceKey}
                onOpenFile={onOpenDiffFile}
                onSelectionChange={(selection, meta) => {
                  if (selection.entry && meta?.userInitiated) {
                    setDrillInByView((current) => ({
                      ...current,
                      changes: true,
                    }));
                  }
                  onDiffSelectionChange?.(selection, meta);
                }}
              />
            </div>
            {splitEnabled ? (
              <InspectorSplitResizer
                ratio={navigationRatios.changes}
                resetRatio={defaultNavigationRatio}
                navigationId={navigationIds.changes}
                detailId={detailIds.changes}
                onChange={(ratio) => setNavigationRatio("changes", ratio)}
                onCommit={(ratio) => commitNavigationRatio("changes", ratio)}
              />
            ) : null}
            <div id={detailIds.changes} className="workspace-inspector-detail">
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
                              setDrillInByView((current) => ({
                                ...current,
                                changes: false,
                              }));
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
