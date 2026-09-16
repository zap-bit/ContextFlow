// Chrome content scripts are classic scripts, not manifest-declared ES modules.
// Load the module graph explicitly from the extension origin. Keep a visible,
// non-invasive fallback here: otherwise a module-loading error is invisible to
// someone trying to diagnose why the panel is absent.
import(chrome.runtime.getURL("src/content/app.js")).catch((error) => {
  console.error("ContextFlow could not start.", error);
  if (document.getElementById("contextflow-startup-error")) return;

  const notice = document.createElement("div");
  notice.id = "contextflow-startup-error";
  notice.textContent = "ContextFlow could not start. Reload this page after reloading the extension.";
  notice.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483647;max-width:280px;padding:12px;border:1px solid #d9dce1;border-radius:10px;background:#fff;color:#202124;font:13px/1.4 system-ui,sans-serif;box-shadow:0 8px 26px #0002";
  document.documentElement.append(notice);
});
