// SPDX-License-Identifier: GPL-3.0-only
const api = globalThis.browser || globalThis.chrome;
let hostname = "";

function updateEnabledState(enabled) {
  document.querySelector("#routes").disabled = !enabled || !hostname;
  document.querySelector("#status").textContent = enabled ? "" : "Đang tạm dừng";
}

async function init() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  hostname = VKeyRules.hostnameFromUrl(tab && tab.url);
  document.querySelector("#hostname").textContent = hostname || "Trang nội bộ trình duyệt";
  const { enabled = true, rules = [] } = await api.storage.local.get({ enabled: true, rules: [] });
  const direct = VKeyRules.normalizeRules(rules).find((rule) => rule.hostname === hostname);
  const selected = direct ? direct.route : "default";
  document.querySelector("#enabled").checked = enabled;
  document.querySelector(`input[value="${selected}"]`).checked = true;
  updateEnabledState(enabled);
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
  document.querySelector("#status").textContent = "Đã lưu";
});

document.querySelector("#options").addEventListener("click", () => api.runtime.openOptionsPage());
init();
