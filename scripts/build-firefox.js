// SPDX-License-Identifier: GPL-3.0-only
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const output = path.resolve(process.argv[2] || path.join(root, "dist", "firefox"));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

delete manifest.key;
manifest.background = { scripts: ["src/rules.js", "src/background.js"] };
manifest.browser_specific_settings = {
  gecko: {
    id: "browser@vkey.phatmt97.github.io",
    strict_min_version: "121.0"
  }
};

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.cpSync(path.join(root, "src"), path.join(output, "src"), { recursive: true });
fs.cpSync(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });
fs.copyFileSync(path.join(root, "LICENSE"), path.join(output, "LICENSE"));
fs.writeFileSync(path.join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Firefox extension built at ${output}`);
