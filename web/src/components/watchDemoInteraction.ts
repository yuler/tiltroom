import type { Direction } from "@/game/levels";

export type PointerReleaseOutcome =
  | { action: "trigger"; dir: Direction }
  | { action: "reset" };

export function resolvePointerRelease(
  drag: { moved: boolean; snapped: Direction | null },
  aimDirection: Direction | null,
  canceled: boolean,
): PointerReleaseOutcome {
  if (canceled) {
    return { action: "reset" };
  }
  if (drag.moved && drag.snapped) {
    return { action: "trigger", dir: drag.snapped };
  }
  if (!drag.moved && aimDirection) {
    return { action: "trigger", dir: aimDirection };
  }
  return { action: "reset" };
}

interface KeyTargetLike {
  tagName?: string;
  closest?: (selector: string) => unknown;
}

export function shouldInterceptActivationKey(
  target: EventTarget | KeyTargetLike | null,
): boolean {
  if (!target || typeof target !== "object") {
    return true;
  }
  const el = target as KeyTargetLike;
  if (el.tagName && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) {
    return false;
  }
  if (typeof el.closest === "function" && el.closest("button, a")) {
    return false;
  }
  return true;
}
