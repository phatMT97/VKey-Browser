// SPDX-License-Identifier: GPL-3.0-only
const api = globalThis.browser || globalThis.chrome;
let rules = [];

function updateEnabledState(enabled) {
  document.querySelector("#enabled").checked = enabled;
}

async function save() {
  rules = VKeyRules.normalizeRules(rules);
  await api.storage.local.set({ rules });
  render();
}

function render() {
  const root = document.querySelector("#rules");
  root.replaceChildren();
  for (const rule of rules) {
    const row = document.createElement("div");
    row.className = "rule";
    const text = document.createElement("span");
    text.textContent = rule.hostname;
    const route = document.createElement("select");
    route.setAttribute("aria-label", `Chế độ cho ${rule.hostname}`);
    for (const [value, label] of [["english", "English (hard)"], ["tsf", "TSF tương thích (hard)"]]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = rule.route === value;
      route.append(option);
    }
    route.addEventListener("change", async () => {
      rules = rules.map((item) => item.hostname === rule.hostname
        ? { ...item, route: route.value }
        : item);
      await save();
      document.querySelector("#status").textContent = "Đã cập nhật";
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Xóa";
    remove.addEventListener("click", async () => {
      rules = rules.filter((item) => item.hostname !== rule.hostname);
      await save();
    });
    row.append(text, route, remove);
    root.append(row);
  }
  if (!rules.length) root.textContent = "Chưa có quy tắc nào.";
}

document.querySelector("#add-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const hostname = VKeyRules.normalizeHostname(document.querySelector("#hostname-input").value);
  if (!hostname || !/^[a-z0-9.-]+$/.test(hostname)) {
    document.querySelector("#status").textContent = "Tên miền không hợp lệ";
    return;
  }
  rules = rules.filter((item) => item.hostname !== hostname);
  rules.push({ hostname, route: document.querySelector("#route-input").value });
  await save();
  event.target.reset();
  document.querySelector("#status").textContent = "Đã lưu";
});

document.querySelector("#enabled").addEventListener("change", async (event) => {
  const enabled = event.target.checked;
  await api.storage.local.set({ enabled });
  updateEnabledState(enabled);
  document.querySelector("#status").textContent = enabled ? "Đã bật" : "Đang tạm dừng";
});

api.storage.local.get({ enabled: true, rules: [] }).then((stored) => {
  rules = VKeyRules.normalizeRules(stored.rules);
  render();
  updateEnabledState(stored.enabled !== false);
});
