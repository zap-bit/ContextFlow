import { ConversationAnalyzer } from "../core/ConversationAnalyzer.js";
import { COMPRESSION_INSTRUCTION, formatContinuationContext } from "../core/Compression.js";
import { PromptAnalyzer } from "../core/PromptAnalyzer.js";
import { ChatGPTAdapter } from "../platforms/chatgpt/ChatGPTAdapter.js";
import { LocalStorageManager } from "../storage/LocalStorageManager.js";
import { Overlay } from "../ui/Overlay.js";

const storage = new LocalStorageManager();
const adapter = new ChatGPTAdapter();
let analysis; let overlay; let stopObserving;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function refresh() {
  if (!adapter.isSupported()) { overlay.showUnsupported(); return; }
  const settings = await storage.settings();
  if (!settings.healthEnabled) { overlay.hide(); return; }
  analysis = new ConversationAnalyzer({ sensitivity: settings.sensitivity }).analyze(adapter.getConversationMessages());
  analysis.diagnostics = adapter.getConversationDiagnostics();
  overlay.reveal(); overlay.showHealth(analysis);
}
async function beginCompression() {
  if (!analysis) return;
  if (!adapter.insertText(COMPRESSION_INSTRUCTION)) { overlay.showUnsupported(); return; }
  overlay.showCompressionWaiting();
}
function captureCompression() {
  const lastAssistant = adapter.getConversationMessages().filter((message) => message.role === "assistant").at(-1);
  if (!lastAssistant) { overlay.showCompressionWaiting(); return; }
  overlay.showPreview(lastAssistant.text, analysis?.totalTokens ?? 0);
}
async function startNew(context) {
  if (!adapter.openNewConversation()) { overlay.showPreview(context, analysis?.totalTokens ?? 0); return; }
  for (let attempt = 0; attempt < 12; attempt += 1) { await delay(250); if (adapter.insertText(formatContinuationContext(context))) { overlay.hide(); return; } }
  // The editable preview remains in the previous page if navigation fails; no context is discarded.
  overlay.showPreview(context, analysis?.totalTokens ?? 0);
}

(async () => {
  overlay = new Overlay({ compress: beginCompression, capture: captureCompression, startNew, cancel: refresh });
  await refresh();
  stopObserving = adapter.observeConversationChanges(refresh);
  window.addEventListener("pagehide", () => stopObserving?.(), { once: true });
  const composerWatcher = setInterval(async () => {
    const settings = await storage.settings(); if (!settings.promptCoachEnabled || !settings.suggestionsEnabled || !adapter.isSupported()) return;
    const input = adapter.getInputElement(); if (!input || input.dataset.contextflowCoach) return;
    input.dataset.contextflowCoach = "true";
    input.addEventListener("input", () => { const text = input instanceof HTMLTextAreaElement ? input.value : input.textContent; const suggestions = new PromptAnalyzer().analyze(text); if (suggestions.length) overlay.showPromptCoach(suggestions); });
  }, 1500);
  window.addEventListener("pagehide", () => clearInterval(composerWatcher), { once: true });
})().catch((error) => {
  console.error("ContextFlow initialization failed.", error);
  overlay?.showStartupError();
});
