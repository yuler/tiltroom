import SwiftUI

public struct GameView: View {
    @StateObject private var game = GameController()
    @StateObject private var sensor = TiltShutterSensor()
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.isLuminanceReduced) private var isLuminanceReduced

    @State private var showingLevels = false
    @State private var showingSplash = true
    @State private var wakePolicy = ScreenWakePolicy()

    private let gold = Color(red: 0.906, green: 0.761, blue: 0.478)
    private let bg = Color(red: 0.078, green: 0.067, blue: 0.055)

    public init() {}

    private var shouldShowOnboarding: Bool {
        !showingSplash
            && !isLuminanceReduced
            && !game.hasCompletedOnboarding
            && game.levelIndex == 0
            && game.mode == .playing
            && game.moveCount == 0
    }

    public var body: some View {
        ZStack {
            VStack(spacing: 0) {
                headerBar
                boardArea
                footerBar
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(bg.ignoresSafeArea())

            if showingSplash {
                SplashOverlayView {
                    showingSplash = false
                    syncSensorState()
                }
                .transition(.opacity)
                .zIndex(1)
            }
        }
        .sheet(isPresented: $showingLevels) {
            LevelPickerView(
                levels: game.levels,
                currentIndex: game.levelIndex,
                bestMovesByLevelId: game.progress.bestMovesByLevelId,
                onSelect: { idx in
                    showingLevels = false
                    game.selectLevel(index: idx)
                    sensor.recalibrate()
                },
                onRecalibrate: {
                    showingLevels = false
                    sensor.recalibrate()
                    Haptics.recalibrated()
                    game.showHint("已归零")
                },
                onShowGuide: {
                    showingLevels = false
                    game.restartOnboarding()
                    sensor.recalibrate()
                }
            )
        }
        .onAppear {
            sensor.onDirectionLocked = { _ in
                if game.mode == .playing && !game.isAnimating {
                    Haptics.lockDirection()
                }
            }
            syncSensorState()
        }
        .onDisappear {
            sensor.stop()
        }
        .onChange(of: scenePhase) { _, _ in
            syncSensorState()
        }
        .onChange(of: isLuminanceReduced) { _, _ in
            syncSensorState()
        }
        .onChange(of: game.moveCount) { _, newCount in
            if newCount > 0 && !game.hasCompletedOnboarding {
                game.completeOnboarding()
                game.showHint("上手了! 也可滑动棋盘")
            }
        }
    }

    private var headerBar: some View {
        HStack(spacing: 4) {
            Button {
                showingLevels = true
            } label: {
                HStack(spacing: 3) {
                    Text("\(game.currentSpec.id)")
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundStyle(gold)
                    Text(game.currentSpec.name)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(.white.opacity(0.9))
                        .lineLimit(1)
                }
                .padding(.horizontal, 6)
                .padding(.vertical, 2)
                .background(Color.white.opacity(0.10), in: Capsule())
            }
            .buttonStyle(.plain)

            Spacer(minLength: 2)

            Text("\(game.moveCount)/\(game.currentSpec.par)")
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundStyle(game.moveCount <= game.currentSpec.par ? gold : .secondary)
        }
        .padding(.horizontal, 6)
        .padding(.bottom, 1)
    }

    private var boardArea: some View {
        ZStack {
            BoardCanvasView(
                level: game.parsedLevel,
                frame: game.renderFrame,
                lockedDirection: sensor.lockedDirection,
                tiltIntensity: sensor.tiltIntensity,
                isDimmed: isLuminanceReduced
            )
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onEnded { value in
                        handleBoardGesture(translation: value.translation)
                    }
            )

            if shouldShowOnboarding {
                OnboardingOverlayView(
                    lockedDirection: sensor.lockedDirection,
                    sensorAvailable: sensor.isAvailable
                )
            }

            if let banner = game.statusBanner, !isLuminanceReduced {
                Text(banner)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Color(red: 0.10, green: 0.08, blue: 0.05))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(gold.opacity(0.94), in: Capsule())
                    .allowsHitTesting(false)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .ignoresSafeArea(edges: .horizontal)
    }

    private var footerBar: some View {
        HStack(spacing: 5) {
            Button {
                game.undo()
            } label: {
                Image(systemName: "arrow.uturn.backward")
                    .font(.system(size: 12, weight: .semibold))
                    .frame(width: 28, height: 23)
                    .background(Color.white.opacity(game.canUndo ? 0.14 : 0.05), in: Capsule())
                    .foregroundStyle(game.canUndo ? .white : .white.opacity(0.3))
            }
            .buttonStyle(.plain)
            .disabled(!game.canUndo)

            primaryShutterButton

            Button {
                game.reset()
                sensor.recalibrate()
                Haptics.lockDirection()
            } label: {
                Image(systemName: "arrow.counterclockwise")
                    .font(.system(size: 12, weight: .semibold))
                    .frame(width: 28, height: 23)
                    .background(Color.white.opacity(0.14), in: Capsule())
                    .foregroundStyle(.white)
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 6)
        .padding(.top, 1)
        .padding(.bottom, 1)
        .opacity(isLuminanceReduced ? 0.45 : 1.0)
    }

    @ViewBuilder
    private var primaryShutterButton: some View {
        if game.mode == .dead {
            Button {
                game.undo()
            } label: {
                Text("退一步")
                    .font(.system(size: 12, weight: .bold))
                    .frame(maxWidth: .infinity, minHeight: 23)
                    .background(gold, in: Capsule())
                    .foregroundStyle(Color(red: 0.10, green: 0.08, blue: 0.05))
            }
            .buttonStyle(.plain)
            .tiltroomPrimaryHandGesture()
        } else if let dir = sensor.lockedDirection, game.mode == .playing {
            Button {
                fireShutter()
            } label: {
                Text("\(dir.arrowSymbol) 落下")
                    .font(.system(size: 12, weight: .bold))
                    .frame(maxWidth: .infinity, minHeight: 23)
                    .background(gold, in: Capsule())
                    .foregroundStyle(Color(red: 0.10, green: 0.08, blue: 0.05))
            }
            .buttonStyle(.plain)
            .tiltroomPrimaryHandGesture()
        } else {
            Button {
                sensor.recalibrate()
                Haptics.recalibrated()
                game.showHint("已归零")
            } label: {
                Text(sensor.isAvailable ? "倾腕/滑动" : "滑动棋盘")
                    .font(.system(size: 11, weight: .medium))
                    .frame(maxWidth: .infinity, minHeight: 23)
                    .background(Color.white.opacity(0.08), in: Capsule())
                    .foregroundStyle(.white.opacity(0.72))
            }
            .buttonStyle(.plain)
        }
    }

    private func handleBoardGesture(translation: CGSize) {
        let dx = translation.width
        let dy = translation.height
        let distance = hypot(dx, dy)

        if distance >= 24 {
            let dir: Direction
            if abs(dx) >= abs(dy) {
                dir = dx > 0 ? .right : .left
            } else {
                dir = dy > 0 ? .down : .up
            }
            game.commit(dir)
            return
        }

        if wakePolicy.isWakeTapGuarded() {
            return
        }

        if game.mode == .dead {
            game.undo()
            return
        }

        fireShutter()
    }

    private func fireShutter() {
        if wakePolicy.isWakeTapGuarded() {
            return
        }
        if let dir = sensor.directionForShutter() {
            game.commit(dir)
        } else {
            Haptics.noOp()
            game.showHint(sensor.isAvailable ? "先倾腕瞄准" : "请滑动棋盘")
        }
    }

    private func syncSensorState() {
        if scenePhase == .active && !isLuminanceReduced && !showingSplash {
            let shouldRecalibrate = wakePolicy.markResumed()
            sensor.start(recalibrate: shouldRecalibrate)
        } else {
            if !showingSplash {
                wakePolicy.markPaused(isBackground: scenePhase == .background)
            }
            sensor.stop()
        }
    }
}

private extension View {
    @ViewBuilder
    func tiltroomPrimaryHandGesture() -> some View {
        if #available(watchOS 11.0, *) {
            self.handGestureShortcut(.primaryAction)
        } else {
            self
        }
    }
}
