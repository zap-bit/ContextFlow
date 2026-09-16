import { DEFAULT_SETTINGS, LocalStorageManager } from "./storage/LocalStorageManager.js";

const storage = new LocalStorageManager();
const settingKeys = Object.keys(DEFAULT_SETTINGS).filter((key) => key !== "privacySeen");

async function load() {
  const settings = await storage.settings();
  settingKeys.forEach((key) => {
    const input = document.getElementById(key);
    if (!input) return;
    if (input.type === "checkbox") input.checked = settings[key];
    else input.value = settings[key];
  });
}

function selectedSettings() {
  return Object.fromEntries(settingKeys.map((key) => {
    const input = document.getElementById(key);
    return [key, input.type === "checkbox" ? input.checked : input.value];
  }));
}

document.getElementById("save").addEventListener("click", async () => {
  await storage.saveSettings(selectedSettings());
});

document.getElementById("view").addEventListener("click", async () => {
  const output = document.getElementById("data");
  output.hidden = false;
  output.textContent = JSON.stringify(await storage.getAll(), null, 2);
});

document.getElementById("delete").addEventListener("click", async () => {
  await storage.clear();
  await load();
  document.getElementById("data").hidden = true;
});

load();
