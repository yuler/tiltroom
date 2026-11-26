import CoreMotion
import Foundation
import WatchKit

@MainActor
public final class TiltShutterSensor: ObservableObject {
    @Published public private(set) var lockedDirection: Direction?
    @Published public private(set) var tiltIntensity: Double = 0
    @Published public private(set) var isAvailable: Bool = false

    private let motionManager = CMMotionManager()
    private let motionQueue: OperationQueue = {
        let queue = OperationQueue()
        queue.name = "cc.yuler.tiltroom.motion"
        queue.maxConcurrentOperationCount = 1
        return queue
    }()

    private var mapper = TiltMapper()
    private var lastLockedDirection: Direction?
    private var lastLockedAt: Date = .distantPast
    private let latchWindow: TimeInterval = 0.24
    private var isRunning = false

    public var onDirectionLocked: ((Direction) -> Void)?

    public init() {
        isAvailable = motionManager.isDeviceMotionAvailable
    }

    public func start(recalibrate: Bool = true) {
        isAvailable = motionManager.isDeviceMotionAvailable
        guard isAvailable else { return }
        if recalibrate {
            mapper.resetBaseline()
            lockedDirection = nil
            tiltIntensity = 0
        }
        guard !isRunning else { return }
        isRunning = true

        motionManager.deviceMotionUpdateInterval = 1.0 / 50.0
        motionManager.startDeviceMotionUpdates(to: motionQueue) { [weak self] motion, _ in
            guard let motion else { return }
            let gx = motion.gravity.x
            let gy = motion.gravity.y
            Task { @MainActor [weak self] in
                self?.processGravity(gx: gx, gy: gy)
            }
        }
    }

    public func stop() {
        guard isRunning else { return }
        isRunning = false
        motionManager.stopDeviceMotionUpdates()
        mapper.clearLock()
        lockedDirection = nil
        tiltIntensity = 0
    }

    public func recalibrate() {
        mapper.resetBaseline()
        lockedDirection = nil
        lastLockedDirection = nil
        tiltIntensity = 0
    }

    /// Returns the live locked direction, or a recently latched direction within `latchWindow`
    /// to absorb micro-jitter from tapping or pinching the watch.
    public func directionForShutter(now: Date = Date()) -> Direction? {
        if let lockedDirection {
            return lockedDirection
        }
        if let lastLockedDirection, now.timeIntervalSince(lastLockedAt) <= latchWindow {
            return lastLockedDirection
        }
        return nil
    }

    private func processGravity(gx: Double, gy: Double) {
        guard isRunning else { return }
        let crownOnLeft = WKInterfaceDevice.current().crownOrientation == .left
        let previous = lockedDirection
        let sample = mapper.update(gx: gx, gy: gy, crownOnLeft: crownOnLeft)
        lockedDirection = sample.direction
        tiltIntensity = sample.intensity
        if let dir = sample.direction {
            lastLockedDirection = dir
            lastLockedAt = Date()
            if dir != previous {
                onDirectionLocked?(dir)
            }
        }
    }
}
