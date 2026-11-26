import Foundation
import SwiftUI

@MainActor
public final class GameController: ObservableObject {
    public let levels: [LevelSpec]

    @Published public private(set) var levelIndex: Int = 0
    @Published public private(set) var parsedLevel: ParsedLevel
    @Published public private(set) var state: BoardState
    @Published public private(set) var renderFrame: MoveFrame
    @Published public private(set) var moveCount: Int = 0
    @Published public private(set) var mode: PlayMode = .playing
    @Published public private(set) var isAnimating: Bool = false
    @Published public private(set) var progress: LevelProgress
    @Published public private(set) var statusBanner: String?

    private var history: [BoardState] = []
    private let store: ProgressStore
    private var animationTask: Task<Void, Never>?
    private var bannerTask: Task<Void, Never>?

    public var currentSpec: LevelSpec {
        levels[levelIndex]
    }

    public var canUndo: Bool {
        !isAnimating && !history.isEmpty
    }

    public var clearedCount: Int {
        progress.bestMovesByLevelId.count
    }

    public init(levels: [LevelSpec] = LevelCatalog.all, store: ProgressStore = ProgressStore()) {
        self.levels = levels
        self.store = store
        let loaded = store.load()
        let safeIndex = min(max(0, loaded.currentLevelIndex), max(0, levels.count - 1))
        let spec = levels[safeIndex]
        let parsed = PuzzleEngine.parse(grid: spec.grid)

        self.progress = LevelProgress(
            currentLevelIndex: safeIndex,
            bestMovesByLevelId: loaded.bestMovesByLevelId
        )
        self.levelIndex = safeIndex
        self.parsedLevel = parsed.level
        self.state = parsed.initialState
        self.renderFrame = MoveFrame(
            marble: parsed.initialState.marble,
            hasKey: parsed.initialState.hasKey,
            crates: parsed.initialState.crates,
            marbleFell: false
        )
    }

    public func selectLevel(index: Int) {
        guard levels.indices.contains(index) else { return }
        cancelTasks()
        levelIndex = index
        let parsed = PuzzleEngine.parse(grid: levels[index].grid)
        parsedLevel = parsed.level
        state = parsed.initialState
        renderFrame = MoveFrame(
            marble: parsed.initialState.marble,
            hasKey: parsed.initialState.hasKey,
            crates: parsed.initialState.crates,
            marbleFell: false
        )
        history = []
        moveCount = 0
        mode = .playing
        isAnimating = false
        statusBanner = nil

        progress.currentLevelIndex = index
        store.save(progress)
    }

    public func reset() {
        selectLevel(index: levelIndex)
    }

    public func undo() {
        guard !history.isEmpty else { return }
        cancelTasks()
        let previous = history.removeLast()
        state = previous
        renderFrame = MoveFrame(
            marble: previous.marble,
            hasKey: previous.hasKey,
            crates: previous.crates,
            marbleFell: false
        )
        moveCount = max(0, moveCount - 1)
        mode = .playing
        isAnimating = false
        statusBanner = nil
        Haptics.lockDirection()
    }

    public func commit(_ direction: Direction) {
        guard !isAnimating, mode == .playing else { return }
        let result = PuzzleEngine.tilt(level: parsedLevel, state: state, direction: direction)

        if !result.didMove {
            Haptics.noOp()
            flashBanner("无移动")
            return
        }

        history.append(state)
        moveCount += 1
        isAnimating = true
        statusBanner = nil

        let frames = result.frames.isEmpty
            ? [MoveFrame(marble: result.state.marble, hasKey: result.state.hasKey, crates: result.state.crates, marbleFell: result.dead)]
            : result.frames

        animationTask = Task { @MainActor [weak self] in
            guard let self else { return }
            for frame in frames {
                if Task.isCancelled { return }
                self.renderFrame = frame
                try? await Task.sleep(nanoseconds: 62_000_000)
            }
            if Task.isCancelled { return }

            self.state = result.state
            self.isAnimating = false

            if result.dead {
                self.mode = .dead
                self.statusBanner = "进洞了"
                Haptics.dead()
            } else if result.won {
                self.mode = .won
                self.recordClear(moves: self.moveCount)
                Haptics.won()
                if self.levelIndex < self.levels.count - 1 {
                    self.statusBanner = "过关!"
                    try? await Task.sleep(nanoseconds: 850_000_000)
                    if !Task.isCancelled && self.mode == .won {
                        self.selectLevel(index: self.levelIndex + 1)
                    }
                } else {
                    self.statusBanner = "全部通关!"
                }
            } else {
                if result.didCollectKey {
                    Haptics.keyCollected()
                } else {
                    Haptics.slideSettle()
                }
            }
        }
    }

    public func showHint(_ message: String) {
        flashBanner(message)
    }

    private func recordClear(moves: Int) {
        let id = currentSpec.id
        if let existing = progress.bestMovesByLevelId[id] {
            progress.bestMovesByLevelId[id] = min(existing, moves)
        } else {
            progress.bestMovesByLevelId[id] = moves
        }
        store.save(progress)
    }

    private func flashBanner(_ text: String) {
        bannerTask?.cancel()
        statusBanner = text
        bannerTask = Task { @MainActor [weak self] in
            try? await Task.sleep(nanoseconds: 900_000_000)
            if !Task.isCancelled && self?.statusBanner == text {
                self?.statusBanner = nil
            }
        }
    }

    private func cancelTasks() {
        animationTask?.cancel()
        animationTask = nil
        bannerTask?.cancel()
        bannerTask = nil
    }
}
