import SwiftUI

/// Lightweight ~0.72s cold-launch Gravity Shutter splash animation.
/// Tap anywhere to skip immediately into gameplay.
public struct SplashOverlayView: View {
    public let onFinished: () -> Void

    @State private var dropped = false
    @State private var titleVisible = false
    @State private var fadingOut = false
    @State private var didFinish = false

    private let gold = Color(red: 0.906, green: 0.761, blue: 0.478)
    private let bg = Color(red: 0.078, green: 0.067, blue: 0.055)

    public init(onFinished: @escaping () -> Void) {
        self.onFinished = onFinished
    }

    public var body: some View {
        ZStack {
            bg.ignoresSafeArea()

            VStack(spacing: 8) {
                ZStack {
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(gold.opacity(dropped ? 0.85 : 0.35), lineWidth: 1.8)
                        .frame(width: 44, height: 44)

                    RoundedRectangle(cornerRadius: 2)
                        .fill(gold.opacity(dropped ? 0.95 : 0.25))
                        .frame(width: 24, height: 3)
                        .offset(y: 18)

                    Circle()
                        .fill(gold)
                        .frame(width: 14, height: 14)
                        .offset(y: dropped ? 4 : -13)
                        .scaleEffect(dropped ? 1.0 : 0.82)
                }

                VStack(spacing: 2) {
                    Text("Tiltroom")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundStyle(gold)
                    Text("重力快门")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(.white.opacity(0.68))
                }
                .opacity(titleVisible ? 1 : 0)
                .offset(y: titleVisible ? 0 : 4)
            }
        }
        .opacity(fadingOut ? 0 : 1)
        .contentShape(Rectangle())
        .onTapGesture {
            finishNow()
        }
        .task {
            withAnimation(.spring(response: 0.28, dampingFraction: 0.68)) {
                dropped = true
            }
            try? await Task.sleep(nanoseconds: 140_000_000)
            if Task.isCancelled || didFinish { return }

            withAnimation(.easeOut(duration: 0.20)) {
                titleVisible = true
            }
            try? await Task.sleep(nanoseconds: 420_000_000)
            if Task.isCancelled || didFinish { return }

            withAnimation(.easeOut(duration: 0.16)) {
                fadingOut = true
            }
            try? await Task.sleep(nanoseconds: 160_000_000)
            if Task.isCancelled || didFinish { return }

            finishNow()
        }
    }

    private func finishNow() {
        guard !didFinish else { return }
        didFinish = true
        onFinished()
    }
}
