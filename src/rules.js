// SPDX-License-Identifier: GPL-3.0-only
(function (root) {
  "use strict";

  const ROUTES = Object.freeze(["default", "english", "tsf"]);

  function normalizeHostname(value) {
    return String(value || "").trim().toLowerCase().replace(/^\.+|\.+$/g, "");
  }

  function normalizeRules(value) {
    if (!Array.isArray(value)) return [];
    const unique = new Map();
    for (const item of value) {
      const hostname = normalizeHostname(item && item.hostname);
      const route = item && ROUTES.includes(item.route) ? item.route : "default";
      if (hostname && /^[a-z0-9.-]+$/.test(hostname) && route !== "default") {
        unique.set(hostname, { hostname, route });
      }
    }
    return [...unique.values()].sort((a, b) => a.hostname.localeCompare(b.hostname));
  }

  function routeForHostname(hostname, rules) {
    const host = normalizeHostname(hostname);
    let best = null;
    for (const rule of normalizeRules(rules)) {
      if (host === rule.hostname || host.endsWith(`.${rule.hostname}`)) {
        if (!best || rule.hostname.length > best.hostname.length) best = rule;
      }
    }
    return best ? best.route : "default";
  }

  function hostnameFromUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:"
        ? normalizeHostname(url.hostname)
        : "";
    } catch (_) {
      return "";
    }
  }

  const api = { ROUTES, normalizeHostname, normalizeRules, routeForHostname, hostnameFromUrl };
  root.VKeyRules = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
