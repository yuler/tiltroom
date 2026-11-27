import Foundation

public struct LevelProgress: Codable, Equatable, Sendable {
    public var currentLevelIndex: Int
    public var bestMovesByLevelId: [Int: Int]
    public var hasCompletedOnboarding: Bool

    public init(
        currentLevelIndex: Int = 0,
        bestMovesByLevelId: [Int: Int] = [:],
        hasCompletedOnboarding: Bool = false
    ) {
        self.currentLevelIndex = currentLevelIndex
        self.bestMovesByLevelId = bestMovesByLevelId
        self.hasCompletedOnboarding = hasCompletedOnboarding
    }

    private enum CodingKeys: String, CodingKey {
        case currentLevelIndex
        case bestMovesByLevelId
        case hasCompletedOnboarding
    }

    public init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let currentLevelIndex = try container.decodeIfPresent(Int.self, forKey: .currentLevelIndex) ?? 0
        let bestMovesByLevelId = try container.decodeIfPresent([Int: Int].self, forKey: .bestMovesByLevelId) ?? [:]
        let hasCompletedOnboarding = try container.decodeIfPresent(Bool.self, forKey: .hasCompletedOnboarding)
            ?? !bestMovesByLevelId.isEmpty
        self.currentLevelIndex = currentLevelIndex
        self.bestMovesByLevelId = bestMovesByLevelId
        self.hasCompletedOnboarding = hasCompletedOnboarding
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
