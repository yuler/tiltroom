import Foundation

public struct GridPoint: Hashable, Codable, Sendable, Comparable {
    public let x: Int
    public let y: Int

    public init(x: Int, y: Int) {
        self.x = x
        self.y = y
    }

    public static func < (lhs: GridPoint, rhs: GridPoint) -> Bool {
        if lhs.y != rhs.y { return lhs.y < rhs.y }
        return lhs.x < rhs.x
    }

    public func offset(by direction: Direction) -> GridPoint {
        GridPoint(x: x + direction.dx, y: y + direction.dy)
    }
}

public enum Direction: String, CaseIterable, Codable, Sendable {
    case up
    case down
    case left
    case right

    public var dx: Int {
        switch self {
        case .left: return -1
        case .right: return 1
        case .up, .down: return 0
        }
    }

    public var dy: Int {
        switch self {
        case .up: return -1
        case .down: return 1
        case .left, .right: return 0
        }
    }

    public var shortLabel: String {
        switch self {
        case .up: return "上"
        case .down: return "下"
        case .left: return "左"
        case .right: return "右"
        }
    }

    public var arrowSymbol: String {
        switch self {
        case .up: return "↑"
        case .down: return "↓"
        case .left: return "←"
        case .right: return "→"
        }
    }
}

public struct LevelSpec: Identifiable, Hashable, Sendable {
    public let id: Int
    public let name: String
    public let par: Int
    public let grid: [String]
    public let solution: [Direction]

    public init(id: Int, name: String, par: Int, grid: [String], solution: [Direction]) {
        self.id = id
        self.name = name
        self.par = par
        self.grid = grid
        self.solution = solution
    }
}

public struct ParsedLevel: Equatable, Sendable {
    public let width: Int
    public let height: Int
    public let walls: Set<GridPoint>
    public let holes: Set<GridPoint>
    public let key: GridPoint?
    public let door: GridPoint?

    public init(
        width: Int,
        height: Int,
        walls: Set<GridPoint>,
        holes: Set<GridPoint>,
        key: GridPoint?,
        door: GridPoint?
    ) {
        self.width = width
        self.height = height
        self.walls = walls
        self.holes = holes
        self.key = key
        self.door = door
    }
}

public struct BoardState: Equatable, Codable, Sendable {
    public var marble: GridPoint
    public var hasKey: Bool
    public var crates: [GridPoint]

    public init(marble: GridPoint, hasKey: Bool, crates: [GridPoint]) {
        self.marble = marble
        self.hasKey = hasKey
        self.crates = crates.sorted()
    }
}

public struct MoveFrame: Equatable, Sendable {
    public let marble: GridPoint
    public let hasKey: Bool
    public let crates: [GridPoint]
    public let marbleFell: Bool

    public init(marble: GridPoint, hasKey: Bool, crates: [GridPoint], marbleFell: Bool) {
        self.marble = marble
        self.hasKey = hasKey
        self.crates = crates.sorted()
        self.marbleFell = marbleFell
    }
}

public struct MoveResult: Equatable, Sendable {
    public let didMove: Bool
    public let didCollectKey: Bool
    public let didDropCrate: Bool
    public let dead: Bool
    public let won: Bool
    public let frames: [MoveFrame]
    public let state: BoardState

    public init(
        didMove: Bool,
        didCollectKey: Bool,
        didDropCrate: Bool,
        dead: Bool,
        won: Bool,
        frames: [MoveFrame],
        state: BoardState
    ) {
        self.didMove = didMove
        self.didCollectKey = didCollectKey
        self.didDropCrate = didDropCrate
        self.dead = dead
        self.won = won
        self.frames = frames
        self.state = state
    }
}

public enum PlayMode: String, Codable, Sendable {
    case playing
    case dead
    case won
}
