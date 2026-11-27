import Foundation

/// Tracks watchOS Always-On dim / background transitions so short accidental
/// wrist-down dims preserve tilt calibration while guarding wake taps from
/// misfiring the shutter.
public struct ScreenWakePolicy: Sendable {
    public let shortDimThreshold: TimeInterval
    public let wakeTapGuardDuration: TimeInterval

    private var hasActivatedOnce: Bool = false
    private var isPaused: Bool = false
    private var pausedAt: Date?
    private var pausedFromBackground: Bool = false
    private var wakeGuardUntil: Date = .distantPast

    public init(
        shortDimThreshold: TimeInterval = 5.0,
        wakeTapGuardDuration: TimeInterval = 0.25
    ) {
        self.shortDimThreshold = shortDimThreshold
        self.wakeTapGuardDuration = wakeTapGuardDuration
    }

    /// Records a transition into dimmed (Always-On) or non-active/background state.
    public mutating func markPaused(isBackground: Bool, now: Date = Date()) {
        if !isPaused {
            isPaused = true
            pausedAt = now
            pausedFromBackground = isBackground
        } else if isBackground {
            pausedFromBackground = true
        }
    }

    /// Records return to active full-brightness gameplay and returns whether the
    /// tilt baseline should be recalibrated.
    public mutating func markResumed(now: Date = Date()) -> Bool {
        if !hasActivatedOnce {
            hasActivatedOnce = true
            isPaused = false
            pausedAt = nil
            pausedFromBackground = false
            return true
        }

        guard isPaused else {
            return false
        }

        let elapsed = pausedAt.map { now.timeIntervalSince($0) } ?? .infinity
        let shouldRecalibrate = pausedFromBackground || elapsed > shortDimThreshold

        isPaused = false
        pausedAt = nil
        pausedFromBackground = false
        wakeGuardUntil = now.addingTimeInterval(wakeTapGuardDuration)
        return shouldRecalibrate
    }

    public func isWakeTapGuarded(now: Date = Date()) -> Bool {
        now < wakeGuardUntil
    }
}
