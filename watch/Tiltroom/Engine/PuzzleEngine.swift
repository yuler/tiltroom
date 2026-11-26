import Foundation

public enum PuzzleEngine {
    public static func parse(grid: [String]) -> (level: ParsedLevel, initialState: BoardState) {
        var walls = Set<GridPoint>()
        var holes = Set<GridPoint>()
        var crates: [GridPoint] = []
        var marble = GridPoint(x: 0, y: 0)
        var key: GridPoint?
        var door: GridPoint?

        let height = grid.count
        let width = grid.first?.count ?? 0

        for (y, row) in grid.enumerated() {
            for (x, ch) in row.enumerated() {
                let point = GridPoint(x: x, y: y)
                switch ch {
                case "#":
                    walls.insert(point)
                case "H":
                    holes.insert(point)
                case "M":
                    marble = point
                case "K":
                    key = point
                case "D":
                    door = point
                case "C":
                    crates.append(point)
                default:
                    break
                }
            }
        }

        let level = ParsedLevel(
            width: width,
            height: height,
            walls: walls,
            holes: holes,
            key: key,
            door: door
        )
        let state = BoardState(marble: marble, hasKey: false, crates: crates)
        return (level, state)
    }

    /// Simulates a 4-way discrete gravity slide.
    ///
    /// Rules match the verified prototype:
    /// - All mobile bodies (marble and crates) slide step-by-step in front-to-back order along gravity.
    /// - A crate entering an open hole disappears and temporarily plugs that hole for the remainder
    ///   of the current slide; on the next slide, the hole is open again.
    /// - Passing over the key unlocks the door immediately (allowing entry on the same slide).
    public static func tilt(level: ParsedLevel, state: BoardState, direction: Direction) -> MoveResult {
        var marble = state.marble
        var hasKey = state.hasKey
        var crates = Set(state.crates)
        var plugs = Set<GridPoint>()
        var frames: [MoveFrame] = []
        var collectedKey = false
        var droppedCrate = false

        func appendFrame(marbleFell: Bool) {
            frames.append(
                MoveFrame(
                    marble: marble,
                    hasKey: hasKey,
                    crates: Array(crates),
                    marbleFell: marbleFell
                )
            )
        }

        for _ in 0..<40 {
            enum MobileKind {
                case marble
                case crate(GridPoint)
            }

            var mobiles: [(kind: MobileKind, pos: GridPoint)] = [(.marble, marble)]
            for crate in crates.sorted() {
                mobiles.append((.crate(crate), crate))
            }

            // Front-most items along gravity move first.
            mobiles.sort { lhs, rhs in
                let lp = lhs.pos.x * direction.dx + lhs.pos.y * direction.dy
                let rp = rhs.pos.x * direction.dx + rhs.pos.y * direction.dy
                if lp != rp { return lp > rp }
                return lhs.pos < rhs.pos
            }

            var movedThisStep = false

            for item in mobiles {
                let next = item.pos.offset(by: direction)
                guard next.x >= 0, next.y >= 0, next.x < level.width, next.y < level.height else {
                    continue
                }

                let isLockedDoor = (next == level.door) && !hasKey
                let isSolid = level.walls.contains(next)
                    || isLockedDoor
                    || crates.contains(next)
                    || next == marble
                let isOpenHole = level.holes.contains(next) && !plugs.contains(next)

                switch item.kind {
                case .marble:
                    if isOpenHole {
                        marble = next
                        appendFrame(marbleFell: true)
                        return MoveResult(
                            didMove: true,
                            didCollectKey: collectedKey,
                            didDropCrate: droppedCrate,
                            dead: true,
                            won: false,
                            frames: frames,
                            state: BoardState(marble: marble, hasKey: hasKey, crates: Array(crates))
                        )
                    }
                    if isSolid { continue }
                    marble = next
                    if next == level.key && !hasKey {
                        hasKey = true
                        collectedKey = true
                    }
                    movedThisStep = true
                    if next == level.door && hasKey {
                        appendFrame(marbleFell: false)
                        return MoveResult(
                            didMove: true,
                            didCollectKey: collectedKey,
                            didDropCrate: droppedCrate,
                            dead: false,
                            won: true,
                            frames: frames,
                            state: BoardState(marble: marble, hasKey: hasKey, crates: Array(crates))
                        )
                    }

                case .crate(let origin):
                    guard crates.contains(origin) else { continue }
                    if isOpenHole {
                        crates.remove(origin)
                        plugs.insert(next)
                        droppedCrate = true
                        movedThisStep = true
                        continue
                    }
                    if isSolid { continue }
                    crates.remove(origin)
                    crates.insert(next)
                    movedThisStep = true
                }
            }

            if !movedThisStep { break }
            appendFrame(marbleFell: false)
        }

        let finalState = BoardState(marble: marble, hasKey: hasKey, crates: Array(crates))
        let didMove = finalState != state
        return MoveResult(
            didMove: didMove,
            didCollectKey: collectedKey,
            didDropCrate: droppedCrate,
            dead: false,
            won: false,
            frames: frames,
            state: finalState
        )
    }

    public static func verifySolution(for spec: LevelSpec) -> Bool {
        let parsed = parse(grid: spec.grid)
        var current = parsed.initialState
        for (index, direction) in spec.solution.enumerated() {
            let result = tilt(level: parsed.level, state: current, direction: direction)
            if result.dead { return false }
            if result.won { return index == spec.solution.count - 1 }
            current = result.state
        }
        return false
    }
}
