import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  type NewReviewAnnotation,
  type ReviewAnnotation,
} from "../annotations";
import type { GitDiffEntry } from "../types";
import {
  closeResourceFileTab,
  resourceOwnerKey,
  resourceStateKey,
  type ResourceFileTabs,
  type ResourceScope,
} from "../workspaceResource";
import { FileExplorerPanel } from "./FileExplorerDialog";
import {
  type ActiveFilePreviewSelection,
  FilePreviewContent,
} from "./FilePreviewContent";
import { FilePreviewTabs } from "./FilePreviewTabs";
import { InspectorSplitResizer } from "./InspectorSplitResizer";

export type FileTabsStore = {
  read: () => ResourceFileTabs;
  write: (tabs: ResourceFileTabs) => void;
};

export type WorkspaceFilesSplit = {
  ratio: number;
  resetRatio: number;
  onChange: (ratio: number) => void;
  onCommit: (ratio: number) => void;
};

export type WorkspaceFilesViewProps = {
  workspaceId: string;
  scope: ResourceScope;
  // Must keep its identity while the scope is unchanged: tabs are re-read
  // whenever it changes.
  tabsStore: FileTabsStore;
  compact: boolean;
  initialDirectory?: string;
  split?: WorkspaceFilesSplit;
  drillIn: boolean;
  onDrillInChange: (drillIn: boolean) => void;
  fileSelection: ActiveFilePreviewSelection;
  onSelectFileTab: (path: string) => void;
  previewRequestRef: React.MutableRefObject<number>;
  onFileSelectionChange: Parameters<
    typeof FileExplorerPanel
  >[0]["onPreviewChange"];
  onOpenDocument: (path: string, fragment?: string) => void;
  onRefreshFile: () => void;
  annotations: readonly ReviewAnnotation[];
  onCreateAnnotation: (input: NewReviewAnnotation) => void;
  onReanchorAnnotations: (path: string, text: string) => void;
  onOpenFileChanges?: (entries: GitDiffEntry[]) => void;
  onEmptyFocusFallback?: () => void;
  onClose: () => void;
};

export function WorkspaceFilesView({
  workspaceId,
  scope,
  tabsStore,
  compact,
  initialDirectory,
  split,
  drillIn,
  onDrillInChange,
  fileSelection,
  onSelectFileTab,
  previewRequestRef,
  onFileSelectionChange,
  onOpenDocument,
  onRefreshFile,
  annotations,
  onCreateAnnotation,
  onReanchorAnnotations,
  onOpenFileChanges,
  onEmptyFocusFallback,
  onClose,
}: WorkspaceFilesViewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const splitId = useId();
  const navigationId = `${splitId}-files-navigation`;
  const detailId = `${splitId}-files-detail`;
  const [fileTabs, setFileTabs] = useState(() => tabsStore.read());
  useLayoutEffect(() => {
    setFileTabs(tabsStore.read());
  }, [fileSelection.entry?.path, tabsStore]);
  // Restore the active file on mount, without requiring another explorer
  // selection.
  useEffect(() => {
    if (!fileSelection.entry && fileTabs.activePath)
      onSelectFileTab(fileTabs.activePath);
  }, [fileSelection.entry, fileTabs.activePath, onSelectFileTab]);
  const onCloseFileTab = (path: string, directory = false) => {
    const current = tabsStore.read();
    const tabs = closeResourceFileTab(current, path, directory);
    tabsStore.write(tabs);
    setFileTabs(tabs);
    if (current.activePath === tabs.activePath) return;
    previewRequestRef.current += 1;
    if (tabs.activePath) onSelectFileTab(tabs.activePath);
    else
      onFileSelectionChange?.({
        entry: null,
        preview: null,
        loading: false,
        error: null,
      });
  };
  const onPinFileTab = (path: string) => {
    const current = tabsStore.read();
    if (current.previewPath !== path) return;
    const tabs = { ...current, previewPath: null };
    tabsStore.write(tabs);
    setFileTabs(tabs);
  };

  const resourceKey = resourceOwnerKey(scope);
  const contentResourceKey = resourceStateKey(scope);
  const [fileDiffState, setFileDiffState] = useState<{
    resourceKey: string;
    entries: GitDiffEntry[];
  }>(() => ({ resourceKey: "", entries: [] }));
  const fileDiffEntries =
    fileDiffState.resourceKey === contentResourceKey
      ? fileDiffState.entries
      : [];
  const setFileDiffEntries = useCallback(
    (entries: GitDiffEntry[]) =>
      setFileDiffState({ resourceKey: contentResourceKey, entries }),
    [contentResourceKey],
  );
  const hasDetail = !!fileSelection.entry && drillIn;
  const fileChangesEntries = fileSelection.entry
    ? fileDiffEntries.filter(
        (entry) => entry.path === fileSelection.entry?.path,
      )
    : [];

  useEffect(() => {
    if (initialDirectory !== undefined) {
      // Explicit directory navigation returns compact layouts to the tree,
      // while the saved preview and tabs remain available on desktop.
      if (!fileSelection.entry) onDrillInChange(false);
      return;
    }
    if (fileSelection.entry) onDrillInChange(true);
  }, [fileSelection.entry, initialDirectory, onDrillInChange]);

  return (
    <div
      ref={rootRef}
      className={`workspace-inspector-resource inspector-files-resource ${
        split ? "has-split-resizer" : ""
      }`}
      style={
        split
          ? ({
              "--workspace-inspector-navigation-width": `${split.ratio * 100}%`,
            } as CSSProperties)
          : undefined
      }
    >
      <div id={navigationId} className="workspace-inspector-navigation">
        <FileExplorerPanel
          open
          workspaceId={workspaceId}
          resourceKey={resourceKey}
          initialDirectory={initialDirectory}
          activePath={fileSelection.entry?.path}
          previewRequestRef={previewRequestRef}
          keyboardActive={!compact || !hasDetail}
          onClose={onClose}
          onPreviewChange={(selection, meta) => {
            if (meta?.deletedEntry) {
              onCloseFileTab(
                meta.deletedEntry.path,
                meta.deletedEntry.type === "directory",
              );
              return;
            }
            if (selection.entry && meta?.userInitiated) onDrillInChange(true);
            onFileSelectionChange?.(selection, meta);
          }}
          onPinFileTab={onPinFileTab}
          onActiveDiffEntriesChange={setFileDiffEntries}
        />
      </div>
      {split ? (
        <InspectorSplitResizer
          ratio={split.ratio}
          resetRatio={split.resetRatio}
          navigationId={navigationId}
          detailId={detailId}
          onChange={split.onChange}
          onCommit={split.onCommit}
        />
      ) : null}
      <div
        id={detailId}
        className="workspace-inspector-detail workspace-inspector-file-detail"
        role="tabpanel"
        aria-label={fileTabs.activePath ?? "File preview"}
        tabIndex={-1}
      >
        <FilePreviewTabs
          tabs={fileTabs}
          panelId={detailId}
          onSelect={(path) => {
            onDrillInChange(true);
            onSelectFileTab(path);
          }}
          onPin={onPinFileTab}
          onClose={onCloseFileTab}
          onEmptyFocus={() => {
            const treeItem = rootRef.current?.querySelector<HTMLElement>(
              ".file-row[role='treeitem'][tabindex='0']",
            );
            if (treeItem) treeItem.focus();
            else onEmptyFocusFallback?.();
          }}
        />
        <FilePreviewContent
          entry={fileSelection.entry}
          preview={fileSelection.preview}
          loading={fileSelection.loading}
          error={fileSelection.error}
          fragment={fileSelection.fragment}
          line={fileSelection.line}
          snippet={fileSelection.snippet}
          onOpenFile={onOpenDocument}
          onRefresh={onRefreshFile}
          backAction={
            compact && drillIn && fileSelection.entry
              ? {
                  label: "Files",
                  onClick: () => onDrillInChange(false),
                }
              : undefined
          }
          annotations={annotations}
          onCreateAnnotation={onCreateAnnotation}
          onReanchorAnnotations={onReanchorAnnotations}
          onOpenChanges={
            fileChangesEntries.length && onOpenFileChanges
              ? () => onOpenFileChanges(fileChangesEntries)
              : undefined
          }
        />
      </div>
    </div>
  );
}
