import SwiftUI

public struct GameView: View {
    @StateObject private var game = GameController()
    @StateObject private var sensor = TiltShutterSensor()
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.isLuminanceReduced) private var isLuminanceReduced

    @State private var showingLevels = false

    private let gold = Color(red: 0.906, green: 0.761, blue: 0.478)
    private let bg = Color(red: 0.078, green: 0.067, blue: 0.055)

    public init() {}

    public var body: some View {
        VStack(spacing: 2) {
            headerBar
            boardArea
            footerBar
        }
        .padding(.horizontal, 4)
        .padding(.bottom, 2)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(bg.ignoresSafeArea())
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
    }

    private var headerBar: some View {
        HStack(spacing: 4) {
            Button {
                showingLevels = true
            } label: {
                HStack(spacing: 3) {
                    Text("\(game.currentSpec.id)")
                        .font(.system(size: 13, weight: .bold, design: .rounded))
                        .foregroundStyle(gold)
                    Text(game.currentSpec.name)
                        .font(.system(size: 12, weight: .medium))
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
                .font(.system(size: 12, weight: .semibold, design: .monospaced))
                .foregroundStyle(game.moveCount <= game.currentSpec.par ? gold : .secondary)
        }
        .padding(.horizontal, 4)
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
    }

    private var footerBar: some View {
        HStack(spacing: 6) {
            Button {
                game.undo()
            } label: {
                Image(systemName: "arrow.uturn.backward")
                    .font(.system(size: 12, weight: .semibold))
                    .frame(width: 30, height: 24)
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
                    .frame(width: 30, height: 24)
                    .background(Color.white.opacity(0.14), in: Capsule())
                    .foregroundStyle(.white)
            }
            .buttonStyle(.plain)
        }
        .opacity(isLuminanceReduced ? 0.35 : 1.0)
    }

    @ViewBuilder
    private var primaryShutterButton: some View {
        if game.mode == .dead {
            Button {
                game.undo()
            } label: {
                Text("退一步")
                    .font(.system(size: 12, weight: .bold))
                    .frame(maxWidth: .infinity, minHeight: 24)
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
                    .frame(maxWidth: .infinity, minHeight: 24)
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
                    .frame(maxWidth: .infinity, minHeight: 24)
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

        if game.mode == .dead {
            game.undo()
            return
        }

        fireShutter()
    }

    private func fireShutter() {
        if let dir = sensor.directionForShutter() {
            game.commit(dir)
        } else {
            Haptics.noOp()
            game.showHint(sensor.isAvailable ? "先倾腕瞄准" : "请滑动棋盘")
        }
    }

    private func syncSensorState() {
        if scenePhase == .active && !isLuminanceReduced {
            sensor.start(recalibrate: true)
        } else {
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
