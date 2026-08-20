// SPDX-License-Identifier: GPL-3.0-only
const test = require("node:test");
const assert = require("node:assert/strict");
const rules = require("../src/rules.js");

test("longest matching parent domain wins", () => {
  const configured = [
    { hostname: "example.com", route: "english" },
    { hostname: "forum.example.com", route: "tsf" }
  ];
  assert.equal(rules.routeForHostname("www.example.com", configured), "english");
  assert.equal(rules.routeForHostname("x.forum.example.com", configured), "tsf");
});

test("unrelated suffix does not match", () => {
  assert.equal(rules.routeForHostname("notexample.com", [
    { hostname: "example.com", route: "english" }
  ]), "default");
});

test("only http and https URLs expose a hostname", () => {
  assert.equal(rules.hostnameFromUrl("https://Sub.Example.com/path?q=secret"), "sub.example.com");
  assert.equal(rules.hostnameFromUrl("chrome://settings"), "");
});
