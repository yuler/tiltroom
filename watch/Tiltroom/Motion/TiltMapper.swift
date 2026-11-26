import Foundation

public struct TiltSample: Equatable, Sendable {
    public let direction: Direction?
    public let intensity: Double

    public init(direction: Direction?, intensity: Double) {
        self.direction = direction
        self.intensity = intensity
    }
}

/// Pure screen-space tilt mapper for Gravity Shutter.
///
/// CoreMotion reports physical chassis coordinates regardless of crown orientation,
/// so when the Digital Crown is worn on the left we rotate X/Y by 180 degrees to align
/// with the flipped watchOS screen.
///
/// Asymmetric thresholds make vertical pitch (up/down) comfortable while keeping
/// the watch face readable, whereas horizontal wrist roll has a wider comfort range.
public struct TiltMapper: Sendable {
    public struct Config: Sendable {
        public var enterRoll: Double = 0.24
        public var exitRoll: Double = 0.16
        public var enterPitch: Double = 0.17
        public var exitPitch: Double = 0.11
        public var axisDominance: Double = 1.15
        public var smoothingAlpha: Double = 0.28

        public init() {}
    }

    public let config: Config
    private var neutralX: Double?
    private var neutralY: Double?
    private var smoothX: Double = 0
    private var smoothY: Double = 0
    private var currentDirection: Direction?

    public init(config: Config = Config()) {
        self.config = config
    }

    public static func screenGravity(gx: Double, gy: Double, crownOnLeft: Bool) -> (x: Double, y: Double) {
        if crownOnLeft {
            return (-gx, gy)
        }
        return (gx, -gy)
    }

    public mutating func resetBaseline() {
        neutralX = nil
        neutralY = nil
        smoothX = 0
        smoothY = 0
        currentDirection = nil
    }

    public mutating func clearLock() {
        currentDirection = nil
    }

    public mutating func update(gx: Double, gy: Double, crownOnLeft: Bool) -> TiltSample {
        let screen = Self.screenGravity(gx: gx, gy: gy, crownOnLeft: crownOnLeft)
        guard let baseX = neutralX, let baseY = neutralY else {
            neutralX = screen.x
            neutralY = screen.y
            smoothX = 0
            smoothY = 0
            currentDirection = nil
            return TiltSample(direction: nil, intensity: 0)
        }

        let rawDX = screen.x - baseX
        let rawDY = screen.y - baseY
        let alpha = config.smoothingAlpha
        smoothX = smoothX * (1 - alpha) + rawDX * alpha
        smoothY = smoothY * (1 - alpha) + rawDY * alpha

        let dx = smoothX
        let dy = smoothY

        // Hysteresis: keep current direction until wrist pulls clearly back inside exit threshold.
        if let active = currentDirection {
            let stillActive: Bool
            let activeStrength: Double
            switch active {
            case .right:
                stillActive = dx > config.exitRoll && (dx / config.enterRoll) >= (abs(dy) / config.enterPitch) * 0.85
                activeStrength = min(1, max(0, dx / (config.enterRoll * 1.8)))
            case .left:
                stillActive = -dx > config.exitRoll && (-dx / config.enterRoll) >= (abs(dy) / config.enterPitch) * 0.85
                activeStrength = min(1, max(0, -dx / (config.enterRoll * 1.8)))
            case .down:
                stillActive = dy > config.exitPitch && (dy / config.enterPitch) >= (abs(dx) / config.enterRoll) * 0.85
                activeStrength = min(1, max(0, dy / (config.enterPitch * 1.8)))
            case .up:
                stillActive = -dy > config.exitPitch && (-dy / config.enterPitch) >= (abs(dx) / config.enterRoll) * 0.85
                activeStrength = min(1, max(0, -dy / (config.enterPitch * 1.8)))
            }
            if stillActive {
                return TiltSample(direction: active, intensity: activeStrength)
            }
            currentDirection = nil
        }

        let normX = abs(dx) / config.enterRoll
        let normY = abs(dy) / config.enterPitch

        if normX >= 1.0 && normX >= normY * config.axisDominance {
            let dir: Direction = dx > 0 ? .right : .left
            currentDirection = dir
            return TiltSample(direction: dir, intensity: min(1, abs(dx) / (config.enterRoll * 1.8)))
        }

        if normY >= 1.0 && normY >= normX * config.axisDominance {
            let dir: Direction = dy > 0 ? .down : .up
            currentDirection = dir
            return TiltSample(direction: dir, intensity: min(1, abs(dy) / (config.enterPitch * 1.8)))
        }

        return TiltSample(direction: nil, intensity: 0)
    }
}
