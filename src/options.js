const defaults = { healthEnabled: true, sensitivity: "normal", promptCoachEnabled: true, suggestionsEnabled: true };
const get = async () => ({ ...defaults, ...(await chrome.storage.local.get(defaults)) });
async function load() { const settings = await get(); for (const [key, value] of Object.entries(settings)) { const input = document.getElementById(key); if (input) input.type === "checkbox" ? input.checked = value : input.value = value; } }
document.getElementById("save").addEventListener("click", async () => { const values = Object.fromEntries(Object.keys(defaults).map((key) => { const input = document.getElementById(key); return [key, input.type === "checkbox" ? input.checked : input.value]; })); await chrome.storage.local.set(values); });
document.getElementById("view").addEventListener("click", async () => { const output = document.getElementById("data"); output.hidden = false; output.textContent = JSON.stringify(await chrome.storage.local.get(null), null, 2); });
document.getElementById("delete").addEventListener("click", async () => { await chrome.storage.local.clear(); await load(); document.getElementById("data").hidden = true; });
load();
