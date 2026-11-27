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
            let edgePad: CGFloat = 1
            let availW = max(1, size.width - edgePad * 2)
            let availH = max(1, size.height - edgePad * 2)
            let cell = min(availW / CGFloat(cols), availH / CGFloat(rows))
            let boardW = cell * CGFloat(cols)
            let boardH = cell * CGFloat(rows)
            let ox = (size.width - boardW) / 2
            let oy = (size.height - boardH) / 2

            let crates = Set(frame.crates)
            let alpha: Double = isDimmed ? 0.72 : 1.0

            // Subtle board frame backdrop
            let boardRect = CGRect(x: ox, y: oy, width: boardW, height: boardH)
            context.fill(
                Path(roundedRect: boardRect, cornerRadius: 4),
                with: .color(Color(red: 0.055, green: 0.047, blue: 0.043).opacity(alpha))
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
                            with: .color(Color(red: 0.255, green: 0.230, blue: 0.196).opacity(alpha))
                        )
                        let bevel = CGRect(x: px + 0.5, y: py + 0.5, width: max(0, cell - 1), height: 1.4)
                        context.fill(
                            Path(bevel),
                            with: .color(Color(red: 0.34, green: 0.30, blue: 0.255).opacity(alpha * 0.75))
                        )
                        continue
                    }

                    let floorRect = tileRect.insetBy(dx: 0.35, dy: 0.35)
                    context.fill(
                        Path(floorRect),
                        with: .color(Color(red: 0.118, green: 0.104, blue: 0.090).opacity(alpha))
                    )

                    if level.holes.contains(pt) {
                        let center = CGPoint(x: px + cell * 0.5, y: py + cell * 0.5)
                        let holeR = cell * 0.38
                        let holeRect = CGRect(
                            x: center.x - holeR,
                            y: center.y - holeR,
                            width: holeR * 2,
                            height: holeR * 2
                        )
                        let isFallenHere = frame.marbleFell && frame.marble == pt

                        context.fill(
                            Path(ellipseIn: holeRect),
                            with: .radialGradient(
                                Gradient(colors: [
                                    Color.black.opacity(alpha),
                                    Color(red: 0.22, green: 0.075, blue: 0.055).opacity(alpha),
                                ]),
                                center: center,
                                startRadius: 1,
                                endRadius: holeR
                            )
                        )

                        let rimColor = isFallenHere
                            ? Color(red: 1.0, green: 0.38, blue: 0.26)
                            : Color(red: 0.88, green: 0.42, blue: 0.28)
                        context.stroke(
                            Path(ellipseIn: holeRect),
                            with: .color(rimColor.opacity(alpha * (isFallenHere ? 1.0 : 0.88))),
                            lineWidth: max(1.4, cell * (isFallenHere ? 0.11 : 0.085))
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
                            x: px + cell * 0.14,
                            y: py + cell * 0.14,
                            width: cell * 0.72,
                            height: cell * 0.72
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
            let mr = cell * (frame.marbleFell ? 0.22 : 0.30)
            let marbleRect = CGRect(x: mx - mr, y: my - mr, width: mr * 2, height: mr * 2)
            let marbleColor = frame.marbleFell
                ? Color(red: 0.96, green: 0.78, blue: 0.46)
                : Color(red: 0.906, green: 0.761, blue: 0.478)
            context.fill(
                Path(ellipseIn: marbleRect),
                with: .color(marbleColor.opacity(alpha * (frame.marbleFell ? 0.82 : 1.0)))
            )

            if frame.marbleFell {
                let cross = mr * 0.55
                var mark = Path()
                mark.move(to: CGPoint(x: mx - cross, y: my - cross))
                mark.addLine(to: CGPoint(x: mx + cross, y: my + cross))
                mark.move(to: CGPoint(x: mx + cross, y: my - cross))
                mark.addLine(to: CGPoint(x: mx - cross, y: my + cross))
                context.stroke(
                    mark,
                    with: .color(Color(red: 0.14, green: 0.04, blue: 0.03).opacity(alpha)),
                    lineWidth: max(1.4, cell * 0.085)
                )
            } else if frame.hasKey {
                let ringR = cell * 0.16
                let ringRect = CGRect(x: mx - ringR, y: my - ringR, width: ringR * 2, height: ringR * 2)
                context.stroke(
                    Path(ellipseIn: ringRect),
                    with: .color(Color(red: 1.0, green: 0.957, blue: 0.824).opacity(alpha)),
                    lineWidth: max(1.4, cell * 0.08)
                )
            }

            // Active gravity edge glow inset along the board edge so it stays visible edge-to-edge
            if let dir = lockedDirection, !isDimmed {
                let glowAlpha = 0.62 + 0.38 * min(1, max(0, tiltIntensity))
                let barThickness: CGFloat = 3.5
                let inset: CGFloat = 1.0
                let spanInset: CGFloat = 6.0
                let glowColor = Color(red: 0.906, green: 0.761, blue: 0.478).opacity(glowAlpha)
                let barRect: CGRect
                switch dir {
                case .up:
                    barRect = CGRect(x: ox + spanInset, y: oy + inset, width: max(0, boardW - spanInset * 2), height: barThickness)
                case .down:
                    barRect = CGRect(x: ox + spanInset, y: oy + boardH - barThickness - inset, width: max(0, boardW - spanInset * 2), height: barThickness)
                case .left:
                    barRect = CGRect(x: ox + inset, y: oy + spanInset, width: barThickness, height: max(0, boardH - spanInset * 2))
                case .right:
                    barRect = CGRect(x: ox + boardW - barThickness - inset, y: oy + spanInset, width: barThickness, height: max(0, boardH - spanInset * 2))
                }
                context.fill(Path(roundedRect: barRect, cornerRadius: 2), with: .color(glowColor))
            }
        }
    }
}
