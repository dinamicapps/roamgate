import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ConnectionClient } from "../api";
import type { NewReviewAnnotation, ReviewAnnotation } from "../annotations";
import { roamgateLocalStorage } from "../browserStorage";
import {
  readFilesTabFiles,
  writeFilesTabFiles,
  type FilesTabLink,
} from "../filesTabResource";
import type { FileExplorerEntry } from "../types";
import {
  DEFAULT_INSPECTOR_NAVIGATION_RATIO,
  openResourceFileTab,
  type ResourceScope,
} from "../workspaceResource";
import {
  emptyFilePreviewSelection,
  fileEntryForPath,
  loadFilePreviewSelection,
} from "./fileExplorerResources";
import type { ActiveFilePreviewSelection } from "./FilePreviewContent";
import { type FileTabsStore, WorkspaceFilesView } from "./WorkspaceFilesView";
import { workspaceInspectorLayout } from "./workspaceInspectorLayout";
import "./FilesTabSurface.css";

/**
 * A console's files tab: the Files block on the terminal surface. It is
 * mounted per link and unmounted while hidden, so file tabs, selection and
 * preview are rebuilt from the link's persisted state on every mount.
 */
export function FilesTabSurface({
  connectionClient,
  ownerTabId,
  ownerLabel,
  link,
  workspaceId,
  scope,
  annotations,
  onCreateAnnotation,
  onReanchorAnnotations,
  onNavigationRatioCommit,
  onShowConsole,
}: {
  connectionClient: ConnectionClient;
  ownerTabId: string;
  ownerLabel: string;
  link: FilesTabLink;
  workspaceId: string;
  scope: ResourceScope;
  annotations: readonly ReviewAnnotation[];
  onCreateAnnotation: (input: NewReviewAnnotation) => void;
  onReanchorAnnotations: (path: string, text: string) => void;
  onNavigationRatioCommit: (ratio: number) => void;
  onShowConsole: () => void;
}) {
  const rootRef = useRef<HTMLElement | null>(null);
  const previewRequestRef = useRef(0);
  const connectionId = connectionClient.connectionId;
  const tabsStore = useMemo<FileTabsStore>(
    () => ({
      read: () =>
        readFilesTabFiles(roamgateLocalStorage, connectionId, ownerTabId),
      write: (tabs) => {
        writeFilesTabFiles(
          roamgateLocalStorage,
          connectionId,
          ownerTabId,
          tabs,
        );
      },
    }),
    [connectionId, ownerTabId],
  );
  const [selection, setSelection] = useState<ActiveFilePreviewSelection>(
    emptyFilePreviewSelection,
  );
  const [drillIn, setDrillIn] = useState(false);
  const [navigationRatio, setNavigationRatio] = useState(link.navigationRatio);
  const [width, setWidth] = useState(0);
  const { compact, splitEnabled } = workspaceInspectorLayout(width);

  const applySelection = useCallback(
    (next: ActiveFilePreviewSelection) => {
      if (next.entry)
        tabsStore.write(openResourceFileTab(tabsStore.read(), next.entry.path));
      setSelection(next);
    },
    [tabsStore],
  );
  const loadPreview = useCallback(
    (entry: FileExplorerEntry, fragment?: string) =>
      loadFilePreviewSelection(
        connectionClient,
        workspaceId,
        entry,
        fragment,
        previewRequestRef,
        applySelection,
      ),
    [applySelection, connectionClient, workspaceId],
  );
  const selectFileTab = useCallback(
    (path: string) => loadPreview(fileEntryForPath(path)),
    [loadPreview],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const update = () => setWidth(root.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // The terminal underneath is only hidden; keyboard input must not stay on it.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root && !root.contains(document.activeElement))
      root.focus({ preventScroll: true });
  }, []);

  return (
    <section
      ref={rootRef}
      className={`files-tab-surface ${compact ? "is-compact" : ""} ${
        selection.entry && drillIn ? "has-detail" : ""
      }`}
      aria-label={`Files of ${ownerLabel}`}
      tabIndex={-1}
    >
      <WorkspaceFilesView
        workspaceId={workspaceId}
        scope={scope}
        tabsStore={tabsStore}
        active
        compact={compact}
        initialDirectory={link.initialDirectory ?? undefined}
        split={
          splitEnabled
            ? {
                ratio: navigationRatio,
                resetRatio: DEFAULT_INSPECTOR_NAVIGATION_RATIO,
                onChange: setNavigationRatio,
                onCommit: onNavigationRatioCommit,
              }
            : undefined
        }
        drillIn={drillIn}
        onDrillInChange={setDrillIn}
        fileSelection={selection}
        onSelectFileTab={selectFileTab}
        previewRequestRef={previewRequestRef}
        onFileSelectionChange={applySelection}
        onOpenDocument={(path, fragment) =>
          loadPreview(fileEntryForPath(path), fragment)
        }
        onRefreshFile={() => {
          if (selection.entry) loadPreview(selection.entry, selection.fragment);
        }}
        annotations={annotations}
        onCreateAnnotation={onCreateAnnotation}
        onReanchorAnnotations={onReanchorAnnotations}
        onEmptyFocusFallback={() => rootRef.current?.focus()}
        onClose={onShowConsole}
        onBack={() => {}}
      />
    </section>
  );
}
