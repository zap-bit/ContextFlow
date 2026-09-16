export class PromptAnalyzer {
  analyze(text) {
    const value = String(text ?? "").trim(); if (!value || value.length > 40) return [];
    const vague = /^(make|improve|fix|help|do) (this|it|that)( better)?[.!?]*$/i.test(value);
    return vague ? ["What should change?", 'What does “better” mean?', "What constraints must remain?"] : [];
  }
}
