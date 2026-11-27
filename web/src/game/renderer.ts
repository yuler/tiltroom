import type { GameState, ParsedLevel } from "./engine";
import type { Direction } from "./levels";

export interface RenderOptions {
  level: ParsedLevel;
  state: GameState;
  aimDirection: Direction | null;
  tiltIntensity?: number;
  fall?: boolean;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Mirrors watch/Tiltroom/UI/BoardCanvasView.swift colors, proportions,
 * hole warning rim, diagonal key, gold marble, and active gravity edge bar.
 */
export function drawWatchBoard(
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
) {
  const { level, state, aimDirection, tiltIntensity = 1, fall = false } =
    options;
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#14110e";
  ctx.fillRect(0, 0, width, height);

  const edgePad = 6;
  const availW = Math.max(1, width - edgePad * 2);
  const availH = Math.max(1, height - edgePad * 2);
  const cell = Math.min(availW / level.width, availH / level.height);
  const boardW = cell * level.width;
  const boardH = cell * level.height;
  const ox = (width - boardW) / 2;
  const oy = (height - boardH) / 2;

  // Board backdrop (rgb 0.055, 0.047, 0.043)
  roundRect(ctx, ox, oy, boardW, boardH, 8);
  ctx.fillStyle = "#0e0c0b";
  ctx.fill();

  const crateSet = new Set(state.crates);

  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      const id = `${x},${y}`;
      const px = ox + x * cell;
      const py = oy + y * cell;

      if (level.walls.has(id)) {
        // Wall (rgb 0.255, 0.230, 0.196) + subtle top bevel
        ctx.fillStyle = "#413b32";
        ctx.fillRect(px, py, cell, cell);
        ctx.fillStyle = "rgba(87, 77, 65, 0.75)";
        ctx.fillRect(px + 1, py + 1, Math.max(0, cell - 2), 2.5);
        continue;
      }

      // Floor tile (rgb 0.118, 0.104, 0.090)
      ctx.fillStyle = "#1e1b17";
      ctx.fillRect(px + 0.7, py + 0.7, cell - 1.4, cell - 1.4);

      // Hole with crimson pit + coral-red warning rim
      if (level.holes.has(id)) {
        const cx = px + cell * 0.5;
        const cy = py + cell * 0.5;
        const holeR = cell * 0.38;
        const isFallenHere = fall && state.mx === x && state.my === y;

        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, holeR);
        g.addColorStop(0, "#000000");
        g.addColorStop(1, "#38130e");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, holeR, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isFallenHere
          ? "rgba(255, 97, 66, 1)"
          : "rgba(224, 107, 71, 0.88)";
        ctx.lineWidth = Math.max(2.4, cell * (isFallenHere ? 0.11 : 0.085));
        ctx.beginPath();
        ctx.arc(cx, cy, holeR, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Door
      if (id === level.door) {
        roundRect(
          ctx,
          px + cell * 0.22,
          py + cell * 0.12,
          cell * 0.56,
          cell * 0.76,
          6,
        );
        ctx.fillStyle = state.hasKey ? "#d7b56a" : "#6d6458";
        ctx.fill();

        ctx.fillStyle = "#19140d";
        ctx.beginPath();
        ctx.arc(px + cell * 0.5, py + cell * 0.48, cell * 0.085, 0, Math.PI * 2);
        ctx.fill();
      }

      // Diagonal Key (exact watchOS BoardCanvasView geometry)
      if (id === level.key && !state.hasKey) {
        const strokeW = Math.max(2.6, cell * 0.08);
        ctx.strokeStyle = "#e7c27a";
        ctx.lineWidth = strokeW;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.arc(px + cell * 0.4, py + cell * 0.38, cell * 0.13, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(px + cell * 0.5, py + cell * 0.48);
        ctx.lineTo(px + cell * 0.72, py + cell * 0.7);
        ctx.moveTo(px + cell * 0.61, py + cell * 0.6);
        ctx.lineTo(px + cell * 0.7, py + cell * 0.55);
        ctx.stroke();
      }

      // Crate (rgb 0.545, 0.353, 0.196)
      if (crateSet.has(id)) {
        roundRect(
          ctx,
          px + cell * 0.14,
          py + cell * 0.14,
          cell * 0.72,
          cell * 0.72,
          6,
        );
        ctx.fillStyle = "#8b5a32";
        ctx.fill();
        ctx.strokeStyle = "rgba(173, 120, 71, 0.85)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  // Marble (watchOS gold #e7c27a + inner #fff4d2 ring when holding key)
  const mx = ox + (state.mx + 0.5) * cell;
  const my = oy + (state.my + 0.5) * cell;
  const mr = cell * (fall ? 0.22 : 0.3);

  ctx.fillStyle = fall ? "rgba(245, 199, 117, 0.82)" : "#e7c27a";
  ctx.beginPath();
  ctx.arc(mx, my, mr, 0, Math.PI * 2);
  ctx.fill();

  if (fall) {
    const cross = mr * 0.55;
    ctx.strokeStyle = "#240a08";
    ctx.lineWidth = Math.max(2.6, cell * 0.085);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(mx - cross, my - cross);
    ctx.lineTo(mx + cross, my + cross);
    ctx.moveTo(mx + cross, my - cross);
    ctx.lineTo(mx - cross, my + cross);
    ctx.stroke();
  } else if (state.hasKey) {
    ctx.strokeStyle = "#fff4d2";
    ctx.lineWidth = Math.max(2.4, cell * 0.08);
    ctx.beginPath();
    ctx.arc(mx, my, cell * 0.16, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Active gravity edge glow bar inset along the board edge (matches watchOS)
  if (aimDirection) {
    const glowAlpha = 0.62 + 0.38 * Math.min(1, Math.max(0, tiltIntensity));
    const barThickness = 7;
    const inset = 2;
    const spanInset = 12;
    ctx.fillStyle = `rgba(231, 194, 122, ${glowAlpha})`;

    if (aimDirection === "up") {
      roundRect(ctx, ox + spanInset, oy + inset, Math.max(0, boardW - spanInset * 2), barThickness, 3.5);
    } else if (aimDirection === "down") {
      roundRect(ctx, ox + spanInset, oy + boardH - barThickness - inset, Math.max(0, boardW - spanInset * 2), barThickness, 3.5);
    } else if (aimDirection === "left") {
      roundRect(ctx, ox + inset, oy + spanInset, barThickness, Math.max(0, boardH - spanInset * 2), 3.5);
    } else {
      roundRect(ctx, ox + boardW - barThickness - inset, oy + spanInset, barThickness, Math.max(0, boardH - spanInset * 2), 3.5);
    }
    ctx.fill();
  }
}
