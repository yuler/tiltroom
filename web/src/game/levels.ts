export type Direction = "up" | "right" | "down" | "left";

export interface LevelSpec {
  id: number;
  name: string;
  par: number;
  grid: readonly string[];
  solution: readonly Direction[];
}

export const DIRECTION_LABELS: Record<Direction, string> = {
  up: "上",
  right: "右",
  down: "下",
  left: "左",
};

export const DIRECTION_ARROWS: Record<Direction, string> = {
  up: "↑",
  right: "→",
  down: "↓",
  left: "←",
};

export const DIRECTION_VECTORS: Record<Direction, readonly [number, number]> = {
  up: [0, -1],
  right: [1, 0],
  down: [0, 1],
  left: [-1, 0],
};

// Mirrors watch/Tiltroom/Engine/LevelCatalog.swift (all 30 levels).
export const ALL_LEVELS: readonly LevelSpec[] = [
  { id: 1, name: "直走", par: 1, grid: ["#####", "#MKD#", "#####"], solution: ["right"] },
  { id: 2, name: "拐弯", par: 2, grid: ["#####", "#M..#", "#K.D#", "#####"], solution: ["down", "right"] },
  { id: 3, name: "再拐", par: 2, grid: ["#####", "#.MK#", "#..D#", "#####"], solution: ["right", "down"] },
  { id: 4, name: "前面是洞", par: 2, grid: ["######", "#M.H.#", "#K..D#", "######"], solution: ["down", "right"] },
  { id: 5, name: "门挡住", par: 3, grid: ["######", "#M..D#", "#.K..#", "######"], solution: ["down", "right", "up"] },
  { id: 6, name: "钥匙在下", par: 3, grid: ["#####", "#M.D#", "#..K#", "#####"], solution: ["down", "right", "up"] },
  { id: 7, name: "别冲门", par: 3, grid: ["######", "#MH.D#", "#..K.#", "######"], solution: ["down", "right", "up"] },
  { id: 8, name: "三折", par: 3, grid: ["######", "#M...#", "####.#", "#...K#", "#D...#", "######"], solution: ["right", "down", "left"] },
  { id: 9, name: "先离开", par: 4, grid: ["######", "#..DM#", "#K...#", "######"], solution: ["down", "left", "up", "right"] },
  { id: 10, name: "箱子挡路", par: 4, grid: ["######", "#M.C.#", "#K..D#", "######"], solution: ["right", "down", "left", "right"] },
  { id: 11, name: "箱子落洞", par: 4, grid: ["######", "#M..C#", "#.H.D#", "#K...#", "######"], solution: ["left", "down", "right", "up"] },
  { id: 12, name: "两只箱子", par: 4, grid: ["######", "#M.C.#", "#..C.#", "#K..D#", "######"], solution: ["right", "down", "left", "right"] },
  { id: 13, name: "把箱子送开", par: 4, grid: ["#######", "#M....#", "#..C.H#", "#K...D#", "#######"], solution: ["right", "left", "down", "right"] },
  { id: 14, name: "洞边停下", par: 4, grid: ["######", "#M..H#", "#..C.#", "#K..D#", "######"], solution: ["down", "up", "right", "down"] },
  { id: 15, name: "绕开一格", par: 5, grid: ["######", "#MH..#", "#.#.K#", "#...D#", "######"], solution: ["down", "right", "up", "right", "down"] },
  { id: 16, name: "贴着洞", par: 5, grid: ["######", "#M..H#", "#.#..#", "#..K.#", "#...D#", "######"], solution: ["down", "right", "up", "down", "right"] },
  { id: 17, name: "钥匙在洞边", par: 5, grid: ["######", "#M..H#", "#..K.#", "#...D#", "######"], solution: ["down", "right", "up", "down", "right"] },
  { id: 18, name: "绕一圈", par: 5, grid: ["#######", "#M....#", "#.###.#", "#..K..#", "#....D#", "#######"], solution: ["right", "down", "left", "down", "right"] },
  { id: 19, name: "侧过去", par: 5, grid: ["########", "#M.....#", "#C.H.#.#", "#..#.K.#", "#....#D#", "#......#", "########"], solution: ["right", "down", "left", "right", "down"] },
  { id: 20, name: "窄门", par: 6, grid: ["#######", "#M....#", "##.#.##", "#K.C.D#", "#######"], solution: ["right", "up", "left", "down", "left", "right"] },
  { id: 21, name: "让开", par: 6, grid: ["########", "#...C.M#", "#K..H..#", "#..#..D#", "#......#", "########"], solution: ["down", "up", "left", "down", "right", "up"] },
  { id: 22, name: "七步", par: 7, grid: ["######", "#D#..#", "#CK.H#", "#..M.#", "##.#.#", "######"], solution: ["down", "left", "down", "right", "up", "left", "up"] },
  { id: 23, name: "箱子先走", par: 8, grid: ["########", "#M..C..#", "#.##.H.#", "#..K...#", "#.....D#", "########"], solution: ["down", "right", "up", "right", "down", "left", "down", "right"] },
  { id: 24, name: "再送一次", par: 8, grid: ["########", "#C.K#..#", "#..DC.##", "#....M##", "###H..##", "########"], solution: ["left", "down", "right", "down", "left", "up", "right", "down"] },
  { id: 25, name: "箱子两次", par: 9, grid: ["#######", "#M..C.#", "#..H..#", "#K.#.D#", "#######"], solution: ["right", "down", "left", "up", "left", "down", "up", "right", "down"] },
  { id: 26, name: "九步", par: 9, grid: ["######", "#C.K.#", "#CH.##", "#.##D#", "#..M.#", "######"], solution: ["left", "up", "right", "up", "right", "left", "down", "right", "up"] },
  { id: 27, name: "十步", par: 10, grid: ["#######", "#...M.#", "#.#...#", "#..##.#", "#...H.#", "#CKD#.#", "#######"], solution: ["up", "right", "down", "right", "down", "left", "up", "left", "down", "right"] },
  { id: 28, name: "十一", par: 11, grid: ["#######", "#KC.#D#", "###..M#", "#.....#", "#H..#.#", "#.....#", "#######"], solution: ["right", "down", "right", "up", "left", "up", "left", "right", "down", "right", "up"] },
  { id: 29, name: "十二", par: 12, grid: ["########", "#.#C...#", "#....#.#", "#...DKC#", "#M#.H#.#", "########"], solution: ["up", "left", "down", "left", "up", "right", "up", "right", "down", "right", "down", "left"] },
  { id: 30, name: "十四", par: 14, grid: ["######", "#D.HM#", "#K...#", "#C.#.#", "#.C#.#", "######"], solution: ["right", "down", "left", "up", "right", "down", "left", "up", "right", "down", "right", "up", "left", "up"] },
];
