const SELECTORS = {
  message: '[data-message-author-role="user"], [data-message-author-role="assistant"]',
  turn: 'article[data-testid*="conversation-turn"]',
  composer: '#prompt-textarea, [data-testid="prompt-textarea"], textarea[placeholder], textarea, [contenteditable="true"][role="textbox"]',
  newChat: 'a[href="/"], a[href="/new"], button[aria-label*="New chat" i], button[data-testid="create-new-chat-button"]'
};

const hashText = (text) => {
  let hash = 5381;
  for (let index = 0; index < text.length; index += 1) hash = (hash * 33) ^ text.charCodeAt(index);
  return (hash >>> 0).toString(36);
};

export class MessageAccumulator {
  constructor() { this.conversationId = null; this.messages = new Map(); }
  merge(conversationId, messages) {
    // ChatGPT commonly changes /new to a conversation URL after the first send.
    // Preserve messages across that expected transition, but reset for an actual
    // conversation change so context never crosses chat boundaries.
    if (this.conversationId && this.conversationId !== conversationId && !(this.conversationId === "new" && conversationId !== "new")) this.messages.clear();
    this.conversationId = conversationId;
    messages.forEach((message) => this.messages.set(message.id, message));
    return [...this.messages.values()];
  }
  mountedCount() { return this.messages.size; }
}

export class ChatGPTAdapter {
  constructor(documentRef = document, locationRef = location) {
    this.document = documentRef;
    this.location = locationRef;
    this.accumulator = new MessageAccumulator();
    this.lastMountedMessageCount = 0;
  }
  // A new ChatGPT conversation legitimately has no turns yet. The composer is
  // the stable capability needed to show ContextFlow and prevents the panel
  // from disappearing until the first reply has rendered.
  isSupported() { return Boolean(this.getInputElement()); }
  getConversationId() { return this.location.pathname.split("/").filter(Boolean).at(-1) ?? "new"; }
  getInputElement() { return this.document.querySelector(SELECTORS.composer); }
  getConversationMessages() {
    const mounted = [...this.document.querySelectorAll(SELECTORS.message)].map((element) => this.messageFromElement(element)).filter(Boolean);
    this.lastMountedMessageCount = mounted.length;
    return this.accumulator.merge(this.getConversationId(), mounted);
  }
  getConversationDiagnostics() { return { mountedMessageCount: this.lastMountedMessageCount, observedMessageCount: this.accumulator.messages.size }; }
  messageFromElement(element) {
    const role = element.getAttribute("data-message-author-role");
    if (role !== "user" && role !== "assistant") return null;
    const text = element.innerText?.trim() || element.textContent?.trim() || "";
    if (!text) return null;
    const turn = element.closest(SELECTORS.turn);
    const id = element.getAttribute("data-message-id") || turn?.getAttribute("data-message-id") || turn?.getAttribute("data-testid") || `${role}:${hashText(text)}`;
    return { id, role, text };
  }
  insertText(text) {
    const input = this.getInputElement(); if (!input) return false;
    input.focus();
    if (input instanceof HTMLTextAreaElement) { input.value = text; input.dispatchEvent(new Event("input", { bubbles: true })); return true; }
    input.textContent = text; input.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text })); return true;
  }
  openNewConversation() {
    const button = this.document.querySelector(SELECTORS.newChat); if (!button) return false;
    button.click(); return true;
  }
  observeConversationChanges(callback) {
    let timer; const observer = new MutationObserver(() => { clearTimeout(timer); timer = setTimeout(callback, 400); });
    observer.observe(this.document.body, { childList: true, subtree: true, characterData: true });
    return () => { clearTimeout(timer); observer.disconnect(); };
  }
}
