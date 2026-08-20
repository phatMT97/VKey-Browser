// SPDX-License-Identifier: GPL-3.0-only
importScripts("rules.js");

const api = globalThis.browser || globalThis.chrome;
const HOST_NAME = "io.github.phatmt97.vkey";
let port = null;
let reconnectTimer = null;
let rules = [];

function browserExe() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("edg/")) return "msedge.exe";
  if (navigator.brave || ua.includes("brave/")) return "brave.exe";
  if (ua.includes("vivaldi/")) return "vivaldi.exe";
  if (ua.includes("opr/")) return "opera.exe";
  if (ua.includes("firefox/")) return "firefox.exe";
  return "chrome.exe";
}

function connect() {
  if (port) return;
  try {
    port = api.runtime.connectNative(HOST_NAME);
    port.onDisconnect.addListener(() => {
      port = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 2000);
    });
    publishActiveContext();
  } catch (_) {
    port = null;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 5000);
  }
}

function send(message) {
  connect();
  if (!port) return;
  try { port.postMessage(message); } catch (_) { port = null; }
}

async function publishActiveContext() {
  try {
    const windows = await api.windows.getLastFocused({ populate: true });
    const tab = windows && windows.tabs && windows.tabs.find((item) => item.active);
    const hostname = tab ? VKeyRules.hostnameFromUrl(tab.url) : "";
    const focused = Boolean(windows && windows.focused && hostname);
    send({
      protocol: 1,
      browser: browserExe(),
      hostname,
      route: focused ? VKeyRules.routeForHostname(hostname, rules) : "default",
      focused
    });
  } catch (_) {
    send({ protocol: 1, browser: browserExe(), hostname: "", route: "default", focused: false });
  }
}

async function loadRules() {
  const stored = await api.storage.local.get({ rules: [] });
  rules = VKeyRules.normalizeRules(stored.rules);
}

api.runtime.onInstalled.addListener(async () => { await loadRules(); connect(); });
api.runtime.onStartup.addListener(async () => { await loadRules(); connect(); });
api.tabs.onActivated.addListener(publishActiveContext);
api.tabs.onUpdated.addListener((_tabId, change) => {
  if (change.url || change.status === "complete") publishActiveContext();
});
api.windows.onFocusChanged.addListener(publishActiveContext);
api.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local" && changes.rules) {
    rules = VKeyRules.normalizeRules(changes.rules.newValue);
    await publishActiveContext();
  }
});

loadRules().then(connect);
setInterval(publishActiveContext, 2000);
