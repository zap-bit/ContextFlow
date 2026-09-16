# ContextFlow

> **Preserve the information, not the conversation.**

ContextFlow is a Manifest V3 Chrome extension MVP that provides a quiet, local-first conversation-efficiency layer on ChatGPT web. It estimates visible context locally and offers a user-controlled **Compress & Continue** workflow. It does not create a backend, call a proprietary AI API, store full conversations, or send telemetry.

## Principles

- **Don't spend AI tokens to decide whether you should spend AI tokens.**
- **Local first. AI when necessary.**
- The user's existing AI performs expensive semantic compression when the user asks.
- No project-owned conversation database and no silent context transfer.
- Optimize useful context per token, with user control over every continuation.

## Install

1. Run `npm test`.
2. In Chrome, open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select this repository directory, then visit an existing ChatGPT conversation.

No build step is required. A small classic content-script bootstrap dynamically loads the browser-native module graph, because Chrome does not support declaring content scripts as ES modules directly in `manifest.json`.

## Permissions and privacy

- `storage`: stores only settings/preferences locally and enables viewing/deleting them in Options.
- Content-script match patterns are limited to `https://chatgpt.com/*` and `https://chat.openai.com/*`; no broad host permission is requested.

The content script reads only rendered conversation DOM for local analysis. It sends no data off-device. On compression it inserts a compact instruction into the ChatGPT composer **without submitting it**. After the user sends that instruction and ChatGPT replies, the user explicitly captures, edits, and transfers the result to a new chat. This conservative manual capture is intentional: ChatGPT's DOM is undocumented and may change.

## Development

```bash
npm test
npm run check
```

See [architecture notes](docs/architecture.md) for boundaries, constraints, risks, and tuning guidance.
