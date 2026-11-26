import Foundation

public struct LevelProgress: Codable, Equatable, Sendable {
    public var currentLevelIndex: Int
    public var bestMovesByLevelId: [Int: Int]

    public init(currentLevelIndex: Int = 0, bestMovesByLevelId: [Int: Int] = [:]) {
        self.currentLevelIndex = currentLevelIndex
        self.bestMovesByLevelId = bestMovesByLevelId
    }
}

public final class ProgressStore {
    private let defaults: UserDefaults
    private let key: String

    public init(defaults: UserDefaults = .standard, key: String = "cc.yuler.tiltroom.progress.v1") {
        self.defaults = defaults
        self.key = key
    }

    public func load() -> LevelProgress {
        guard let data = defaults.data(forKey: key),
              let decoded = try? JSONDecoder().decode(LevelProgress.self, from: data) else {
            return LevelProgress()
        }
        return decoded
    }

    public func save(_ progress: LevelProgress) {
        guard let data = try? JSONEncoder().encode(progress) else { return }
        defaults.set(data, forKey: key)
    }
}
