const SELECTORS = {
  turns: '[data-message-author-role], article[data-testid*="conversation-turn"]',
  composer: '#prompt-textarea, [data-testid="prompt-textarea"], textarea[placeholder], textarea, [contenteditable="true"][role="textbox"]',
  newChat: 'a[href="/"], a[href="/new"], button[aria-label*="New chat" i], button[data-testid="create-new-chat-button"]'
};

export class ChatGPTAdapter {
  // A new ChatGPT conversation legitimately has no turns yet. The composer is
  // the stable capability needed to show ContextFlow and prevents the panel
  // from disappearing until the first reply has rendered.
  isSupported() { return Boolean(this.getInputElement()); }
  getConversationId() { return location.pathname.split("/").filter(Boolean).at(-1) ?? "new"; }
  getInputElement() { return document.querySelector(SELECTORS.composer); }
  getConversationMessages() {
    const seen = new Set();
    return [...document.querySelectorAll(SELECTORS.turns)].map((element, index) => {
      const roleElement = element.matches("[data-message-author-role]") ? element : element.querySelector("[data-message-author-role]");
      const testId = `${element.getAttribute("data-testid") || ""} ${roleElement?.getAttribute("data-testid") || ""}`.toLowerCase();
      const role = roleElement?.getAttribute("data-message-author-role") || element.getAttribute("data-message-author-role") || (testId.includes("assistant") ? "assistant" : testId.includes("user") ? "user" : "unknown");
      const text = (roleElement || element).innerText?.trim() || (roleElement || element).textContent?.trim() || "";
      return { id: element.getAttribute("data-message-id") || roleElement?.getAttribute("data-message-id") || `${index}:${text.length}`, role, text };
    }).filter((message) => {
      if (!message.text || (message.role !== "user" && message.role !== "assistant") || seen.has(message.id)) return false;
      seen.add(message.id); return true;
    });
  }
  insertText(text) {
    const input = this.getInputElement(); if (!input) return false;
    input.focus();
    if (input instanceof HTMLTextAreaElement) { input.value = text; input.dispatchEvent(new Event("input", { bubbles: true })); return true; }
    input.textContent = text; input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text })); return true;
  }
  openNewConversation() {
    const button = document.querySelector(SELECTORS.newChat); if (!button) return false;
    button.click(); return true;
  }
  observeConversationChanges(callback) {
    let timer; const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(callback, 400); });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }
}
