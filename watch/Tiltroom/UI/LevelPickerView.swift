import SwiftUI

public struct LevelPickerView: View {
    public let levels: [LevelSpec]
    public let currentIndex: Int
    public let bestMovesByLevelId: [Int: Int]
    public let onSelect: (Int) -> Void
    public let onRecalibrate: () -> Void
    public let onShowGuide: () -> Void

    private let gold = Color(red: 0.906, green: 0.761, blue: 0.478)
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 5), count: 5)

    public init(
        levels: [LevelSpec],
        currentIndex: Int,
        bestMovesByLevelId: [Int: Int],
        onSelect: @escaping (Int) -> Void,
        onRecalibrate: @escaping () -> Void,
        onShowGuide: @escaping () -> Void = {}
    ) {
        self.levels = levels
        self.currentIndex = currentIndex
        self.bestMovesByLevelId = bestMovesByLevelId
        self.onSelect = onSelect
        self.onRecalibrate = onRecalibrate
        self.onShowGuide = onShowGuide
    }

    public var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                HStack(spacing: 4) {
                    Text("关卡 \(bestMovesByLevelId.count)/\(levels.count)")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(gold)
                        .lineLimit(1)
                    Spacer(minLength: 2)
                    Button("引导") {
                        onShowGuide()
                    }
                    .font(.system(size: 11, weight: .medium))
                    .buttonStyle(.bordered)
                    Button("归零") {
                        onRecalibrate()
                    }
                    .font(.system(size: 11, weight: .medium))
                    .buttonStyle(.bordered)
                }

                LazyVGrid(columns: columns, spacing: 5) {
                    ForEach(Array(levels.enumerated()), id: \.element.id) { index, spec in
                        let best = bestMovesByLevelId[spec.id]
                        let isCurrent = index == currentIndex
                        let isPar = (best ?? Int.max) <= spec.par

                        Button {
                            onSelect(index)
                        } label: {
                            ZStack(alignment: .topTrailing) {
                                Text("\(spec.id)")
                                    .font(.system(size: 12, weight: isCurrent ? .bold : .medium, design: .rounded))
                                    .frame(maxWidth: .infinity, minHeight: 28)
                                    .background(
                                        isCurrent
                                            ? gold
                                            : (best != nil ? Color.white.opacity(0.18) : Color.white.opacity(0.08)),
                                        in: RoundedRectangle(cornerRadius: 7)
                                    )
                                    .foregroundStyle(
                                        isCurrent
                                            ? Color(red: 0.10, green: 0.08, blue: 0.05)
                                            : .white
                                    )

                                if isPar && !isCurrent {
                                    Circle()
                                        .fill(gold)
                                        .frame(width: 5, height: 5)
                                        .padding(3)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal, 4)
            .padding(.bottom, 8)
        }
    }
}
