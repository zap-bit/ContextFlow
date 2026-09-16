export const DEFAULT_SETTINGS = Object.freeze({
  healthEnabled: true,
  sensitivity: "normal",
  promptCoachEnabled: true,
  suggestionsEnabled: true,
  privacySeen: false
});

const SETTING_KEYS = Object.freeze(Object.keys(DEFAULT_SETTINGS));

/**
 * A narrow wrapper around extension-local storage. Conversation text is never
 * written here: this class accepts only the explicitly supported settings.
 */
export class LocalStorageManager {
  constructor(storageArea = chrome.storage.local) {
    this.storageArea = storageArea;
  }

  async settings() {
    const stored = await this.storageArea.get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...stored };
  }

  async saveSettings(settings) {
    const allowedSettings = Object.fromEntries(
      SETTING_KEYS
        .filter((key) => Object.hasOwn(settings, key))
        .map((key) => [key, settings[key]])
    );
    await this.storageArea.set(allowedSettings);
  }

  async getAll() {
    return this.storageArea.get(null);
  }

  async clear() {
    await this.storageArea.clear();
  }
}
