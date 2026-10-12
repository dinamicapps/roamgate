export type FilesTabEscapeStep = "ignore" | "close-detail" | "show-console";

/**
 * Esc inside a files tab peels one transient layer at a time and never closes
 * the tab: menus, popovers, dialogs and the search clear themselves first,
 * then the compact detail returns to the tree, and only then the console
 * shows again.
 */
export function filesTabEscapeStep({
  handled,
  overlayOpen,
  compactDetailOpen,
}: {
  /** Already consumed by an inner handler, or still composing (IME). */
  handled: boolean;
  /** A menu, popover or dialog whose own Esc handler runs after this one. */
  overlayOpen: boolean;
  compactDetailOpen: boolean;
}): FilesTabEscapeStep {
  if (handled || overlayOpen) return "ignore";
  return compactDetailOpen ? "close-detail" : "show-console";
}
