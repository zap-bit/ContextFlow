// Chrome content scripts are classic scripts, not manifest-declared ES modules.
// Load the module graph explicitly from the extension origin.
import(chrome.runtime.getURL("src/content/app.js"));
