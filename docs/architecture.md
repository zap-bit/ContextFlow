# Architecture and constraints

## Local analysis pipeline

`ChatGPTAdapter` extracts rendered `[data-message-author-role]` turns and observes dynamic DOM changes through one debounced `MutationObserver`. `ConversationAnalyzer` enriches only the current extracted turns with a lightweight heuristic token estimate, repetition score, and deterministic health score. The health formula is isolated in `HealthScorer`, whose individual penalties are returned for explainability and tuning.

The estimator is deliberately approximate: it weights words, punctuation, whitespace, Unicode, and code-like lines. It identifies meaningful relative growth rather than claiming provider-tokenizer precision.

## Platform boundary

All ChatGPT selectors live in `src/platforms/chatgpt/ChatGPTAdapter.js`. Failure to find a composer or visible turns creates a non-destructive unsupported state. The adapter owns DOM extraction, insertion, new-chat navigation, and observation, leaving core code platform independent. Future platform adapters can implement the same surface.

## Compression and control

ContextFlow never transmits a transcript to a project service. Clicking **Compress & Continue** only places an instruction in the existing ChatGPT composer; the user must send it. The user then captures the response, reviews/edits it, and explicitly chooses a fresh chat. The inserted continuation is not auto-submitted. If new-chat navigation or composer insertion fails, the editable preview stays available for copy/retry.

## Chrome constraints and risks

Chrome content scripts can read and write matching-page DOM but cannot rely on undocumented application internals. ChatGPT's selectors, navigation, streaming markup, and composer implementation may change. This MVP consequently uses centralized, conservative visible-DOM selectors and manual response capture rather than pretending a reliable completion API exists. It requests no broad browsing permission, network permission, or remote service.

## Deliberately deferred

Semantic topic drift, automatic result detection, checkpoints, cross-platform integrations, cloud sync, telemetry, automatic submission, and any project-owned AI/backend are deferred. This preserves privacy and avoids automation that could change a user's conversation without clear consent.
