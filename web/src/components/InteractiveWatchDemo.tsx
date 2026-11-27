import {
  Check,
  ChevronLeft,
  ChevronRight,
  Grid2x2,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GyroController } from "@/components/GyroController";
import { shouldInterceptActivationKey } from "@/components/watchDemoInteraction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type GameState,
  parseLevel,
  snapVectorToDirection,
  tiltDiscrete,
} from "@/game/engine";
import { ALL_LEVELS, DIRECTION_ARROWS, type Direction } from "@/game/levels";
import { drawWatchBoard } from "@/game/renderer";
import { loadStoredProgress, saveStoredProgress } from "@/game/storage";
import { cn } from "@/lib/utils";

const BOARD_W = 420;
const BOARD_H = 384;

export function InteractiveWatchDemo() {
  const initialProgress = useMemo(() => loadStoredProgress(), []);
  const [levelIdx, setLevelIdx] = useState(initialProgress.levelIdx);
  const spec = ALL_LEVELS[levelIdx];
  const parsed = useMemo(() => parseLevel(spec), [spec]);

  const [gameState, setGameState] = useState<GameState>(parsed.initialState);
  const [history, setHistory] = useState<GameState[]>([]);
  const [moves, setMoves] = useState(0);
  const [aimDirection, setAimDirection] = useState<Direction | null>(null);
  const [tiltVector, setTiltVector] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"playing" | "dead" | "won">("playing");
  const [buzz, setBuzz] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [clearedIds, setClearedIds] = useState<number[]>(initialProgress.clearedIds);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    saveStoredProgress({ levelIdx, clearedIds });
  }, [levelIdx, clearedIds]);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const flashBanner = useCallback((text: string, duration = 1500) => {
    setBanner(text);
    const id = window.setTimeout(() => setBanner(null), duration);
    timersRef.current.push(id);
  }, []);

  const loadLevel = useCallback(
    (index: number) => {
      clearTimers();
      const target = ALL_LEVELS[index];
      const next = parseLevel(target);
      setLevelIdx(index);
      setGameState(next.initialState);
      setHistory([]);
      setMoves(0);
      setAimDirection(null);
      setTiltVector({ x: 0, y: 0 });
      setBusy(false);
      setMode("playing");
      setBuzz(false);
      setBanner(null);
      setPickerOpen(false);
    },
    [clearTimers],
  );

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawWatchBoard(ctx, {
      level: parsed.level,
      state: gameState,
      aimDirection,
      tiltIntensity: Math.min(1, Math.hypot(tiltVector.x, tiltVector.y)),
      fall: mode === "dead",
    });
  }, [parsed.level, gameState, aimDirection, tiltVector, mode]);

  const handleUndo = useCallback(() => {
    if (busy || history.length === 0) return;
    clearTimers();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setGameState(prev);
    setMoves((m) => Math.max(0, m - 1));
    setMode("playing");
    setBuzz(false);
    setBanner(null);
    setAimDirection(null);
    setTiltVector({ x: 0, y: 0 });
  }, [busy, history, clearTimers]);

  const executeShutter = useCallback(
    (dir: Direction) => {
      if (busy || mode !== "playing") return;

      const outcome = tiltDiscrete(parsed.level, gameState, dir);
      setAimDirection(null);
      setTiltVector({ x: 0, y: 0 });

      if (!outcome.moved || outcome.frames.length === 0) {
        flashBanner("被挡住了", 900);
        return;
      }

      setBusy(true);
      setBanner(null);
      setHistory((prev) => [...prev, gameState]);
      setMoves((m) => m + 1);

      const frameMs = 56;
      outcome.frames.forEach((frame, idx) => {
        const id = window.setTimeout(() => {
          setGameState({
            mx: frame.mx,
            my: frame.my,
            hasKey: frame.hasKey,
            crates: frame.crates,
          });
          if (frame.fall) setMode("dead");
        }, idx * frameMs);
        timersRef.current.push(id);
      });

      const finishId = window.setTimeout(() => {
        setBusy(false);
        if (outcome.dead) {
          setMode("dead");
          setBuzz(true);
          setBanner("掉进洞了");
          const unbuzz = window.setTimeout(() => setBuzz(false), 450);
          timersRef.current.push(unbuzz);
          return;
        }

        if (outcome.win) {
          setMode("won");
          setClearedIds((prev) =>
            prev.includes(spec.id) ? prev : [...prev, spec.id],
          );
          setBanner(levelIdx < ALL_LEVELS.length - 1 ? "过关！" : "全部 30 关通关！");
          if (levelIdx < ALL_LEVELS.length - 1) {
            const nextId = window.setTimeout(() => {
              loadLevel(levelIdx + 1);
            }, 950);
            timersRef.current.push(nextId);
          }
        }
      }, outcome.frames.length * frameMs + 20);
      timersRef.current.push(finishId);
    },
    [busy, mode, parsed.level, gameState, spec.id, levelIdx, flashBanner, loadLevel],
  );

  // Keyboard support when stage is focused (Arrow keys / WASD to aim, Space/Enter to trigger)
  useEffect(() => {
    if (!isFocused) return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        w: "up",
        W: "up",
        ArrowRight: "right",
        d: "right",
        D: "right",
        ArrowDown: "down",
        s: "down",
        S: "down",
        ArrowLeft: "left",
        a: "left",
        A: "left",
      };

      const mapped = keyMap[e.key];
      if (mapped) {
        e.preventDefault();
        if (busy || mode !== "playing") return;
        const vec: Record<Direction, { x: number; y: number }> = {
          up: { x: 0, y: -0.8 },
          right: { x: 0.8, y: 0 },
          down: { x: 0, y: 0.8 },
          left: { x: -0.8, y: 0 },
        };
        setAimDirection(mapped);
        setTiltVector(vec[mapped]);
        return;
      }

      if ((e.key === " " || e.key === "Enter") && !busy) {
        if (!shouldInterceptActivationKey(e.target)) {
          return;
        }
        if (mode === "dead") {
          e.preventDefault();
          handleUndo();
        } else if (aimDirection && mode === "playing") {
          e.preventDefault();
          executeShutter(aimDirection);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFocused, aimDirection, busy, mode, executeShutter, handleUndo]);

  const handleBoardPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    stageRef.current?.focus({ preventScroll: true });
    if (busy) return;
    swipeStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleBoardPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy) return;
    const start = swipeStartRef.current;
    swipeStartRef.current = null;

    if (mode === "dead") {
      handleUndo();
      return;
    }

    if (mode === "won") {
      if (levelIdx < ALL_LEVELS.length - 1) loadLevel(levelIdx + 1);
      return;
    }

    if (start) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const swipeDir = snapVectorToDirection(dx, dy, 24);
      if (swipeDir) {
        executeShutter(swipeDir);
        return;
      }
    }

    if (aimDirection) {
      executeShutter(aimDirection);
    } else {
      flashBanner("先倾腕瞄准", 1000);
    }
  };

  const rotateY = tiltVector.x * 16;
  const rotateX = -tiltVector.y * 16;

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
      onPointerDown={() => stageRef.current?.focus({ preventScroll: true })}
      className={cn(
        "relative rounded-[36px] border bg-white/90 p-6 backdrop-blur-md transition-all duration-200 outline-none sm:p-9",
        isFocused
          ? "border-[#e7c27a] ring-4 ring-[#e7c27a]/22 shadow-[0_24px_70px_rgba(207,163,79,0.16)]"
          : "border-black/8 shadow-[0_24px_70px_rgba(0,0,0,0.07)]",
      )}
    >
      {/* Top Level Bar (all 30 levels) */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-5">
        <div className="flex items-center gap-2.5">
          <Badge variant="gold">实机同款 30 关</Badge>
          <span className="text-sm font-semibold text-foreground">
            第 {spec.id} / {ALL_LEVELS.length} 关 · {spec.name}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLevel(Math.max(0, levelIdx - 1))}
            disabled={levelIdx === 0}
            aria-label="上一关"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={pickerOpen ? "dark" : "outline"}
            size="sm"
            onClick={() => setPickerOpen((v) => !v)}
          >
            <Grid2x2 className="h-3.5 w-3.5" />
            <span>全部 30 关 ({clearedIds.length}/30)</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLevel(Math.min(ALL_LEVELS.length - 1, levelIdx + 1))}
            disabled={levelIdx === ALL_LEVELS.length - 1}
            aria-label="下一关"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Collapsible 30-level Grid Picker */}
      {pickerOpen && (
        <div className="mb-7 rounded-2xl border border-border/80 bg-[#f5f5f7] p-4">
          <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
            {ALL_LEVELS.map((lv, idx) => {
              const isActive = idx === levelIdx;
              const isCleared = clearedIds.includes(lv.id);
              return (
                <button
                  key={lv.id}
                  type="button"
                  onClick={() => loadLevel(idx)}
                  title={`第 ${lv.id} 关 · ${lv.name}（标准 ${lv.par} 步）`}
                  className={cn(
                    "flex h-9 items-center justify-center gap-0.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                    isActive
                      ? "bg-[#14110e] text-[#e7c27a] shadow-xs"
                      : isCleared
                        ? "bg-[#e7c27a]/25 text-[#7c5c1f] hover:bg-[#e7c27a]/40"
                        : "bg-white text-muted-foreground hover:bg-black/5 hover:text-foreground",
                  )}
                >
                  {isCleared && !isActive && <Check className="h-3 w-3" />}
                  <span>{lv.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Stage: Authentic Apple Watch UI on left, Gyroscope Controller on right */}
      <div className="flex flex-col items-center justify-center gap-9 lg:flex-row lg:items-center lg:gap-12">
        {/* Large Apple Watch Hardware Chassis */}
        <div
          className="relative flex items-center justify-center"
          style={{ perspective: "900px" }}
        >
          <div className="pointer-events-none absolute -bottom-7 h-10 w-64 rounded-full bg-black/18 blur-2xl" />

          <div
            className={cn(
              "relative transition-transform duration-200 ease-out",
              buzz && "animate-watch-buzz",
            )}
            style={{
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Outer Metallic Case */}
            <div
              className={cn(
                "relative h-[404px] w-[328px] rounded-[78px] bg-gradient-to-br from-[#e7e5e0] via-[#a7a39b] to-[#43403c] p-[15px] transition-shadow duration-200 sm:h-[432px] sm:w-[352px] sm:rounded-[84px] sm:p-[17px]",
                isFocused
                  ? "ring-2 ring-[#e7c27a]/80 shadow-[0_32px_64px_rgba(207,163,79,0.28),inset_0_2px_1px_rgba(255,255,255,0.85),inset_0_-8px_18px_rgba(0,0,0,0.3)]"
                  : "shadow-[0_32px_64px_rgba(0,0,0,0.28),inset_0_2px_1px_rgba(255,255,255,0.85),inset_0_-8px_18px_rgba(0,0,0,0.3)]",
              )}
            >
              {/* Inner watchOS Screen matching GameView.swift */}
              <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[62px] bg-[#14110e] px-3 pt-4 pb-4 shadow-[inset_0_0_0_2.5px_#0b0a09] select-none sm:rounded-[66px] sm:px-3.5 sm:pt-4.5 sm:pb-4.5">
                {/* watchOS Header Bar (mirrors GameView.headerBar) */}
                <div className="flex items-center justify-between px-2 pb-1.5">
                  <button
                    type="button"
                    onClick={() => setPickerOpen((v) => !v)}
                    className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 transition-colors hover:bg-white/15 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-[#e7c27a]">
                      {spec.id}
                    </span>
                    <span className="max-w-[110px] truncate text-[12px] font-medium text-white/90">
                      {spec.name}
                    </span>
                  </button>

                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      moves <= spec.par ? "text-[#e7c27a]" : "text-white/50",
                    )}
                  >
                    {moves}/{spec.par}
                  </span>
                </div>

                {/* watchOS Board Area (mirrors BoardCanvasView.swift) */}
                <div
                  onPointerDown={handleBoardPointerDown}
                  onPointerUp={handleBoardPointerUp}
                  className="relative flex flex-1 items-center justify-center cursor-pointer touch-none"
                >
                  <canvas
                    ref={canvasRef}
                    width={BOARD_W}
                    height={BOARD_H}
                    className="block h-full w-full object-contain"
                  />

                  {banner && (
                    <div className="pointer-events-none absolute rounded-full bg-[#e7c27a]/95 px-3.5 py-1 text-xs font-semibold text-[#1a140d] shadow-md">
                      {banner}
                    </div>
                  )}
                </div>

                {/* watchOS Footer Bar (mirrors GameView.footerBar) */}
                <div className="flex items-center gap-1.5 px-2 pt-1.5">
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={busy || history.length === 0}
                    aria-label="退一步"
                    className={cn(
                      "flex h-8 w-10 items-center justify-center rounded-full transition-colors cursor-pointer",
                      history.length > 0
                        ? "bg-white/14 text-white hover:bg-white/22"
                        : "bg-white/5 text-white/30 cursor-not-allowed",
                    )}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </button>

                  {mode === "dead" ? (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="flex h-8 flex-1 items-center justify-center rounded-full bg-[#e7c27a] text-xs font-bold text-[#1a140d] transition-opacity hover:opacity-90 cursor-pointer"
                    >
                      退一步
                    </button>
                  ) : aimDirection && mode === "playing" ? (
                    <button
                      type="button"
                      onClick={() => executeShutter(aimDirection)}
                      className="flex h-8 flex-1 items-center justify-center rounded-full bg-[#e7c27a] text-xs font-bold text-[#1a140d] transition-opacity hover:opacity-90 cursor-pointer"
                    >
                      {DIRECTION_ARROWS[aimDirection]} 落下
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => flashBanner("拖动右侧陀螺或直接滑动表盘", 1200)}
                      className="flex h-8 flex-1 items-center justify-center rounded-full bg-white/8 text-[11px] font-medium text-white/72 transition-colors hover:bg-white/14 cursor-pointer"
                    >
                      倾腕/滑动
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => loadLevel(levelIdx)}
                    disabled={busy}
                    aria-label="重来"
                    className="flex h-8 w-10 items-center justify-center rounded-full bg-white/14 text-white transition-colors hover:bg-white/22 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Subtle sapphire glass specular highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-[62px] bg-gradient-to-tr from-transparent via-white/[0.02] to-white/[0.07] sm:rounded-[66px]" />
              </div>

              {/* Digital Crown */}
              <div
                aria-hidden="true"
                className="absolute -right-[14px] top-[90px] h-[80px] w-[16px] rounded-r-[6px] border border-black/20 shadow-[inset_-2px_0_3px_rgba(0,0,0,0.35),2px_4px_10px_rgba(0,0,0,0.2)]"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, #f5f2ec 0 3px, #8c877f 3px 5px)",
                }}
              />

              {/* Side Button */}
              <div
                aria-hidden="true"
                className="absolute -right-[10px] top-[200px] h-[54px] w-[11px] rounded-r-[5px] bg-gradient-to-b from-[#d8d3ca] to-[#746f68] shadow-[2px_3px_8px_rgba(0,0,0,0.2)]"
              />
            </div>
          </div>
        </div>

        {/* Right Side: Tactile Gyroscope Controller */}
        <div className="flex w-full max-w-[300px] flex-col items-center">
          <GyroController
            aimDirection={aimDirection}
            disabled={busy || mode !== "playing"}
            onAimChange={(dir, vec) => {
              setAimDirection(dir);
              setTiltVector(vec);
            }}
            onTrigger={executeShutter}
          />

          <button
            type="button"
            onClick={() => stageRef.current?.focus({ preventScroll: true })}
            className={cn(
              "mt-5 w-full rounded-2xl border px-4 py-3.5 text-left text-xs leading-6 transition-all cursor-pointer",
              isFocused
                ? "border-[#e7c27a]/80 bg-[#fbf6ea] text-[#5c4418] shadow-[0_6px_18px_rgba(231,194,122,0.22)]"
                : "border-border/80 bg-[#f5f5f7] text-muted-foreground hover:border-[#e7c27a]/45",
            )}
          >
            <div className="mb-1 flex items-center gap-2 font-semibold">
              <span
                className={cn(
                  "inline-block h-2 w-2 rounded-full transition-colors",
                  isFocused
                    ? "bg-[#cfa34f] shadow-[0_0_8px_rgba(207,163,79,0.9)]"
                    : "bg-black/20",
                )}
              />
              <span className={isFocused ? "text-[#1d1d1f]" : "text-foreground"}>
                {isFocused ? "已聚焦 · 操控已激活" : "点击表盘聚焦 · 启用键盘操控"}
              </span>
            </div>
            <p>
              聚焦时可直接在表盘上滑动（Swipe）操作，也支持键盘 ↑ ↓ ← → 方向键瞄准、空格键落下。
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
