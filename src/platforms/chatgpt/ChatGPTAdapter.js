const SELECTORS = {
  turns: '[data-message-author-role]',
  composer: 'textarea, [contenteditable="true"][role="textbox"], [contenteditable="true"]',
  newChat: 'a[href="/"], a[href="/new"], button[aria-label*="New chat" i], button[data-testid="create-new-chat-button"]'
};

export class ChatGPTAdapter {
  isSupported() { return Boolean(this.getInputElement()) && document.querySelectorAll(SELECTORS.turns).length > 0; }
  getConversationId() { return location.pathname.split("/").filter(Boolean).at(-1) ?? "new"; }
  getInputElement() { return document.querySelector(SELECTORS.composer); }
  getConversationMessages() {
    return [...document.querySelectorAll(SELECTORS.turns)].map((element, index) => ({
      id: element.getAttribute("data-message-id") || `${index}:${element.textContent.length}`,
      role: element.getAttribute("data-message-author-role") || "unknown",
      text: element.innerText?.trim() || element.textContent?.trim() || ""
    })).filter((message) => message.text && (message.role === "user" || message.role === "assistant"));
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
