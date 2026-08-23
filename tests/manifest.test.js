// SPDX-License-Identifier: GPL-3.0-only
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

test("root manifest is a valid Chromium MV3 package with VKey icons", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.equal(manifest.version, require("../package.json").version);
  assert.equal(manifest.background.service_worker, "src/background.js");
  assert.equal("scripts" in manifest.background, false);
  assert.equal("browser_specific_settings" in manifest, false);
  for (const relative of new Set([manifest.background.service_worker, ...Object.values(manifest.icons)])) {
    assert.equal(fs.existsSync(path.join(root, relative)), true, `${relative} must exist`);
  }
  assert.deepEqual(manifest.action.default_icon, manifest.icons);
  const digest = crypto.createHash("sha256").update(Buffer.from(manifest.key, "base64")).digest();
  const extensionId = [...digest.subarray(0, 16)]
    .map((byte) => String.fromCharCode(97 + (byte >> 4), 97 + (byte & 15)))
    .join("");
  assert.equal(extensionId, "ccmggbcabaknpjielbiioolpfnpfgkbi");
});

test("Firefox build uses MV3 background scripts without a service worker", (context) => {
  const output = fs.mkdtempSync(path.join(os.tmpdir(), "vkey-browser-firefox-"));
  context.after(() => fs.rmSync(output, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [path.join(root, "scripts", "build-firefox.js"), output], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr);
  const firefox = JSON.parse(fs.readFileSync(path.join(output, "manifest.json"), "utf8"));
  assert.equal(firefox.manifest_version, 3);
  assert.deepEqual(firefox.background.scripts, ["src/rules.js", "src/background.js"]);
  assert.equal("service_worker" in firefox.background, false);
  assert.equal(firefox.browser_specific_settings.gecko.id, "browser@vkey.phatmt97.github.io");
  assert.equal(fs.existsSync(path.join(output, "assets", "icon-128.png")), true);
});
