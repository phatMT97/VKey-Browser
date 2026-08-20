// SPDX-License-Identifier: GPL-3.0-only
const api = globalThis.browser || globalThis.chrome;
let rules = [];

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
    const badge = document.createElement("strong");
    badge.textContent = rule.route === "tsf" ? "TSF" : "English";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Xóa";
    remove.addEventListener("click", async () => {
      rules = rules.filter((item) => item.hostname !== rule.hostname);
      await save();
    });
    row.append(text, badge, remove);
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

api.storage.local.get({ rules: [] }).then((stored) => {
  rules = VKeyRules.normalizeRules(stored.rules);
  render();
});
