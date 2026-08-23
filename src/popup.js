// SPDX-License-Identifier: GPL-3.0-only
const api = globalThis.browser || globalThis.chrome;
const SESSION_MODES_KEY = "domainModes";
let hostname = "";
let rememberedMode = "default";
let selectedRoute = "default";

function updateEnabledState(enabled) {
  document.querySelector("#routes").disabled = !enabled || !hostname;
  document.querySelector("#status").textContent = enabled ? "" : "Đang tạm dừng";
}

function updateRememberedState() {
  const element = document.querySelector("#remembered");
  if (!hostname) {
    element.textContent = "";
  } else if (selectedRoute === "english") {
    element.textContent = "Rule hard English đang được ưu tiên.";
  } else if (rememberedMode === "vietnamese") {
    element.textContent = "Phiên này đang nhớ: Vietnamese";
  } else if (rememberedMode === "english") {
    element.textContent = "Phiên này đang nhớ: English";
  } else {
    element.textContent = "Chưa có trạng thái V/E cho website này.";
  }
}

async function updateNativeStatus() {
  const element = document.querySelector("#connection");
  try {
    const state = await api.runtime.sendMessage({ type: "get-native-status" });
    element.dataset.state = state && state.status ? state.status : "error";
    if (state && state.status === "connected") {
      element.textContent = "Đã kết nối VKey";
    } else if (state && state.status === "connecting") {
      element.textContent = "Đang kết nối VKey…";
    } else {
      element.textContent = "Chưa kết nối VKeyBrowserHost";
      element.title = state && state.error ? state.error : "";
    }
  } catch (error) {
    element.dataset.state = "error";
    element.textContent = "Không đọc được trạng thái kết nối";
    element.title = error && error.message ? error.message : String(error);
  }
}

async function init() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  hostname = VKeyRules.hostnameFromUrl(tab && tab.url);
  document.querySelector("#hostname").textContent = hostname || "Trang nội bộ trình duyệt";
  const [{ enabled = true, rules = [] }, session] = await Promise.all([
    api.storage.local.get({ enabled: true, rules: [] }),
    api.storage.session.get({ [SESSION_MODES_KEY]: {} })
  ]);
  const direct = VKeyRules.normalizeRules(rules).find((rule) => rule.hostname === hostname);
  selectedRoute = direct ? direct.route : "default";
  rememberedMode = VKeyRules.modeForHostname(hostname, session[SESSION_MODES_KEY]);
  document.querySelector("#enabled").checked = enabled;
  document.querySelector(`input[value="${selectedRoute}"]`).checked = true;
  updateEnabledState(enabled);
  updateRememberedState();
  await updateNativeStatus();
  setTimeout(updateNativeStatus, 500);
}

document.querySelector("#enabled").addEventListener("change", async (event) => {
  const enabled = event.target.checked;
  await api.storage.local.set({ enabled });
  updateEnabledState(enabled);
  if (enabled) document.querySelector("#status").textContent = "Đã bật";
});

document.querySelector("#routes").addEventListener("change", async (event) => {
  const { rules = [] } = await api.storage.local.get({ rules: [] });
  const next = VKeyRules.normalizeRules(rules).filter((rule) => rule.hostname !== hostname);
  if (event.target.value !== "default") next.push({ hostname, route: event.target.value });
  await api.storage.local.set({ rules: VKeyRules.normalizeRules(next) });
  selectedRoute = event.target.value;
  updateRememberedState();
  document.querySelector("#status").textContent = selectedRoute === "default"
    ? "Đã bỏ rule hard"
    : "Đã lưu rule hard";
});

document.querySelector("#options").addEventListener("click", () => api.runtime.openOptionsPage());
init();
