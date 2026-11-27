# Game Mechanics & Market Research

This document summarizes research on **Tiltroom**'s core puzzle mechanics, historical origins, and existing App Store comparables.

## Summary

- **Core puzzle strategy**: Well-established and time-tested. Four-directional "slide until you hit a wall" grid puzzles and simultaneous board-tilt puzzles have decades of precedent in both video games and tabletop games.
- **Interaction & platform fit**: Differentiated. Combining a **standalone Apple Watch** experience with **Gravity Shutter** (two-step wrist-tilt aiming + confirmation trigger) on a discrete 4-way grid avoids the precision issues of continuous physics tilt-ball games on a small watch screen.

---

## 1. Historical Origins & Original Designers

Tiltroom's mechanics draw from several classic puzzle lineages rather than a single source:

| Lineage / Milestone                   | Year | Designer / Publisher                     | Key Mechanic & Relevance                                                                                                                          |
| ------------------------------------- | ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BRIO *Labyrinth***                  | 1946 | BRIO                                     | The classic physical wooden tilt-maze where players tilt a board to roll a steel marble past holes.                                               |
| ***Pengo***                           | 1982 | Sega                                     | Early arcade precedent featuring ice blocks that slide continuously in a straight line until hitting a wall or obstacle.                          |
| ***Chip's Challenge***                | 1989 | Chuck Sommerville                        | Codified and popularized the 4-way "frictionless ice" grid puzzle (Atari Lynx, later *Windows Entertainment Pack 4* in 1992); influenced *Pokémon*. |
| ***Ricochet Robots***                 | 1999 | Alex Randolph (*Hans im Glück*)          | Seminal tabletop puzzle where pieces slide in cardinal directions until hitting a wall or another piece (proven PSPACE-complete).                 |
| ***Tilt*** (*Teetering Logic Maze*)   | 2010 | Vesa Timonen & Timo Jokitalo (ThinkFun)  | Closest physical analog: tilting a balanced grid moves all unanchored sliders simultaneously until blocked, using stoppers and a center hole.     |

---

## 2. Existing App Store Comparables

Several App Store titles share individual elements with Tiltroom, though none match the exact combination of discrete 4-way sliding, environmental elements (keys, doors, crates, holes), and watch-only Gravity Shutter input:

| Category                          | App Store Examples                                  | Similarities                                                               | Differences from Tiltroom                                                                   |
| --------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **4-way slide-until-wall puzzle** | *Quell* series (Fallen Tree Games)                  | Slide-until-blocked grid movement, gates/hazards, move-count optimization. | Uses touchscreen **swipe** controls primarily on iPhone/iPad rather than wrist tilt.        |
| **Whole-board gravity sliding**   | *Tilt: Slide & Clear Blocks*, *Tilt. Puzzle*        | Changing gravity makes all pieces on the board slide simultaneously.       | Focuses on block clearing or number merging via swipe/tap rather than maze/key-door logic.  |
| **ThinkFun *Tilt* digital port**  | *(None)*                                            | ThinkFun published *Rush Hour* and others on iOS, but not *Tilt*.          | No official ThinkFun *Tilt* app exists on the App Store.                                    |
| **Apple Watch tilt mazes**        | *Marble Maze: Tilt Labyrinth*, *Labyrinth Maze Puzzle* | Standalone/Watch accelerometer wrist-tilt controls with holes and goals.  | Uses **continuous physics** rolling rather than discrete 4-way turn-based grid sliding.     |

---

## 3. Product Positioning Takeaways

1. **Validated puzzle depth**: The core 4-way slide-until-blocked mechanic with interactive obstacles (walls, keys, doors, holes, crates) is proven across *Chip's Challenge*, *Ricochet Robots*, *Quell*, and ThinkFun's *Tilt*.
2. **Watch-first ergonomics**: On Apple Watch, continuous accelerometer rolling is prone to accidental drops caused by natural wrist micro-movements. **Gravity Shutter** (tilt to aim, confirm/hold-to-trigger to slide) turns tilt input into deliberate, turn-based puzzle play suited for short watch sessions.
