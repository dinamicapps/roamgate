import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { shQuote } from "../utils/process-utils";
import { createFileHandlers } from "./files";

async function withTempDir<T>(fn: (dir: string) => Promise<T>) {
  const dir = await mkdtemp(join(tmpdir(), "herdr-gui-handler-test-"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

describe("workspace file handlers", () => {
  test("falls back to focused pane cwd when workspace has no checkout path", async () => {
    await withTempDir(async (root) => {
      await mkdir(join(root, "src"));
      await writeFile(join(root, "README.md"), "hello");
      const calls: string[] = [];
      const handlers = createFileHandlers({
        herdr: {
          call: async (method: string) => {
            calls.push(method);
            if (method === "workspace.get") {
              return { workspace: { workspace_id: "w1", label: "Repo" } };
            }
            if (method === "pane.list") {
              return {
                panes: [
                  {
                    workspace_id: "w1",
                    focused: true,
                    foreground_cwd: root,
                  },
                ],
              };
            }
            throw new Error(`unexpected call ${method}`);
          },
        } as any,
        sshHost: () => undefined,
        runProcessWithCodeTimeout: async () => ({
          code: 0,
          stdout: root,
          stderr: "",
        }),
        shQuote,
      });

      const list = await handlers.listWorkspaceFiles({ workspace_id: "w1" });
      expect(list).toMatchObject({
        workspace_id: "w1",
        repo_name: "Repo",
        checkout_path: root,
      });
      expect(list.entries.map((entry) => entry.name)).toEqual([
        "src",
        "README.md",
      ]);
      expect(calls).toEqual(["workspace.get", "pane.list"]);
    });
  });

  test("prefers pane cwd over an agent foreground directory for git operations", async () => {
    const calls: string[][] = [];
    const handlers = createFileHandlers({
      herdr: {
        call: async (method: string) => {
          if (method === "workspace.get") {
            return { workspace: { workspace_id: "w1", label: "Repo" } };
          }
          if (method === "pane.list") {
            return {
              panes: [
                {
                  workspace_id: "w1",
                  focused: true,
                  cwd: "/repo",
                  foreground_cwd: "/agent/plugin",
                },
              ],
            };
          }
          throw new Error(`unexpected call ${method}`);
        },
      } as any,
      sshHost: () => undefined,
      runProcessWithCodeTimeout: async (argv) => {
        calls.push(argv);
        return { code: 0, stdout: "/repo\n", stderr: "" };
      },
      shQuote,
    });

    await expect(
      handlers.resolveWorkspaceGitRoot({ workspace_id: "w1" }),
    ).resolves.toMatchObject({ root: "/repo" });
    expect(calls).toEqual([
      ["git", "-C", "/repo", "rev-parse", "--show-toplevel"],
    ]);
  });

  test("returns download responses with safe headers", async () => {
    await withTempDir(async (root) => {
      await writeFile(join(root, "测试.txt"), "hello");
      await writeFile(join(root, "guide.pdf"), "%PDF-1.7");
      const handlers = createFileHandlers({
        herdr: {
          call: async (method: string) => {
            if (method === "workspace.get") {
              return {
                workspace: {
                  workspace_id: "w1",
                  worktree: { checkout_path: root, repo_name: "Repo" },
                },
              };
            }
            throw new Error(`unexpected call ${method}`);
          },
        } as any,
        sshHost: () => undefined,
        runProcessWithCodeTimeout: async () => ({
          code: 0,
          stdout: root,
          stderr: "",
        }),
        shQuote,
      });

      const response = await handlers.downloadWorkspaceFile({
        workspace_id: "w1",
        path: "测试.txt",
      });
      expect(response.headers.get("content-disposition")).toContain(
        'filename="__.txt"',
      );
      expect(response.headers.get("x-file-path")).toBe(
        encodeURIComponent("测试.txt"),
      );
      expect(await response.text()).toBe("hello");

      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
      await writeFile(join(root, "vector.svg"), svg);
      const svgResponse = await handlers.downloadWorkspaceFile({
        workspace_id: "w1",
        path: "vector.svg",
        inline: true,
      });
      expect(svgResponse.headers.get("content-type")).toBe("image/svg+xml");
      expect(svgResponse.headers.get("content-security-policy")).toBe(
        "sandbox; default-src 'none'; style-src 'unsafe-inline'; img-src data:",
      );
      expect(svgResponse.headers.get("x-content-type-options")).toBe("nosniff");
      expect(await svgResponse.text()).toBe(svg);

      const inlineResponse = await handlers.downloadWorkspaceFile({
        workspace_id: "w1",
        path: "guide.pdf",
        inline: true,
      });
      expect(inlineResponse.headers.get("content-type")).toBe(
        "application/pdf",
      );
      expect(inlineResponse.headers.get("content-disposition")).toContain(
        "inline;",
      );
      expect(inlineResponse.headers.get("cache-control")).toBe(
        "private, no-store",
      );
      expect(inlineResponse.headers.get("x-content-type-options")).toBe(
        "nosniff",
      );
      expect(await inlineResponse.text()).toBe("%PDF-1.7");

      await writeFile(join(root, "take.wav"), "RIFF");
      const audioResponse = await handlers.downloadWorkspaceFile({
        workspace_id: "w1",
        path: "take.wav",
        inline: true,
      });
      expect(audioResponse.headers.get("content-type")).toBe("audio/wav");
      expect(audioResponse.headers.get("content-disposition")).toContain(
        "inline;",
      );
      expect(audioResponse.headers.get("x-content-type-options")).toBe(
        "nosniff",
      );
      expect(await audioResponse.text()).toBe("RIFF");
    });
  });

  test("resolves existing workspace-relative files and directories in one batch", async () => {
    await withTempDir(async (root) => {
      await mkdir(join(root, "a", "b"), { recursive: true });
      await writeFile(join(root, "a", "b", "c.png"), "image");
      const handlers = createFileHandlers({
        herdr: {
          call: async (method: string) => {
            if (method === "workspace.get") {
              return {
                workspace: {
                  workspace_id: "w1",
                  worktree: { checkout_path: root, repo_name: "Repo" },
                },
              };
            }
            throw new Error(`unexpected call ${method}`);
          },
        } as any,
        sshHost: () => undefined,
        runProcessWithCodeTimeout: async () => ({
          code: 0,
          stdout: "",
          stderr: "",
        }),
        shQuote,
      });

      expect(
        await handlers.resolveWorkspaceFiles({
          workspace_id: "w1",
          paths: [
            "a/b/c.png",
            "./a/b/c.png",
            "a/b",
            "missing/file.png",
            "../outside.txt",
          ],
        }),
      ).toMatchObject({
        workspace_id: "w1",
        checkout_path: root,
        files: [
          { candidate: "a/b/c.png", path: "a/b/c.png" },
          { candidate: "./a/b/c.png", path: "a/b/c.png" },
          { candidate: "a/b", path: "a/b" },
        ],
      });
    });
  });

  describe("console-scoped explorer root", () => {
    const notARepo = {
      code: 128,
      stdout: "",
      stderr: "fatal: not a git repository",
    };

    // repo/        git toplevel of tab t1's pane (repo/web/src)
    // scratch/     tab t2's pane cwd, outside any repository
    async function withConsoles(
      fn: (fixture: {
        repo: string;
        scratch: string;
        handlers: ReturnType<typeof createFileHandlers>;
        gitCalls: string[][];
      }) => Promise<void>,
      workspace?: (repo: string) => Record<string, unknown>,
    ) {
      await withTempDir(async (dir) => {
        const repo = join(dir, "repo");
        const scratch = join(dir, "scratch");
        const nested = join(repo, "web", "src");
        await mkdir(nested, { recursive: true });
        await mkdir(scratch);
        await writeFile(join(repo, "README.md"), "repo");
        await writeFile(join(scratch, "notes.md"), "notes");
        const panes = [
          {
            workspace_id: "w1",
            tab_id: "t1",
            pane_id: "p1",
            focused: false,
            foreground_cwd: nested,
          },
          {
            workspace_id: "w1",
            tab_id: "t2",
            pane_id: "p2",
            focused: true,
            cwd: scratch,
          },
          { workspace_id: "w2", tab_id: "t3", pane_id: "p3", cwd: dir },
        ];
        const gitCalls: string[][] = [];
        const handlers = createFileHandlers({
          herdr: {
            call: async (method: string) => {
              if (method === "workspace.get") {
                return {
                  workspace: workspace?.(repo) ?? {
                    workspace_id: "w1",
                    label: "Repo",
                  },
                };
              }
              if (method === "pane.list") return { panes };
              throw new Error(`unexpected call ${method}`);
            },
          } as any,
          sshHost: () => undefined,
          runProcessWithCodeTimeout: async (argv) => {
            gitCalls.push(argv);
            return argv[2] === nested
              ? { code: 0, stdout: `${repo}\n`, stderr: "" }
              : notARepo;
          },
          shQuote,
        });
        await fn({ repo, scratch, handlers, gitCalls });
      });
    }

    test("roots at the git toplevel of the tab's pane, not the focused workspace pane", async () => {
      await withConsoles(async ({ repo, handlers, gitCalls }) => {
        const list = await handlers.listWorkspaceFiles({
          workspace_id: "w1",
          tab_id: "t1",
        });
        expect(list).toMatchObject({ checkout_path: repo, tab_id: "t1" });
        expect(list.entries.map((entry) => entry.name)).toEqual([
          "web",
          "README.md",
        ]);
        const preview = await handlers.readWorkspaceFile({
          workspace_id: "w1",
          tab_id: "t1",
          path: "README.md",
        });
        expect(preview).toMatchObject({
          checkout_path: repo,
          tab_id: "t1",
          text: "repo",
        });
        // The toplevel lookup is cached per cwd.
        expect(gitCalls).toHaveLength(1);
      });
    });

    test("falls back to the pane cwd outside a repository", async () => {
      await withConsoles(async ({ scratch, handlers, gitCalls }) => {
        const list = await handlers.listWorkspaceFiles({
          workspace_id: "w1",
          tab_id: "t2",
        });
        expect(list).toMatchObject({ checkout_path: scratch, tab_id: "t2" });
        expect(list.entries.map((entry) => entry.name)).toEqual(["notes.md"]);
        expect(gitCalls).toHaveLength(1);
      });
    });

    test("rejects a tab of another workspace", async () => {
      await withConsoles(async ({ handlers, gitCalls }) => {
        await expect(
          handlers.listWorkspaceFiles({ workspace_id: "w1", tab_id: "t3" }),
        ).rejects.toThrow("tab t3 does not belong to workspace w1");
        await expect(
          handlers.downloadWorkspaceFile({
            workspace_id: "w1",
            tab_id: "missing",
            path: "README.md",
          }),
        ).rejects.toThrow("tab missing does not belong to workspace w1");
        expect(gitCalls).toEqual([]);
      });
    });

    test("keeps the worktree checkout as the root of every console", async () => {
      await withConsoles(
        async ({ repo, handlers, gitCalls }) => {
          await expect(
            handlers.listWorkspaceFiles({ workspace_id: "w1", tab_id: "t2" }),
          ).resolves.toMatchObject({ checkout_path: repo });
          await expect(
            handlers.listWorkspaceFiles({ workspace_id: "w1", tab_id: "t3" }),
          ).rejects.toThrow("does not belong to workspace");
          expect(gitCalls).toEqual([]);
        },
        (repo) => ({
          workspace_id: "w1",
          worktree: { checkout_path: repo, repo_name: "Repo" },
        }),
      );
    });

    test("without tab_id keeps the focused workspace pane cwd", async () => {
      await withConsoles(async ({ scratch, handlers, gitCalls }) => {
        const list = await handlers.listWorkspaceFiles({ workspace_id: "w1" });
        expect(list).toMatchObject({ checkout_path: scratch });
        expect(list).not.toHaveProperty("tab_id");
        expect(gitCalls).toEqual([]);
      });
    });
  });
  test("validates required workspace ids", async () => {
    const handlers = createFileHandlers({
      herdr: { call: async () => ({}) } as any,
      sshHost: () => undefined,
      runProcessWithCodeTimeout: async () => ({
        code: 0,
        stdout: "",
        stderr: "",
      }),
      shQuote,
    });

    await expect(handlers.listWorkspaceFiles({})).rejects.toThrow(
      "file.list requires workspace_id",
    );
    await expect(
      handlers.readWorkspaceFile({ path: "README.md" }),
    ).rejects.toThrow("file.read requires workspace_id");
    await expect(handlers.resolveWorkspaceFiles({ paths: [] })).rejects.toThrow(
      "file.resolve requires workspace_id",
    );
  });
});
