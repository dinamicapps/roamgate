// Holding a path drag over a console tab switches to it, as browsers do with
// their tabs, so the path can be dropped on a terminal hidden behind another
// surface.
export const DRAG_HOVER_ACTIVATE_MS = 500;

type TimerHandle = ReturnType<typeof setTimeout>;

export interface DragHoverActivatorOptions {
  delayMs?: number;
  onActivate: (tabId: string) => void;
  schedule?: (callback: () => void, delayMs: number) => TimerHandle;
  cancel?: (handle: TimerHandle) => void;
}

export interface DragHoverActivator {
  /** Repeated on every dragover; only a new target restarts the delay. */
  hover(tabId: string): void;
  leave(tabId: string): void;
  cancel(): void;
}

export function createDragHoverActivator({
  delayMs = DRAG_HOVER_ACTIVATE_MS,
  onActivate,
  schedule = (callback, delay) => setTimeout(callback, delay),
  cancel: cancelTimer = (handle) => clearTimeout(handle),
}: DragHoverActivatorOptions): DragHoverActivator {
  let target: string | null = null;
  let timer: TimerHandle | null = null;

  const cancel = () => {
    if (timer !== null) cancelTimer(timer);
    timer = null;
    target = null;
  };

  return {
    hover(tabId) {
      if (target === tabId) return;
      cancel();
      target = tabId;
      timer = schedule(() => {
        timer = null;
        // The target stays set so a lingering hover does not re-arm it.
        onActivate(tabId);
      }, delayMs);
    },
    leave(tabId) {
      if (target === tabId) cancel();
    },
    cancel,
  };
}

/** Mobile hides the strip without a real choice; files tabs are not one. */
export function showsTabStrip(mobile: boolean, consoleTabCount: number) {
  return !mobile || consoleTabCount > 1;
}
