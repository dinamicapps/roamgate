import { describe, expect, test } from "bun:test";
import {
  capFilesTabFiles,
  createFilesTabLinkSession,
  filesTabFilesStorageKey,
  filesTabLinksStorageKey,
  MAX_FILES_TAB_FILES,
  obtainFilesTabLink,
  readFilesTabFiles,
  readFilesTabLinks,
  reconcileFilesTabLinks,
  removeFilesTabLink,
  subscribeFilesTabStorage,
  updateFilesTabLinkRatios,
  writeFilesTabFiles,
  type FilesTabLinkInit,
  type FilesTabStorageChange,
} from "./filesTabResource";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
  };
}

const init =
  (overrides: Partial<FilesTabLinkInit> = {}): (() => FilesTabLinkInit) =>
  () => ({
    workspaceId: "w1",
    scopeOwner: "workspace:w1",
    initialDirectory: "src",
    ...overrides,
  });

const quotaError = () => new DOMException("Storage full", "QuotaExceededError");

describe("filesTabLinks storage", () => {
  test("namespaces links and file tabs by connection", () => {
    expect(filesTabLinksStorageKey("legacy-default")).toBe("filesTabLinks");
    expect(filesTabFilesStorageKey("legacy-default", "w1:t1")).toBe(
      "filesTabFiles:w1:t1",
    );
    expect(filesTabLinksStorageKey("alpha")).toBe(
      "herdr.connection/alpha/filesTabLinks",
    );
    expect(filesTabFilesStorageKey("alpha", "w1:t1")).toBe(
      "herdr.connection/alpha/filesTabFiles%3Aw1%3At1",
    );
  });

  test("sanitizes corrupt registries and entries", () => {
    const storage = memoryStorage();
    const key = filesTabLinksStorageKey("alpha");
    for (const raw of [
      "{",
      "null",
      "[]",
      '{"version":2,"links":{}}',
      '{"version":1,"links":[]}',
    ])
      expect(readFilesTabLinks({ getItem: () => raw }, "alpha")).toEqual({});
    storage.setItem(
      key,
      JSON.stringify({
        version: 1,
        links: {
          good: {
            workspaceId: "w1",
            scopeOwner: "workspace:w1",
            initialDirectory: 7,
            navigationRatio: 9,
            expandedNavigationRatio: "x",
          },
          noWorkspace: { scopeOwner: "workspace:w1" },
          notObject: "w1",
        },
      }),
    );
    expect(readFilesTabLinks(storage, "alpha")).toEqual({
      good: {
        workspaceId: "w1",
        scopeOwner: "workspace:w1",
        initialDirectory: null,
        navigationRatio: 0.75,
      },
    });
    expect(readFilesTabLinks(memoryStorage(), "alpha")).toEqual({});
  });

  test("merges per owner so two browser tabs keep both links", () => {
    const storage = memoryStorage();
    const stale = readFilesTabLinks(storage, "alpha");
    obtainFilesTabLink(storage, "alpha", "w1:t1", init());
    // A second browser tab with an outdated view still preserves t1.
    expect(stale).toEqual({});
    obtainFilesTabLink(
      storage,
      "alpha",
      "w1:t2",
      init({ initialDirectory: null }),
    );
    expect(Object.keys(readFilesTabLinks(storage, "alpha")).sort()).toEqual([
      "w1:t1",
      "w1:t2",
    ]);
    updateFilesTabLinkRatios(storage, "alpha", "w1:t2", {
      navigationRatio: 0.5,
      expandedNavigationRatio: 0.3,
    });
    const links = readFilesTabLinks(storage, "alpha");
    expect(links["w1:t1"]?.navigationRatio).toBe(0.4);
    expect(links["w1:t2"]).toMatchObject({
      navigationRatio: 0.5,
      expandedNavigationRatio: 0.3,
    });
    expect(
      updateFilesTabLinkRatios(storage, "alpha", "gone", {
        navigationRatio: 0.5,
      }),
    ).toBeNull();
    expect(readFilesTabLinks(storage, "beta")).toEqual({});
  });

  test("obtains a link idempotently and fixes the initial directory once", () => {
    const storage = memoryStorage();
    let calls = 0;
    const first = obtainFilesTabLink(storage, "alpha", "w1:t1", () => {
      calls += 1;
      return init()();
    });
    const second = obtainFilesTabLink(storage, "alpha", "w1:t1", () => {
      calls += 1;
      return init({ initialDirectory: "docs" })();
    });
    expect(first.created).toBe(true);
    expect(second).toEqual({ link: first.link, created: false });
    expect(second.link.initialDirectory).toBe("src");
    expect(calls).toBe(1);
  });

  test("explicit close removes the link and its file tabs", () => {
    const storage = memoryStorage();
    obtainFilesTabLink(storage, "alpha", "w1:t1", init());
    obtainFilesTabLink(storage, "alpha", "w1:t2", init());
    writeFilesTabFiles(storage, "alpha", "w1:t1", {
      paths: ["a.ts"],
      activePath: "a.ts",
      previewPath: null,
    });
    removeFilesTabLink(storage, "alpha", "w1:t1");
    expect(Object.keys(readFilesTabLinks(storage, "alpha"))).toEqual(["w1:t2"]);
    expect(
      storage.getItem(filesTabFilesStorageKey("alpha", "w1:t1")),
    ).toBeNull();
  });

  test("keeps links usable when the registry write exceeds the quota", () => {
    const storage = memoryStorage();
    storage.setItem = () => {
      throw quotaError();
    };
    const result = obtainFilesTabLink(storage, "alpha", "w1:t1", init());
    expect(result.created).toBe(true);
    expect(result.link.initialDirectory).toBe("src");
  });
});

describe("reconciliation", () => {
  test("drops links of dead consoles and sweeps orphan file tabs", () => {
    const storage = memoryStorage();
    obtainFilesTabLink(storage, "alpha", "w1:t1", init());
    obtainFilesTabLink(storage, "alpha", "w1:t2", init());
    const tabs = { paths: ["a.ts"], activePath: "a.ts", previewPath: null };
    writeFilesTabFiles(storage, "alpha", "w1:t1", tabs);
    writeFilesTabFiles(storage, "alpha", "w1:t2", tabs);
    writeFilesTabFiles(storage, "alpha", "orphan", tabs);
    writeFilesTabFiles(storage, "beta", "orphan", tabs);
    writeFilesTabFiles(storage, "legacy-default", "orphan", tabs);

    expect(
      reconcileFilesTabLinks(storage, "alpha", ["w1:t1", "w1:t9"]),
    ).toEqual(["w1:t2"]);
    expect(Object.keys(readFilesTabLinks(storage, "alpha"))).toEqual(["w1:t1"]);
    expect(readFilesTabFiles(storage, "alpha", "w1:t1")).toEqual(tabs);
    expect(
      storage.getItem(filesTabFilesStorageKey("alpha", "w1:t2")),
    ).toBeNull();
    expect(
      storage.getItem(filesTabFilesStorageKey("alpha", "orphan")),
    ).toBeNull();
    // Other connections are reconciled by their own snapshots.
    expect(readFilesTabFiles(storage, "beta", "orphan")).toEqual(tabs);
    expect(readFilesTabFiles(storage, "legacy-default", "orphan")).toEqual(
      tabs,
    );
  });

  test("sweeps legacy-default orphan keys without touching namespaced ones", () => {
    const storage = memoryStorage();
    const tabs = { paths: ["a.ts"], activePath: "a.ts", previewPath: null };
    obtainFilesTabLink(storage, "legacy-default", "w1:t1", init());
    writeFilesTabFiles(storage, "legacy-default", "w1:t1", tabs);
    writeFilesTabFiles(storage, "legacy-default", "dead", tabs);
    writeFilesTabFiles(storage, "alpha", "dead", tabs);
    reconcileFilesTabLinks(storage, "legacy-default", ["w1:t1"]);
    expect(storage.getItem("filesTabFiles:dead")).toBeNull();
    expect(readFilesTabFiles(storage, "legacy-default", "w1:t1")).toEqual(tabs);
    expect(readFilesTabFiles(storage, "alpha", "dead")).toEqual(tabs);
  });
});

describe("first snapshot barrier", () => {
  test("neither exposes nor prunes links before a current snapshot", () => {
    const storage = memoryStorage();
    obtainFilesTabLink(storage, "alpha", "w1:t1", init());
    obtainFilesTabLink(storage, "alpha", "w1:t2", init());
    const session = createFilesTabLinkSession(storage, "alpha", 3);

    expect(session.isReady()).toBe(false);
    expect(session.links()).toEqual({});
    expect(session.obtain("w1:t3", init())).toBeNull();
    expect(session.acceptSnapshot(2, [])).toBeNull();
    expect(session.isReady()).toBe(false);
    expect(Object.keys(readFilesTabLinks(storage, "alpha"))).toHaveLength(2);

    expect(session.acceptSnapshot(3, ["w1:t1", "w1:t3"])).toEqual(["w1:t2"]);
    expect(session.isReady()).toBe(true);
    expect(Object.keys(session.links())).toEqual(["w1:t1"]);
    expect(session.obtain("w1:t1", init())?.created).toBe(false);
    expect(session.obtain("w1:t3", init())?.created).toBe(true);
    session.close("w1:t3");
    expect(Object.keys(session.links())).toEqual(["w1:t1"]);
  });
});

describe("filesTabFiles", () => {
  test("keeps the ResourceFileTabs v2 shape per owner", () => {
    const storage = memoryStorage();
    const tabs = {
      paths: ["a.ts", "b.ts"],
      activePath: "b.ts",
      previewPath: "b.ts",
    };
    expect(writeFilesTabFiles(storage, "alpha", "w1:t1", tabs)).toEqual(tabs);
    expect(
      JSON.parse(storage.getItem(filesTabFilesStorageKey("alpha", "w1:t1"))!),
    ).toEqual({ version: 2, ...tabs });
    expect(readFilesTabFiles(storage, "alpha", "w1:t1")).toEqual(tabs);
    expect(readFilesTabFiles(storage, "alpha", "w1:t2")).toEqual({
      paths: [],
      activePath: null,
      previewPath: null,
    });
  });

  test("sanitizes corrupt file tabs", () => {
    const storage = memoryStorage({
      [filesTabFilesStorageKey("alpha", "w1:t1")]: JSON.stringify({
        version: 2,
        paths: ["a.ts", 4, "", "a.ts"],
        activePath: "missing",
        previewPath: 1,
      }),
      [filesTabFilesStorageKey("alpha", "w1:t2")]: "{broken",
    });
    expect(readFilesTabFiles(storage, "alpha", "w1:t1")).toEqual({
      paths: ["a.ts"],
      activePath: "a.ts",
      previewPath: null,
    });
    expect(readFilesTabFiles(storage, "alpha", "w1:t2").paths).toEqual([]);
  });

  test("caps file tabs at twenty, dropping the oldest but not the active one", () => {
    const paths = Array.from({ length: 25 }, (_, index) => `f${index}.ts`);
    const capped = capFilesTabFiles({
      paths,
      activePath: "f0.ts",
      previewPath: "f24.ts",
    });
    expect(capped.paths).toHaveLength(MAX_FILES_TAB_FILES);
    expect(capped.paths[0]).toBe("f0.ts");
    expect(capped.paths.slice(1, 3)).toEqual(["f6.ts", "f7.ts"]);
    expect(capped.paths[capped.paths.length - 1]).toBe("f24.ts");

    const storage = memoryStorage();
    writeFilesTabFiles(storage, "alpha", "w1:t1", {
      paths,
      activePath: "f24.ts",
      previewPath: null,
    });
    expect(readFilesTabFiles(storage, "alpha", "w1:t1").paths).toEqual(
      paths.slice(5),
    );
  });

  test("prunes and retries when the quota is exceeded", () => {
    const storage = memoryStorage();
    const setItem = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      if (JSON.parse(value).paths.length > 4) throw quotaError();
      setItem(key, value);
    };
    const paths = Array.from({ length: 12 }, (_, index) => `f${index}.ts`);
    const written = writeFilesTabFiles(storage, "alpha", "w1:t1", {
      paths,
      activePath: "f11.ts",
      previewPath: null,
    });
    expect(written?.paths).toEqual(["f9.ts", "f10.ts", "f11.ts"]);
    expect(readFilesTabFiles(storage, "alpha", "w1:t1")).toEqual(written!);

    storage.setItem = () => {
      throw quotaError();
    };
    expect(
      writeFilesTabFiles(storage, "alpha", "w1:t1", {
        paths,
        activePath: "f11.ts",
        previewPath: null,
      }),
    ).toBeNull();

    storage.setItem = () => {
      throw new Error("boom");
    };
    expect(() =>
      writeFilesTabFiles(storage, "alpha", "w1:t1", {
        paths: [],
        activePath: null,
        previewPath: null,
      }),
    ).toThrow("boom");
  });
});

describe("storage sync", () => {
  test("reports changes to this connection's files-tab keys only", () => {
    let emit: (key: string | null) => void = () => {};
    let unsubscribed = false;
    const changes: FilesTabStorageChange[] = [];
    const unsubscribe = subscribeFilesTabStorage(
      "alpha",
      (change) => changes.push(change),
      (listener) => {
        emit = listener;
        return () => {
          unsubscribed = true;
        };
      },
    );
    emit(filesTabLinksStorageKey("alpha"));
    emit(filesTabFilesStorageKey("alpha", "w1:t1"));
    emit(filesTabLinksStorageKey("beta"));
    emit(filesTabFilesStorageKey("beta", "w1:t1"));
    emit("filesTabFiles:w1:t1");
    emit("theme");
    emit(null);
    unsubscribe();
    expect(changes).toEqual([
      { kind: "links" },
      { kind: "files", ownerTabId: "w1:t1" },
      { kind: "cleared" },
    ]);
    expect(unsubscribed).toBe(true);
  });
});
