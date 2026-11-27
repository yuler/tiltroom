import {
  DIRECTION_VECTORS,
  type Direction,
  type LevelSpec,
} from "./levels";

export interface ParsedLevel {
  width: number;
  height: number;
  walls: ReadonlySet<string>;
  holes: ReadonlySet<string>;
  key: string;
  door: string;
}

export interface GameState {
  mx: number;
  my: number;
  hasKey: boolean;
  crates: readonly string[];
}

export interface SlideFrame extends GameState {
  plugs: readonly string[];
  fall: boolean;
}

export interface TiltOutcome {
  dead: boolean;
  win: boolean;
  moved: boolean;
  frames: readonly SlideFrame[];
  state: GameState;
}

export function cellId(x: number, y: number): string {
  return `${x},${y}`;
}

export function parseLevel(spec: LevelSpec): {
  level: ParsedLevel;
  initialState: GameState;
} {
  const walls = new Set<string>();
  const holes = new Set<string>();
  const crates: string[] = [];
  let mx = 0;
  let my = 0;
  let key = "";
  let door = "";

  const height = spec.grid.length;
  const width = spec.grid[0]?.length ?? 0;

  spec.grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const id = cellId(x, y);
      if (ch === "#") walls.add(id);
      else if (ch === "H") holes.add(id);
      else if (ch === "M") {
        mx = x;
        my = y;
      } else if (ch === "K") key = id;
      else if (ch === "D") door = id;
      else if (ch === "C") crates.push(id);
    });
  });

  return {
    level: { width, height, walls, holes, key, door },
    initialState: { mx, my, hasKey: false, crates },
  };
}

export function tiltDiscrete(
  level: ParsedLevel,
  start: GameState,
  direction: Direction,
): TiltOutcome {
  const [dx, dy] = DIRECTION_VECTORS[direction];
  let mx = start.mx;
  let my = start.my;
  let hasKey = start.hasKey;
  const crates = new Set(start.crates);
  const plugs = new Set<string>();
  const frames: SlideFrame[] = [];

  const pushFrame = (fall: boolean) => {
    frames.push({
      mx,
      my,
      hasKey,
      crates: [...crates],
      plugs: [...plugs],
      fall,
    });
  };

  let guard = 0;
  let anyMoved = false;

  while (guard++ < 48) {
    type Mobile =
      | { kind: "marble"; x: number; y: number }
      | { kind: "crate"; x: number; y: number; id: string };

    const mobiles: Mobile[] = [{ kind: "marble", x: mx, y: my }];
    [...crates].sort().forEach((id) => {
      const [x, y] = id.split(",").map(Number);
      mobiles.push({ kind: "crate", x, y, id });
    });

    // Leading objects along the gravity vector move first.
    mobiles.sort((a, b) => b.x * dx + b.y * dy - (a.x * dx + a.y * dy));

    let stepMoved = false;

    for (const item of mobiles) {
      const nx = item.x + dx;
      const ny = item.y + dy;
      if (nx < 0 || ny < 0 || nx >= level.width || ny >= level.height) {
        continue;
      }

      const nextId = cellId(nx, ny);
      const isSolid =
        level.walls.has(nextId) ||
        (nextId === level.door && !hasKey) ||
        crates.has(nextId) ||
        (nx === mx && ny === my);
      const isOpenHole = level.holes.has(nextId) && !plugs.has(nextId);

      if (item.kind === "marble") {
        if (isOpenHole) {
          mx = nx;
          my = ny;
          anyMoved = true;
          pushFrame(true);
          return {
            dead: true,
            win: false,
            moved: true,
            frames,
            state: { mx, my, hasKey, crates: [...crates] },
          };
        }
        if (isSolid) continue;

        mx = nx;
        my = ny;
        if (nextId === level.key) hasKey = true;
        stepMoved = true;
        anyMoved = true;

        if (nextId === level.door && hasKey) {
          pushFrame(false);
          return {
            dead: false,
            win: true,
            moved: true,
            frames,
            state: { mx, my, hasKey, crates: [...crates] },
          };
        }
      } else {
        if (!crates.has(item.id)) continue;
        if (isOpenHole) {
          crates.delete(item.id);
          plugs.add(nextId);
          stepMoved = true;
          anyMoved = true;
          continue;
        }
        if (isSolid) continue;
        crates.delete(item.id);
        crates.add(nextId);
        stepMoved = true;
        anyMoved = true;
      }
    }

    if (!stepMoved) break;
    pushFrame(false);
  }

  return {
    dead: false,
    win: false,
    moved: anyMoved,
    frames,
    state: { mx, my, hasKey, crates: [...crates] },
  };
}

export function snapVectorToDirection(
  dx: number,
  dy: number,
  deadzone = 12,
): Direction | null {
  if (Math.hypot(dx, dy) < deadzone) return null;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx > 0 ? "right" : "left";
  }
  return dy > 0 ? "down" : "up";
}
