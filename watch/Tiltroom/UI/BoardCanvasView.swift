import SwiftUI

public struct BoardCanvasView: View {
    public let level: ParsedLevel
    public let frame: MoveFrame
    public let lockedDirection: Direction?
    public let tiltIntensity: Double
    public let isDimmed: Bool

    public init(
        level: ParsedLevel,
        frame: MoveFrame,
        lockedDirection: Direction?,
        tiltIntensity: Double,
        isDimmed: Bool
    ) {
        self.level = level
        self.frame = frame
        self.lockedDirection = lockedDirection
        self.tiltIntensity = tiltIntensity
        self.isDimmed = isDimmed
    }

    public var body: some View {
        Canvas { context, size in
            let cols = max(1, level.width)
            let rows = max(1, level.height)
            let edgePad: CGFloat = 6
            let availW = max(1, size.width - edgePad * 2)
            let availH = max(1, size.height - edgePad * 2)
            let cell = floor(min(availW / CGFloat(cols), availH / CGFloat(rows)))
            let boardW = cell * CGFloat(cols)
            let boardH = cell * CGFloat(rows)
            let ox = floor((size.width - boardW) / 2)
            let oy = floor((size.height - boardH) / 2)

            let crates = Set(frame.crates)
            let alpha: Double = isDimmed ? 0.52 : 1.0

            // Subtle board frame backdrop
            let boardRect = CGRect(x: ox - 1, y: oy - 1, width: boardW + 2, height: boardH + 2)
            context.fill(
                Path(roundedRect: boardRect, cornerRadius: 5),
                with: .color(Color(red: 0.06, green: 0.05, blue: 0.05).opacity(alpha))
            )

            for y in 0..<rows {
                for x in 0..<cols {
                    let pt = GridPoint(x: x, y: y)
                    let px = ox + CGFloat(x) * cell
                    let py = oy + CGFloat(y) * cell
                    let tileRect = CGRect(x: px, y: py, width: cell, height: cell)

                    if level.walls.contains(pt) {
                        context.fill(
                            Path(tileRect),
                            with: .color(Color(red: 0.235, green: 0.212, blue: 0.180).opacity(alpha))
                        )
                        let bevel = CGRect(x: px + 0.5, y: py + 0.5, width: cell - 1, height: 1.5)
                        context.fill(
                            Path(bevel),
                            with: .color(Color(red: 0.30, green: 0.27, blue: 0.23).opacity(alpha * 0.7))
                        )
                        continue
                    }

                    let floorRect = tileRect.insetBy(dx: 0.6, dy: 0.6)
                    context.fill(
                        Path(floorRect),
                        with: .color(Color(red: 0.102, green: 0.090, blue: 0.078).opacity(alpha))
                    )

                    if level.holes.contains(pt) {
                        let center = CGPoint(x: px + cell * 0.5, y: py + cell * 0.5)
                        let holeR = cell * 0.35
                        let holeRect = CGRect(
                            x: center.x - holeR,
                            y: center.y - holeR,
                            width: holeR * 2,
                            height: holeR * 2
                        )
                        context.fill(
                            Path(ellipseIn: holeRect),
                            with: .radialGradient(
                                Gradient(colors: [
                                    Color.black.opacity(alpha),
                                    Color(red: 0.165, green: 0.129, blue: 0.094).opacity(alpha),
                                ]),
                                center: center,
                                startRadius: 1,
                                endRadius: cell * 0.42
                            )
                        )
                    }

                    if level.door == pt {
                        let doorRect = CGRect(
                            x: px + cell * 0.22,
                            y: py + cell * 0.12,
                            width: cell * 0.56,
                            height: cell * 0.76
                        )
                        let doorColor = frame.hasKey
                            ? Color(red: 0.843, green: 0.710, blue: 0.416)
                            : Color(red: 0.427, green: 0.392, blue: 0.345)
                        context.fill(
                            Path(roundedRect: doorRect, cornerRadius: 3),
                            with: .color(doorColor.opacity(alpha))
                        )
                        let keyHoleR = cell * 0.085
                        let keyHoleRect = CGRect(
                            x: px + cell * 0.5 - keyHoleR,
                            y: py + cell * 0.48 - keyHoleR,
                            width: keyHoleR * 2,
                            height: keyHoleR * 2
                        )
                        context.fill(
                            Path(ellipseIn: keyHoleRect),
                            with: .color(Color(red: 0.10, green: 0.08, blue: 0.05).opacity(alpha))
                        )
                    }

                    if level.key == pt && !frame.hasKey {
                        let keyColor = Color(red: 0.906, green: 0.761, blue: 0.478).opacity(alpha)
                        let headR = cell * 0.13
                        let headCenter = CGPoint(x: px + cell * 0.40, y: py + cell * 0.38)
                        let headRect = CGRect(
                            x: headCenter.x - headR,
                            y: headCenter.y - headR,
                            width: headR * 2,
                            height: headR * 2
                        )
                        context.stroke(
                            Path(ellipseIn: headRect),
                            with: .color(keyColor),
                            lineWidth: max(1.4, cell * 0.08)
                        )
                        var stem = Path()
                        stem.move(to: CGPoint(x: px + cell * 0.50, y: py + cell * 0.48))
                        stem.addLine(to: CGPoint(x: px + cell * 0.72, y: py + cell * 0.70))
                        stem.move(to: CGPoint(x: px + cell * 0.61, y: py + cell * 0.60))
                        stem.addLine(to: CGPoint(x: px + cell * 0.70, y: py + cell * 0.55))
                        context.stroke(
                            stem,
                            with: .color(keyColor),
                            lineWidth: max(1.4, cell * 0.08)
                        )
                    }

                    if crates.contains(pt) {
                        let crateRect = CGRect(
                            x: px + cell * 0.16,
                            y: py + cell * 0.16,
                            width: cell * 0.68,
                            height: cell * 0.68
                        )
                        context.fill(
                            Path(roundedRect: crateRect, cornerRadius: 3),
                            with: .color(Color(red: 0.545, green: 0.353, blue: 0.196).opacity(alpha))
                        )
                        context.stroke(
                            Path(roundedRect: crateRect, cornerRadius: 3),
                            with: .color(Color(red: 0.68, green: 0.47, blue: 0.28).opacity(alpha * 0.8)),
                            lineWidth: 1
                        )
                    }
                }
            }

            // Marble
            let mx = ox + (CGFloat(frame.marble.x) + 0.5) * cell
            let my = oy + (CGFloat(frame.marble.y) + 0.5) * cell
            let mr = cell * (frame.marbleFell ? 0.17 : 0.29)
            let marbleRect = CGRect(x: mx - mr, y: my - mr, width: mr * 2, height: mr * 2)
            let marbleColor = frame.marbleFell
                ? Color(red: 0.36, green: 0.29, blue: 0.20)
                : Color(red: 0.906, green: 0.761, blue: 0.478)
            context.fill(
                Path(ellipseIn: marbleRect),
                with: .color(marbleColor.opacity(alpha))
            )

            if frame.hasKey && !frame.marbleFell {
                let ringR = cell * 0.16
                let ringRect = CGRect(x: mx - ringR, y: my - ringR, width: ringR * 2, height: ringR * 2)
                context.stroke(
                    Path(ellipseIn: ringRect),
                    with: .color(Color(red: 1.0, green: 0.957, blue: 0.824).opacity(alpha)),
                    lineWidth: max(1.4, cell * 0.08)
                )
            }

            // Active gravity edge glow when wrist tilt locks a direction
            if let dir = lockedDirection, !isDimmed {
                let glowAlpha = 0.55 + 0.45 * min(1, max(0, tiltIntensity))
                let barThickness: CGFloat = 3.5
                let glowColor = Color(red: 0.906, green: 0.761, blue: 0.478).opacity(glowAlpha)
                let barRect: CGRect
                switch dir {
                case .up:
                    barRect = CGRect(x: ox + 6, y: max(1, oy - barThickness - 1.5), width: boardW - 12, height: barThickness)
                case .down:
                    barRect = CGRect(x: ox + 6, y: min(size.height - barThickness - 1, oy + boardH + 1.5), width: boardW - 12, height: barThickness)
                case .left:
                    barRect = CGRect(x: max(1, ox - barThickness - 1.5), y: oy + 6, width: barThickness, height: boardH - 12)
                case .right:
                    barRect = CGRect(x: min(size.width - barThickness - 1, ox + boardW + 1.5), y: oy + 6, width: barThickness, height: boardH - 12)
                }
                context.fill(Path(roundedRect: barRect, cornerRadius: 2), with: .color(glowColor))
            }
        }
    }
}
