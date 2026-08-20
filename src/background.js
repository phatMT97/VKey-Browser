// SPDX-License-Identifier: GPL-3.0-only
// Chromium MV3 runs this as a service worker; Firefox MV3 runs it as an event
// page and loads rules.js first through background.scripts.
if (typeof importScripts === "function" && typeof VKeyRules === "undefined") {
  importScripts("rules.js");
}

const api = globalThis.browser || globalThis.chrome;
const HOST_NAME = "io.github.phatmt97.vkey";
let port = null;
let reconnectTimer = null;
let rules = [];
let enabled = true;
let nativeState = { status: "connecting", error: "" };

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
  nativeState = { status: "connecting", error: "" };
  try {
    port = api.runtime.connectNative(HOST_NAME);
    port.onMessage.addListener(() => {
      nativeState = { status: "connected", error: "" };
    });
    port.onDisconnect.addListener(() => {
      const error = api.runtime.lastError;
      nativeState = {
        status: "error",
        error: error && error.message ? error.message : "Native host disconnected"
      };
      port = null;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 2000);
    });
    publishActiveContext();
  } catch (error) {
    nativeState = {
      status: "error",
      error: error && error.message ? error.message : String(error)
    };
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
      route: focused ? VKeyRules.routeForContext(enabled, hostname, rules) : "default",
      focused
    });
  } catch (_) {
    send({ protocol: 1, browser: browserExe(), hostname: "", route: "default", focused: false });
  }
}

async function loadSettings() {
  const stored = await api.storage.local.get({ enabled: true, rules: [] });
  enabled = stored.enabled !== false;
  rules = VKeyRules.normalizeRules(stored.rules);
}

api.runtime.onInstalled.addListener(async () => { await loadSettings(); connect(); });
api.runtime.onStartup.addListener(async () => { await loadSettings(); connect(); });
api.tabs.onActivated.addListener(publishActiveContext);
api.tabs.onUpdated.addListener((_tabId, change) => {
  if (change.url || change.status === "complete") publishActiveContext();
});
api.windows.onFocusChanged.addListener(publishActiveContext);
api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message && message.type === "get-native-status") {
    sendResponse(nativeState);
  }
});
api.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local" && (changes.enabled || changes.rules)) {
    await loadSettings();
    await publishActiveContext();
  }
});

loadSettings().then(connect);
setInterval(publishActiveContext, 2000);
