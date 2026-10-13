export const SIDEBAR_RAIL_KEY = "sidebarRail";

// Anything but an explicit "true" keeps the sidebar expanded.
export function parseSidebarRail(raw: string | null): boolean {
  return raw === "true";
}

export function serializeSidebarRail(rail: boolean): string {
  return rail ? "true" : "false";
}
