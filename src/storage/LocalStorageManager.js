const DEFAULTS = { healthEnabled: true, sensitivity: "normal", promptCoachEnabled: true, suggestionsEnabled: true, privacySeen: false };
export class LocalStorageManager {
  async settings() { return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) }; }
  async saveSettings(settings) { await chrome.storage.local.set(settings); }
  async clear() { await chrome.storage.local.clear(); }
}
