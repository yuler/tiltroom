import { describe, expect, it } from "vitest";
import {
  resolvePointerRelease,
  shouldInterceptActivationKey,
} from "./watchDemoInteraction";

describe("GyroController pointer release & cancel", () => {
  it("aborts without triggering on pointercancel even after aiming via drag", () => {
    expect(
      resolvePointerRelease({ moved: true, snapped: "right" }, "right", true),
    ).toEqual({ action: "reset" });
  });

  it("aborts without triggering on pointercancel even when aimDirection is armed", () => {
    expect(
      resolvePointerRelease({ moved: false, snapped: null }, "down", true),
    ).toEqual({ action: "reset" });
  });

  it("triggers snapped direction on normal pointerup after drag", () => {
    expect(
      resolvePointerRelease({ moved: true, snapped: "left" }, null, false),
    ).toEqual({ action: "trigger", dir: "left" });
  });

  it("triggers existing aimDirection on normal pointerup tap without drag", () => {
    expect(
      resolvePointerRelease({ moved: false, snapped: null }, "up", false),
    ).toEqual({ action: "trigger", dir: "up" });
  });

  it("resets on normal pointerup when neither dragged nor armed", () => {
    expect(
      resolvePointerRelease({ moved: false, snapped: null }, null, false),
    ).toEqual({ action: "reset" });
  });
});

describe("InteractiveWatchDemo Space/Enter keyboard interception", () => {
  it("does not intercept Space/Enter when focus is on or inside a button or link", () => {
    const buttonTarget = {
      tagName: "BUTTON",
      closest: (selector: string) => (selector.includes("button") ? {} : null),
    };
    const iconInsideButton = {
      tagName: "SVG",
      closest: (selector: string) => (selector.includes("button") ? {} : null),
    };
    const linkTarget = {
      tagName: "A",
      closest: (selector: string) => (selector.includes("a") ? {} : null),
    };

    expect(shouldInterceptActivationKey(buttonTarget)).toBe(false);
    expect(shouldInterceptActivationKey(iconInsideButton)).toBe(false);
    expect(shouldInterceptActivationKey(linkTarget)).toBe(false);
  });

  it("does not intercept Space/Enter on form inputs", () => {
    expect(shouldInterceptActivationKey({ tagName: "INPUT" })).toBe(false);
    expect(shouldInterceptActivationKey({ tagName: "TEXTAREA" })).toBe(false);
    expect(shouldInterceptActivationKey({ tagName: "SELECT" })).toBe(false);
  });

  it("intercepts Space/Enter when focus is on the demo stage or board canvas", () => {
    const stageDiv = {
      tagName: "DIV",
      closest: () => null,
    };
    const boardCanvas = {
      tagName: "CANVAS",
      closest: () => null,
    };

    expect(shouldInterceptActivationKey(stageDiv)).toBe(true);
    expect(shouldInterceptActivationKey(boardCanvas)).toBe(true);
    expect(shouldInterceptActivationKey(null)).toBe(true);
  });
});
