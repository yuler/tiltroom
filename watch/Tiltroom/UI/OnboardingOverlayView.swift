import SwiftUI

/// Non-blocking 2-step interactive coach mark overlaid on Level 1 during first play.
public struct OnboardingOverlayView: View {
    public let lockedDirection: Direction?
    public let sensorAvailable: Bool

    @State private var pulse = false

    private let gold = Color(red: 0.906, green: 0.761, blue: 0.478)
    private let darkInk = Color(red: 0.10, green: 0.08, blue: 0.05)

    public init(lockedDirection: Direction?, sensorAvailable: Bool) {
        self.lockedDirection = lockedDirection
        self.sensorAvailable = sensorAvailable
    }

    public var body: some View {
        VStack {
            Spacer()
            pillContent
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(
                    (lockedDirection != nil ? gold.opacity(0.95) : Color.black.opacity(0.80)),
                    in: Capsule()
                )
                .overlay(
                    Capsule()
                        .stroke(gold.opacity(lockedDirection != nil ? 1.0 : 0.75), lineWidth: 1)
                )
                .scaleEffect(pulse ? 1.03 : 0.98)
                .padding(.bottom, 4)
        }
        .allowsHitTesting(false)
        .onAppear {
            withAnimation(.easeInOut(duration: 0.85).repeatForever(autoreverses: true)) {
                pulse = true
            }
        }
    }

    @ViewBuilder
    private var pillContent: some View {
        if !sensorAvailable {
            HStack(spacing: 4) {
                Image(systemName: "hand.draw")
                    .font(.system(size: 11, weight: .semibold))
                Text("滑动棋盘移动弹珠")
                    .font(.system(size: 11, weight: .semibold))
            }
            .foregroundStyle(gold)
        } else if let dir = lockedDirection {
            HStack(spacing: 4) {
                Image(systemName: "hand.tap.fill")
                    .font(.system(size: 11, weight: .bold))
                Text("② 点表盘「\(dir.arrowSymbol) 落下」")
                    .font(.system(size: 11, weight: .bold))
            }
            .foregroundStyle(darkInk)
        } else {
            HStack(spacing: 4) {
                Image(systemName: "gyroscope")
                    .font(.system(size: 11, weight: .semibold))
                Text("① 倾腕瞄准方向")
                    .font(.system(size: 11, weight: .semibold))
            }
            .foregroundStyle(gold)
        }
    }
}
