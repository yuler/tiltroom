import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { useRef, useState } from "react";
import { snapVectorToDirection } from "@/game/engine";
import { DIRECTION_LABELS, type Direction } from "@/game/levels";
import { cn } from "@/lib/utils";

interface GyroControllerProps {
  aimDirection: Direction | null;
  disabled?: boolean;
  onAimChange: (dir: Direction | null, tiltVector: { x: number; y: number }) => void;
  onTrigger: (dir: Direction) => void;
}

const MAX_OFFSET = 44;

const DIRECTION_OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -MAX_OFFSET * 0.78 },
  right: { x: MAX_OFFSET * 0.78, y: 0 },
  down: { x: 0, y: MAX_OFFSET * 0.78 },
  left: { x: -MAX_OFFSET * 0.78, y: 0 },
};

function GyroIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" strokeOpacity="0.45" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GyroController({
  aimDirection,
  disabled = false,
  onAimChange,
  onTrigger,
}: GyroControllerProps) {
  const padRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    moved: boolean;
    snapped: Direction | null;
  } | null>(null);
  const [puck, setPuck] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  const displayedPuck = dragging
    ? puck
    : aimDirection
      ? DIRECTION_OFFSETS[aimDirection]
      : { x: 0, y: 0 };

  const computeFromPointer = (clientX: number, clientY: number) => {
    const el = padRef.current;
    if (!el) return { x: 0, y: 0, dir: null as Direction | null };
    const rect = el.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, MAX_OFFSET);
    const angle = Math.atan2(dy, dx);
    const x = dist > 0 ? Math.cos(angle) * clamped : 0;
    const y = dist > 0 ? Math.sin(angle) * clamped : 0;
    const dir = snapVectorToDirection(dx, dy, 14);
    return { x, y, dir };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    if ((e.target as HTMLElement).closest("button[data-sector]")) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    const next = computeFromPointer(e.clientX, e.clientY);
    dragRef.current = {
      pointerId: e.pointerId,
      moved: Math.hypot(next.x, next.y) >= 14,
      snapped: next.dir,
    };
    setDragging(true);
    setPuck({ x: next.x, y: next.y });
    if (next.dir) {
      onAimChange(next.dir, {
        x: next.x / MAX_OFFSET,
        y: next.y / MAX_OFFSET,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || dragRef.current.pointerId !== e.pointerId) return;
    const next = computeFromPointer(e.clientX, e.clientY);
    if (Math.hypot(next.x, next.y) >= 14) {
      dragRef.current.moved = true;
    }
    dragRef.current.snapped = next.dir;
    setPuck({ x: next.x, y: next.y });
    onAimChange(next.dir, {
      x: next.x / MAX_OFFSET,
      y: next.y / MAX_OFFSET,
    });
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setDragging(false);
    setPuck({ x: 0, y: 0 });

    if (drag.moved && drag.snapped) {
      onTrigger(drag.snapped);
    } else if (!drag.moved && aimDirection) {
      onTrigger(aimDirection);
    } else {
      onAimChange(null, { x: 0, y: 0 });
    }
  };

  const handleSectorClick = (dir: Direction) => {
    if (disabled) return;
    if (aimDirection === dir) {
      onTrigger(dir);
      return;
    }
    const off = DIRECTION_OFFSETS[dir];
    onAimChange(dir, { x: off.x / MAX_OFFSET, y: off.y / MAX_OFFSET });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <span className="inline-block h-2 w-2 rounded-full bg-[#e7c27a]" />
        <span>
          {aimDirection
            ? `已瞄准「${DIRECTION_LABELS[aimDirection]}」· 松手或点落下释放`
            : "拖拽陀螺仪瞄准，松手触发滑落"}
        </span>
      </div>

      {/* Circular 3D Gyroscope Control Ring */}
      <div
        ref={padRef}
        role="group"
        aria-label="重力陀螺仪控制器"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className={cn(
          "relative flex h-56 w-56 touch-none select-none items-center justify-center rounded-full border border-[#e7c27a]/35 bg-gradient-to-b from-[#fbfaf7] to-[#efeae0] shadow-[inset_0_2px_6px_rgba(255,255,255,0.95),0_16px_38px_rgba(20,17,14,0.08)] transition-shadow",
          dragging
            ? "cursor-grabbing shadow-[inset_0_2px_6px_rgba(255,255,255,0.95),0_20px_44px_rgba(231,194,122,0.28)]"
            : "cursor-grab",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <div className="pointer-events-none absolute inset-3 rounded-full border border-dashed border-[#b6985a]/35" />
        <div className="pointer-events-none absolute inset-11 rounded-full border border-[#b6985a]/20 bg-[#f7f4ec]/90 shadow-inner" />

        {aimDirection && (
          <div
            className={cn(
              "pointer-events-none absolute h-16 w-16 rounded-full bg-[#e7c27a]/45 blur-xl transition-all duration-150",
              aimDirection === "up" && "-top-1",
              aimDirection === "down" && "-bottom-1",
              aimDirection === "left" && "-left-1",
              aimDirection === "right" && "-right-1",
            )}
          />
        )}

        {/* 4 Clickable Direction Sectors */}
        <button
          type="button"
          data-sector="up"
          aria-label="向上瞄准"
          onClick={() => handleSectorClick("up")}
          className={cn(
            "absolute top-2.5 left-1/2 -translate-x-1/2 flex h-9 w-12 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer",
            aimDirection === "up"
              ? "bg-[#e7c27a] text-[#14110e] shadow-sm scale-105"
              : "text-[#6c604e] hover:bg-[#e7c27a]/20 hover:text-[#14110e]",
          )}
        >
          <ArrowUp className="h-4 w-4" />
        </button>

        <button
          type="button"
          data-sector="right"
          aria-label="向右瞄准"
          onClick={() => handleSectorClick("right")}
          className={cn(
            "absolute right-2.5 top-1/2 -translate-y-1/2 flex h-12 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer",
            aimDirection === "right"
              ? "bg-[#e7c27a] text-[#14110e] shadow-sm scale-105"
              : "text-[#6c604e] hover:bg-[#e7c27a]/20 hover:text-[#14110e]",
          )}
        >
          <ArrowRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          data-sector="down"
          aria-label="向下瞄准"
          onClick={() => handleSectorClick("down")}
          className={cn(
            "absolute bottom-2.5 left-1/2 -translate-x-1/2 flex h-9 w-12 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer",
            aimDirection === "down"
              ? "bg-[#e7c27a] text-[#14110e] shadow-sm scale-105"
              : "text-[#6c604e] hover:bg-[#e7c27a]/20 hover:text-[#14110e]",
          )}
        >
          <ArrowDown className="h-4 w-4" />
        </button>

        <button
          type="button"
          data-sector="left"
          aria-label="向左瞄准"
          onClick={() => handleSectorClick("left")}
          className={cn(
            "absolute left-2.5 top-1/2 -translate-y-1/2 flex h-12 w-9 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer",
            aimDirection === "left"
              ? "bg-[#e7c27a] text-[#14110e] shadow-sm scale-105"
              : "text-[#6c604e] hover:bg-[#e7c27a]/20 hover:text-[#14110e]",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Tactile Gyroscope Thumb Puck (Warm Gold / Obsidian Tiltroom Theme) */}
        <div
          style={{
            transform: `translate3d(${displayedPuck.x}px, ${displayedPuck.y}px, 0)`,
          }}
          className={cn(
            "relative z-10 flex h-20 w-20 flex-col items-center justify-center rounded-full border transition-all",
            dragging ? "duration-0 scale-105" : "duration-200 ease-out",
            aimDirection
              ? "border-[#f3d89c] bg-gradient-to-b from-[#f0cf88] to-[#cfa34f] text-[#14110e] shadow-[0_12px_28px_rgba(207,163,79,0.45)]"
              : "border-[#e7c27a]/65 bg-gradient-to-b from-[#2b241a] to-[#14110e] text-[#e7c27a] shadow-[0_10px_24px_rgba(20,17,14,0.28)]",
          )}
        >
          <GyroIcon className="h-6 w-6" />
          <span className="mt-0.5 text-[11px] font-bold tracking-wider">
            {aimDirection ? "落下" : "陀螺"}
          </span>
        </div>
      </div>

      <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
        支持拖拽松手 · 单击方向后再点落下 · 键盘方向键 + 空格
      </p>
    </div>
  );
}
