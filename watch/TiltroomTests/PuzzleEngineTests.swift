import XCTest
@testable import Tiltroom

final class PuzzleEngineTests: XCTestCase {
    func testAll30LevelsSolveAtExactPar() {
        XCTAssertEqual(LevelCatalog.all.count, 30)
        for spec in LevelCatalog.all {
            XCTAssertEqual(
                spec.solution.count,
                spec.par,
                "Level \(spec.id) (\(spec.name)) par mismatch"
            )
            XCTAssertTrue(
                PuzzleEngine.verifySolution(for: spec),
                "Level \(spec.id) (\(spec.name)) solution did not win cleanly"
            )
        }
    }

    func testCrateTemporarilyPlugsHoleWithinSingleSlideThenReopens() {
        let parsed = PuzzleEngine.parse(grid: [
            "######",
            "#MC.H#",
            "#K..D#",
            "######",
        ])

        // Sliding right: crate hits hole and temporarily plugs it, marble glides across safely.
        let slideRight = PuzzleEngine.tilt(level: parsed.level, state: parsed.initialState, direction: .right)
        XCTAssertFalse(slideRight.dead)
        XCTAssertTrue(slideRight.didDropCrate)
        XCTAssertTrue(slideRight.state.crates.isEmpty)
        XCTAssertEqual(slideRight.state.marble, GridPoint(x: 4, y: 1))

        // On the next slide left then right, the hole is open again and marble falls in.
        let slideLeft = PuzzleEngine.tilt(level: parsed.level, state: slideRight.state, direction: .left)
        let backRight = PuzzleEngine.tilt(level: parsed.level, state: slideLeft.state, direction: .right)
        XCTAssertTrue(backRight.dead)
    }

    func testNoOpSlideIntoWallReturnsDidMoveFalse() {
        let parsed = PuzzleEngine.parse(grid: [
            "#####",
            "#MKD#",
            "#####",
        ])
        let result = PuzzleEngine.tilt(level: parsed.level, state: parsed.initialState, direction: .left)
        XCTAssertFalse(result.didMove)
        XCTAssertFalse(result.dead)
        XCTAssertFalse(result.won)
        XCTAssertEqual(result.state, parsed.initialState)
    }

    func testCrownOnLeftRotatesScreenGravity180Degrees() {
        let rightCrown = TiltMapper.screenGravity(gx: 0.4, gy: -0.3, crownOnLeft: false)
        XCTAssertEqual(rightCrown.x, 0.4, accuracy: 1e-6)
        XCTAssertEqual(rightCrown.y, 0.3, accuracy: 1e-6)

        let leftCrown = TiltMapper.screenGravity(gx: 0.4, gy: -0.3, crownOnLeft: true)
        XCTAssertEqual(leftCrown.x, -0.4, accuracy: 1e-6)
        XCTAssertEqual(leftCrown.y, -0.3, accuracy: 1e-6)
    }

    func testTiltMapperBaselineAsymmetricThresholdsAndHysteresis() {
        var config = TiltMapper.Config()
        config.smoothingAlpha = 1.0
        var mapper = TiltMapper(config: config)

        // First sample establishes viewing posture baseline (natural downward wrist tilt).
        let neutral = mapper.update(gx: 0.0, gy: -0.5, crownOnLeft: false)
        XCTAssertNil(neutral.direction)

        // Small upward pitch (-0.20 delta on screenY) exceeds pitch threshold (0.17) -> .up
        let pitchUp = mapper.update(gx: 0.0, gy: -0.3, crownOnLeft: false)
        XCTAssertEqual(pitchUp.direction, .up)

        // Pull back to -0.13 (between exit 0.11 and enter 0.17) -> stays .up due to hysteresis
        let holdUp = mapper.update(gx: 0.0, gy: -0.37, crownOnLeft: false)
        XCTAssertEqual(holdUp.direction, .up)

        // Pull back inside exit threshold (-0.05) -> releases to nil
        let released = mapper.update(gx: 0.0, gy: -0.45, crownOnLeft: false)
        XCTAssertNil(released.direction)

        // Roll right by +0.30 -> .right
        let rollRight = mapper.update(gx: 0.30, gy: -0.5, crownOnLeft: false)
        XCTAssertEqual(rollRight.direction, .right)
    }
}
