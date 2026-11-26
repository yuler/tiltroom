import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  bumpSemver,
  detectBumpFromMessage,
  isReleasePath,
  resolveReleasePlan,
} from "./resolve-release.mjs";

function makeTempRepo() {
  const dir = mkdtempSync(join(tmpdir(), "tiltroom-release-test-"));
  const run = (args) =>
    execFileSync("git", args, {
      cwd: dir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

  run(["init", "-b", "main"]);
  run(["config", "user.name", "Test User"]);
  run(["config", "user.email", "test@example.com"]);

  const commitFile = (relPath, content, message) => {
    const abs = join(dir, relPath);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content);
    run(["add", relPath]);
    run(["commit", "-m", message]);
    return run(["rev-parse", "HEAD"]);
  };

  const cleanup = () => rmSync(dir, { recursive: true, force: true });
  return { dir, run, commitFile, cleanup };
}

test("isReleasePath matches watch app and release plumbing only", () => {
  assert.equal(isReleasePath("watch/Sources/App.swift"), true);
  assert.equal(isReleasePath("watch/project.yml"), true);
  assert.equal(isReleasePath("scripts/watch-xcodegen.sh"), true);
  assert.equal(isReleasePath(".github/workflows/watch-release.yml"), true);

  assert.equal(isReleasePath("README.md"), false);
  assert.equal(isReleasePath("GLOSSARY.md"), false);
  assert.equal(isReleasePath("prototypes/gravity-shutter.html"), false);
});

test("bump helpers handle patch, minor, and major", () => {
  assert.deepEqual(bumpSemver([0, 0, 0], "patch"), [0, 0, 1]);
  assert.deepEqual(bumpSemver([0, 1, 5], "minor"), [0, 2, 0]);
  assert.deepEqual(bumpSemver([0, 1, 5], "major"), [1, 0, 0]);
  assert.equal(detectBumpFromMessage("feat [minor] add watch app"), "minor");
  assert.equal(detectBumpFromMessage("feat [major] v1 launch"), "major");
  assert.equal(detectBumpFromMessage("fix tilt jitter"), "patch");
});

test("skips automatic release when only docs or prototypes change", () => {
  const repo = makeTempRepo();
  try {
    repo.commitFile("README.md", "# Tiltroom\n", "docs: add readme");
    const plan = resolveReleasePlan({ cwd: repo.dir, eventName: "workflow_run" });
    assert.equal(plan.skip, true);
    assert.match(plan.reason, /no release-affecting files/);
  } finally {
    repo.cleanup();
  }
});

test("plans automatic patch/minor release when watch/ files change", () => {
  const repo = makeTempRepo();
  try {
    repo.commitFile("watch/project.yml", "name: Tiltroom\n", "feat: scaffold watch app");
    const first = resolveReleasePlan({ cwd: repo.dir, eventName: "workflow_run" });
    assert.equal(first.skip, false);
    assert.equal(first.version, "0.0.1");
    assert.equal(first.tag, "v0.0.1");
    assert.equal(first.uploadTestflight, true);

    repo.run(["tag", "v0.0.1"]);
    repo.commitFile("watch/Sources/App.swift", "// v2\n", "feat [minor] add levels");
    const second = resolveReleasePlan({ cwd: repo.dir, eventName: "workflow_run" });
    assert.equal(second.skip, false);
    assert.equal(second.version, "0.1.0");
    assert.equal(second.tag, "v0.1.0");
  } finally {
    repo.cleanup();
  }
});

test("honors [skip release] in HEAD subject", () => {
  const repo = makeTempRepo();
  try {
    repo.commitFile("watch/Sources/App.swift", "// edit\n", "chore: tweak [skip release]");
    const plan = resolveReleasePlan({ cwd: repo.dir, eventName: "workflow_run" });
    assert.equal(plan.skip, true);
    assert.match(plan.reason, /\[skip release\]/);
  } finally {
    repo.cleanup();
  }
});

test("supports manual tag push and workflow_dispatch overrides", () => {
  const repo = makeTempRepo();
  try {
    repo.commitFile("watch/Sources/App.swift", "// init\n", "init");
    const tagPlan = resolveReleasePlan({
      cwd: repo.dir,
      eventName: "push",
      refName: "v0.2.0",
    });
    assert.equal(tagPlan.skip, false);
    assert.equal(tagPlan.version, "0.2.0");
    assert.equal(tagPlan.createTag, false);

    const dispatchPlan = resolveReleasePlan({
      cwd: repo.dir,
      eventName: "workflow_dispatch",
      inputVersion: "0.3.0",
      inputTestflight: "false",
    });
    assert.equal(dispatchPlan.skip, false);
    assert.equal(dispatchPlan.version, "0.3.0");
    assert.equal(dispatchPlan.createTag, true);
    assert.equal(dispatchPlan.uploadTestflight, false);
  } finally {
    repo.cleanup();
  }
});
