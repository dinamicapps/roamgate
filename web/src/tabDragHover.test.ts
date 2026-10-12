import { describe, expect, test } from "bun:test";
import {
  createDragHoverActivator,
  DRAG_HOVER_ACTIVATE_MS,
  showsTabStrip,
} from "./tabDragHover";

function fakeTimers() {
  let next = 1;
  const pending = new Map<number, { callback: () => void; delay: number }>();
  return {
    schedule: (callback: () => void, delay: number) => {
      const id = next++;
      pending.set(id, { callback, delay });
      return id as unknown as ReturnType<typeof setTimeout>;
    },
    cancel: (handle: ReturnType<typeof setTimeout>) => {
      pending.delete(handle as unknown as number);
    },
    pending,
    fire() {
      const entries = [...pending.entries()];
      pending.clear();
      for (const [, { callback }] of entries) callback();
    },
  };
}

function setup() {
  const timers = fakeTimers();
  const activated: string[] = [];
  const activator = createDragHoverActivator({
    onActivate: (tabId) => activated.push(tabId),
    schedule: timers.schedule,
    cancel: timers.cancel,
  });
  return { timers, activated, activator };
}

describe("drag hover over console tabs", () => {
  test("activates the hovered tab after the hold delay", () => {
    const { timers, activated, activator } = setup();
    activator.hover("t1");
    expect(activated).toEqual([]);
    expect([...timers.pending.values()][0]?.delay).toBe(DRAG_HOVER_ACTIVATE_MS);
    timers.fire();
    expect(activated).toEqual(["t1"]);
  });

  test("repeated dragover on the same tab keeps a single timer", () => {
    const { timers, activated, activator } = setup();
    activator.hover("t1");
    activator.hover("t1");
    activator.hover("t1");
    expect(timers.pending.size).toBe(1);
    timers.fire();
    activator.hover("t1");
    expect(timers.pending.size).toBe(0);
    expect(activated).toEqual(["t1"]);
  });

  test("moving to another tab restarts the delay for it", () => {
    const { timers, activated, activator } = setup();
    activator.hover("t1");
    activator.hover("t2");
    expect(timers.pending.size).toBe(1);
    timers.fire();
    expect(activated).toEqual(["t2"]);
  });

  test("leaving or cancelling before the delay activates nothing", () => {
    const { timers, activated, activator } = setup();
    activator.hover("t1");
    activator.leave("t1");
    activator.hover("t2");
    activator.cancel();
    timers.fire();
    expect(activated).toEqual([]);
  });

  test("leaving a tab that is not the target keeps the pending one", () => {
    const { timers, activated, activator } = setup();
    activator.hover("t2");
    activator.leave("t1");
    timers.fire();
    expect(activated).toEqual(["t2"]);
  });

  test("re-entering after leaving arms the tab again", () => {
    const { timers, activated, activator } = setup();
    activator.hover("t1");
    timers.fire();
    activator.leave("t1");
    activator.hover("t1");
    timers.fire();
    expect(activated).toEqual(["t1", "t1"]);
  });
});

describe("tab strip visibility", () => {
  test("desktop always shows the strip", () => {
    expect(showsTabStrip(false, 1)).toBe(true);
  });

  test("mobile shows it only with more than one console", () => {
    expect(showsTabStrip(true, 1)).toBe(false);
    expect(showsTabStrip(true, 2)).toBe(true);
  });
});
