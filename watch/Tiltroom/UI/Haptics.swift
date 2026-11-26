import WatchKit

@MainActor
public enum Haptics {
    public static func lockDirection() {
        WKInterfaceDevice.current().play(.click)
    }

    public static func slideSettle() {
        WKInterfaceDevice.current().play(.directionDown)
    }

    public static func keyCollected() {
        WKInterfaceDevice.current().play(.directionUp)
    }

    public static func noOp() {
        WKInterfaceDevice.current().play(.retry)
    }

    public static func dead() {
        WKInterfaceDevice.current().play(.failure)
    }

    public static func won() {
        WKInterfaceDevice.current().play(.success)
    }

    public static func recalibrated() {
        WKInterfaceDevice.current().play(.start)
    }
}
