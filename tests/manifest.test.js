// SPDX-License-Identifier: GPL-3.0-only
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

test("manifest declares Chromium and Firefox MV3 background entry points", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.background.service_worker, "src/background.js");
  assert.deepEqual(manifest.background.scripts, ["src/rules.js", "src/background.js"]);
  for (const relative of new Set([
    manifest.background.service_worker,
    ...manifest.background.scripts
  ])) {
    assert.equal(fs.existsSync(path.join(root, relative)), true, `${relative} must exist`);
  }
});
