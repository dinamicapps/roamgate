export function parentFilesystemPath(value: string): string {
  const path = value.replace(/\\/g, "/");
  const prefix = path.match(/^(?:[a-z]:\/|\/\/[^/]+\/[^/]+\/?|\/)/i)?.[0];
  if (!prefix) return path;
  const root = prefix.startsWith("//") ? prefix.replace(/\/$/, "") : prefix;
  const trimmed = path.replace(/\/+$/, "");
  if (trimmed.length <= root.length) return root;
  const slash = trimmed.lastIndexOf("/");
  return slash < root.length ? root : trimmed.slice(0, slash);
}

export function normalizeFilesystemPath(value: string): string {
  const path = value.replace(/\\/g, "/").replace(/\/+$/, "");
  return path || "/";
}

// Herdr on Windows reports some checkouts with the verbatim prefix
// (`\\?\E:\repo`) and others as `E:/repo`; both name the same directory.
const WINDOWS_PATH = /^(?:\\\\|[a-z]:[\\/])/i;

/** True for POSIX, drive-letter, UNC, and verbatim absolute paths. */
export function isAbsoluteFilesystemPath(value: string): boolean {
  return value.startsWith("/") || WINDOWS_PATH.test(value);
}

/**
 * Comparable form of a checkout path: trailing slashes removed and, for
 * Windows paths only, the verbatim prefix stripped, forward slashes, and an
 * upper-case drive letter. POSIX paths keep their backslashes untouched.
 */
export function normalizeCheckoutPath(value: string): string {
  const trimmed = value.trim();
  if (!WINDOWS_PATH.test(trimmed)) {
    if (trimmed === "/") return trimmed;
    return trimmed.replace(/\/+$/, "");
  }
  const path = normalizeFilesystemPath(
    trimmed.replace(/^\\\\\?\\UNC\\/i, "\\\\").replace(/^\\\\\?\\/, ""),
  ).replace(/^[a-z]:/, (drive) => drive.toUpperCase());
  return /^[A-Z]:$/.test(path) ? `${path}/` : path;
}

/** Absolute filesystem path for a directory preview, joining the preview root. */
export function directoryPreviewPath(
  preview: { type?: string; root: string; path: string } | null | undefined,
): string | null {
  if (!preview || preview.type !== "directory") return null;
  const path = normalizeFilesystemPath(preview.path);
  if (/^(?:\/|[a-z]:\/)/i.test(path)) return path;
  return normalizeFilesystemPath(`${preview.root.replace(/\/+$/, "")}/${path}`);
}

/** Display name for a directory preview: its last path component. */
export function directoryPreviewName(path: string): string {
  return path.split("/").filter(Boolean).pop() ?? "";
}
