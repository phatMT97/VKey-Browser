// SPDX-License-Identifier: GPL-3.0-only
const api = globalThis.browser || globalThis.chrome;
let hostname = "";

async function init() {
  const [tab] = await api.tabs.query({ active: true, currentWindow: true });
  hostname = VKeyRules.hostnameFromUrl(tab && tab.url);
  document.querySelector("#hostname").textContent = hostname || "Trang nội bộ trình duyệt";
  const { rules = [] } = await api.storage.local.get({ rules: [] });
  const direct = VKeyRules.normalizeRules(rules).find((rule) => rule.hostname === hostname);
  const selected = direct ? direct.route : "default";
  document.querySelector(`input[value="${selected}"]`).checked = true;
  document.querySelector("#routes").disabled = !hostname;
}

document.querySelector("#routes").addEventListener("change", async (event) => {
  const { rules = [] } = await api.storage.local.get({ rules: [] });
  const next = VKeyRules.normalizeRules(rules).filter((rule) => rule.hostname !== hostname);
  if (event.target.value !== "default") next.push({ hostname, route: event.target.value });
  await api.storage.local.set({ rules: VKeyRules.normalizeRules(next) });
  document.querySelector("#status").textContent = "Đã lưu";
});

document.querySelector("#options").addEventListener("click", () => api.runtime.openOptionsPage());
init();
