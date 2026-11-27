import { ALL_LEVELS } from "./levels";

const STORAGE_KEY = "tiltroom:web:progress:v1";

export interface StoredProgress {
  levelIdx: number;
  clearedIds: number[];
}

export function loadStoredProgress(): StoredProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { levelIdx: 0, clearedIds: [] };
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;

    const validIds = new Set(ALL_LEVELS.map((lv) => lv.id));
    const clearedIds = Array.isArray(parsed.clearedIds)
      ? [...new Set(parsed.clearedIds.filter((id): id is number => typeof id === "number" && validIds.has(id)))]
      : [];

    const levelIdx =
      typeof parsed.levelIdx === "number" &&
      Number.isInteger(parsed.levelIdx) &&
      parsed.levelIdx >= 0 &&
      parsed.levelIdx < ALL_LEVELS.length
        ? parsed.levelIdx
        : 0;

    return { levelIdx, clearedIds };
  } catch {
    return { levelIdx: 0, clearedIds: [] };
  }
}

export function saveStoredProgress(progress: StoredProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota or private-mode restrictions.
  }
}
