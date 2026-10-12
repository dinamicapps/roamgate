import { subscribeLocalStorage } from "./browserStorage";
import {
  connectionStorageKey,
  LEGACY_DEFAULT_CONNECTION_ID,
} from "./connectionStorage";
import {
  finiteNavigationRatio,
  readResourceFileTabs,
  writeResourceFileTabs,
  type ResourceFileTabs,
  type ResourceScope,
} from "./workspaceResource";

export const FILES_TAB_LINKS_STORAGE_KEY = "filesTabLinks";
export const FILES_TAB_FILES_STORAGE_PREFIX = "filesTabFiles:";
export const FILES_TAB_LINKS_VERSION = 1;
export const MAX_FILES_TAB_FILES = 20;

export interface FilesTabLink {
  workspaceId: string;
  scopeOwner: string;
  initialDirectory: string | null;
  navigationRatio: number;
  expandedNavigationRatio?: number;
}

export type FilesTabLinks = Record<string, FilesTabLink>;

export type FilesTabLinkInit = Omit<FilesTabLink, "navigationRatio"> & {
  navigationRatio?: number;
};

export type FilesTabLinkRatios = Partial<
  Pick<FilesTabLink, "navigationRatio" | "expandedNavigationRatio">
>;

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type EnumerableStorage = StorageWriter & Pick<Storage, "key" | "length">;

export function filesTabLinksStorageKey(connectionId: string): string {
  return connectionStorageKey(connectionId, FILES_TAB_LINKS_STORAGE_KEY);
}

export function filesTabFilesStorageKey(
  connectionId: string,
  ownerTabId: string,
): string {
  if (!ownerTabId) throw new Error("invalid owner tab_id");
  return connectionStorageKey(
    connectionId,
    `${FILES_TAB_FILES_STORAGE_PREFIX}${ownerTabId}`,
  );
}

function filesTabFilesKeyPrefix(connectionId: string): string {
  return connectionStorageKey(connectionId, FILES_TAB_FILES_STORAGE_PREFIX);
}

function ownerTabIdFromFilesKey(
  connectionId: string,
  key: string,
): string | null {
  const prefix = filesTabFilesKeyPrefix(connectionId);
  if (!key.startsWith(prefix) || key.length === prefix.length) return null;
  const suffix = key.slice(prefix.length);
  if (connectionId === LEGACY_DEFAULT_CONNECTION_ID) return suffix;
  try {
    return decodeURIComponent(suffix);
  } catch {
    return null;
  }
}

export function isQuotaExceededError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: unknown }).code;
  return (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    code === 22 ||
    code === 1014
  );
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function sanitizeFilesTabLink(value: unknown): FilesTabLink | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entry = value as Record<string, unknown>;
  if (!nonEmptyString(entry.workspaceId) || !nonEmptyString(entry.scopeOwner))
    return null;
  const link: FilesTabLink = {
    workspaceId: entry.workspaceId,
    scopeOwner: entry.scopeOwner,
    initialDirectory:
      typeof entry.initialDirectory === "string"
        ? entry.initialDirectory
        : null,
    navigationRatio: finiteNavigationRatio(entry.navigationRatio),
  };
  if (
    typeof entry.expandedNavigationRatio === "number" &&
    Number.isFinite(entry.expandedNavigationRatio)
  )
    link.expandedNavigationRatio = finiteNavigationRatio(
      entry.expandedNavigationRatio,
    );
  return link;
}

/** Reads every persisted link, dropping entries that cannot be trusted. */
export function readFilesTabLinks(
  storage: StorageReader,
  connectionId: string,
): FilesTabLinks {
  try {
    const raw = storage.getItem(filesTabLinksStorageKey(connectionId));
    if (!raw) return {};
    const value = JSON.parse(raw);
    if (
      !value ||
      value.version !== FILES_TAB_LINKS_VERSION ||
      !value.links ||
      typeof value.links !== "object" ||
      Array.isArray(value.links)
    )
      return {};
    const links: FilesTabLinks = {};
    for (const [ownerTabId, entry] of Object.entries(value.links)) {
      const link = ownerTabId ? sanitizeFilesTabLink(entry) : null;
      if (link) links[ownerTabId] = link;
    }
    return links;
  } catch {
    return {};
  }
}

/**
 * Re-reads the shared registry right before writing so a browser tab only
 * changes the owners it names; other tabs' concurrent links survive.
 */
function mergeFilesTabLinks(
  storage: StorageWriter,
  connectionId: string,
  change: (links: FilesTabLinks) => boolean,
): FilesTabLinks | null {
  const links = readFilesTabLinks(storage, connectionId);
  if (!change(links)) return links;
  try {
    storage.setItem(
      filesTabLinksStorageKey(connectionId),
      JSON.stringify({ version: FILES_TAB_LINKS_VERSION, links }),
    );
    return links;
  } catch (error) {
    if (isQuotaExceededError(error)) return null;
    throw error;
  }
}

/**
 * Idempotent per owner: an existing link wins and keeps its initial
 * directory; `init` only runs when the owner has no link yet.
 */
export function obtainFilesTabLink(
  storage: StorageWriter,
  connectionId: string,
  ownerTabId: string,
  init: () => FilesTabLinkInit,
): { link: FilesTabLink; created: boolean } {
  if (!ownerTabId) throw new Error("invalid owner tab_id");
  let created: FilesTabLink | null = null;
  const links = mergeFilesTabLinks(storage, connectionId, (current) => {
    if (current[ownerTabId]) return false;
    const fresh = sanitizeFilesTabLink(init());
    if (!fresh) throw new Error("invalid files tab link");
    current[ownerTabId] = created = fresh;
    return true;
  });
  const link = links?.[ownerTabId] ?? created;
  if (!link) throw new Error("invalid files tab link");
  return { link, created: created !== null };
}

export function updateFilesTabLinkRatios(
  storage: StorageWriter,
  connectionId: string,
  ownerTabId: string,
  ratios: FilesTabLinkRatios,
): FilesTabLink | null {
  const links = mergeFilesTabLinks(storage, connectionId, (current) => {
    const link = current[ownerTabId];
    if (!link) return false;
    current[ownerTabId] = {
      ...link,
      ...(ratios.navigationRatio === undefined
        ? {}
        : { navigationRatio: finiteNavigationRatio(ratios.navigationRatio) }),
      ...(ratios.expandedNavigationRatio === undefined
        ? {}
        : {
            expandedNavigationRatio: finiteNavigationRatio(
              ratios.expandedNavigationRatio,
            ),
          }),
    };
    return true;
  });
  return links?.[ownerTabId] ?? null;
}

/** Explicit close of the files tab or its console: link and file tabs go. */
export function removeFilesTabLink(
  storage: StorageWriter,
  connectionId: string,
  ownerTabId: string,
): void {
  mergeFilesTabLinks(storage, connectionId, (current) => {
    if (!current[ownerTabId]) return false;
    delete current[ownerTabId];
    return true;
  });
  storage.removeItem(filesTabFilesStorageKey(connectionId, ownerTabId));
}

/**
 * Drops links whose console is gone and sweeps file-tab keys without a link.
 * Only call with the live tab_ids of an accepted snapshot.
 */
export function reconcileFilesTabLinks(
  storage: EnumerableStorage,
  connectionId: string,
  liveTabIds: Iterable<string>,
): string[] {
  const live = new Set(liveTabIds);
  const removed: string[] = [];
  const links = mergeFilesTabLinks(storage, connectionId, (current) => {
    for (const ownerTabId of Object.keys(current)) {
      if (live.has(ownerTabId)) continue;
      delete current[ownerTabId];
      removed.push(ownerTabId);
    }
    return removed.length > 0;
  });
  const linked = new Set(
    Object.keys(links ?? readFilesTabLinks(storage, connectionId)).filter(
      (ownerTabId) => live.has(ownerTabId),
    ),
  );
  // Snapshot keys first: removing while indexing shifts Storage.key().
  const keys = Array.from({ length: storage.length }, (_, index) =>
    storage.key(index),
  );
  for (const key of keys) {
    if (key === null) continue;
    const ownerTabId = ownerTabIdFromFilesKey(connectionId, key);
    if (ownerTabId !== null && !linked.has(ownerTabId)) storage.removeItem(key);
  }
  return removed;
}

export interface FilesTabLinkSession {
  readonly connectionId: string;
  readonly generation: number;
  isReady(): boolean;
  /** Ignored (returns null) for another generation; else reconciles. */
  acceptSnapshot(
    generation: number,
    liveTabIds: Iterable<string>,
  ): string[] | null;
  links(): FilesTabLinks;
  obtain(
    ownerTabId: string,
    init: () => FilesTabLinkInit,
  ): { link: FilesTabLink; created: boolean } | null;
  close(ownerTabId: string): void;
}

/**
 * Persisted links cannot be validated until the first snapshot of this
 * connection generation arrives, so until then they are neither exposed nor
 * pruned.
 */
export function createFilesTabLinkSession(
  storage: EnumerableStorage,
  connectionId: string,
  generation: number,
): FilesTabLinkSession {
  let ready = false;
  return {
    connectionId,
    generation,
    isReady: () => ready,
    acceptSnapshot(snapshotGeneration, liveTabIds) {
      if (snapshotGeneration !== generation) return null;
      ready = true;
      return reconcileFilesTabLinks(storage, connectionId, liveTabIds);
    },
    links: () => (ready ? readFilesTabLinks(storage, connectionId) : {}),
    obtain(ownerTabId, init) {
      if (!ready) return null;
      return obtainFilesTabLink(storage, connectionId, ownerTabId, init);
    },
    close(ownerTabId) {
      removeFilesTabLink(storage, connectionId, ownerTabId);
    },
  };
}

// The scope only selects the ResourceFileTabs key; these adapters redirect
// that key so the per-owner state reuses the same parser and serializer.
const IGNORED_SCOPE: ResourceScope = {
  kind: "workspace",
  connectionId: LEGACY_DEFAULT_CONNECTION_ID,
  workspaceId: "",
};

export function readFilesTabFiles(
  storage: StorageReader,
  connectionId: string,
  ownerTabId: string,
): ResourceFileTabs {
  const key = filesTabFilesStorageKey(connectionId, ownerTabId);
  try {
    return capFilesTabFiles(
      readResourceFileTabs(
        { getItem: () => storage.getItem(key) },
        IGNORED_SCOPE,
      ),
    );
  } catch {
    return { paths: [], activePath: null, previewPath: null };
  }
}

/** Drops the oldest paths first, never the active or preview one. */
export function capFilesTabFiles(
  tabs: ResourceFileTabs,
  max = MAX_FILES_TAB_FILES,
): ResourceFileTabs {
  let excess = tabs.paths.length - max;
  if (excess <= 0) return tabs;
  const paths = tabs.paths.filter((path) => {
    if (excess <= 0 || path === tabs.activePath || path === tabs.previewPath)
      return true;
    excess -= 1;
    return false;
  });
  return { ...tabs, paths };
}

/**
 * Persists the capped tabs; on QuotaExceededError retries with fewer paths.
 * Returns what was stored, or null when even the smallest form did not fit.
 */
export function writeFilesTabFiles(
  storage: Pick<Storage, "setItem">,
  connectionId: string,
  ownerTabId: string,
  tabs: ResourceFileTabs,
): ResourceFileTabs | null {
  const key = filesTabFilesStorageKey(connectionId, ownerTabId);
  const target = {
    setItem: (_: string, value: string) => storage.setItem(key, value),
  };
  let candidate = capFilesTabFiles(tabs);
  for (;;) {
    try {
      writeResourceFileTabs(target, IGNORED_SCOPE, candidate);
      return candidate;
    } catch (error) {
      if (!isQuotaExceededError(error)) throw error;
      const max = Math.floor(candidate.paths.length / 2);
      const smaller = capFilesTabFiles(candidate, max);
      if (smaller.paths.length >= candidate.paths.length) return null;
      candidate = smaller;
    }
  }
}

export type FilesTabStorageChange =
  | { kind: "links" }
  | { kind: "files"; ownerTabId: string }
  | { kind: "cleared" };

/** Mirrors other browser tabs' writes to this connection's files-tab keys. */
export function subscribeFilesTabStorage(
  connectionId: string,
  listener: (change: FilesTabStorageChange) => void,
  subscribe: typeof subscribeLocalStorage = subscribeLocalStorage,
): () => void {
  const linksKey = filesTabLinksStorageKey(connectionId);
  return subscribe((key) => {
    if (key === null) return listener({ kind: "cleared" });
    if (key === linksKey) return listener({ kind: "links" });
    const ownerTabId = ownerTabIdFromFilesKey(connectionId, key);
    if (ownerTabId !== null) listener({ kind: "files", ownerTabId });
  });
}
