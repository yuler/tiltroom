import { describe, expect, it } from "vitest";
import { parseLevel, snapVectorToDirection, tiltDiscrete } from "./engine";
import { ALL_LEVELS } from "./levels";

describe("tiltDiscrete 4-way gravity engine", () => {
  it("solves all 30 watchOS levels with their official par solutions", () => {
    expect(ALL_LEVELS).toHaveLength(30);

    for (const spec of ALL_LEVELS) {
      const { level, initialState } = parseLevel(spec);
      let current = initialState;
      let won = false;

      expect(spec.solution.length).toBe(spec.par);

      for (const dir of spec.solution) {
        const result = tiltDiscrete(level, current, dir);
        expect(result.dead).toBe(false);
        current = result.state;
        if (result.win) {
          won = true;
          break;
        }
      }

      expect(won).toBe(true);
    }
  });

  it("kills the marble when sliding directly into an open hole", () => {
    const { level, initialState } = parseLevel(ALL_LEVELS[3]);
    const result = tiltDiscrete(level, initialState, "right");
    expect(result.dead).toBe(true);
    expect(result.win).toBe(false);
    expect(result.frames.at(-1)?.fall).toBe(true);
  });

  it("blocks the marble at a locked door until the key is collected", () => {
    const { level, initialState } = parseLevel(ALL_LEVELS[4]);
    const result = tiltDiscrete(level, initialState, "right");
    expect(result.win).toBe(false);
    expect(result.dead).toBe(false);
    expect(result.state.hasKey).toBe(false);
    expect(result.state.mx).toBe(3);
  });

  it("snaps gyroscope drag vectors to the nearest 4-way direction with deadzone", () => {
    expect(snapVectorToDirection(5, 4, 12)).toBeNull();
    expect(snapVectorToDirection(24, 6, 12)).toBe("right");
    expect(snapVectorToDirection(-30, 8, 12)).toBe("left");
    expect(snapVectorToDirection(4, -22, 12)).toBe("up");
    expect(snapVectorToDirection(8, 25, 12)).toBe("down");
  });
});
