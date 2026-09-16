/**
 * Deliberately approximate, local-only token estimator. It tracks relative context
 * growth; it does not claim to reproduce a provider's private tokenizer.
 */
export class TokenEstimator {
  estimate(text) {
    if (!text || !String(text).trim()) return 0;
    const value = String(text).replace(/\r\n/g, "\n");
    const words = value.match(/[\p{L}\p{N}_]+(?:['’][\p{L}\p{N}_]+)*/gu)?.length ?? 0;
    const punctuation = value.match(/[^\s\p{L}\p{N}_]/gu)?.length ?? 0;
    const whitespace = value.match(/\s+/g)?.length ?? 0;
    const nonAscii = value.match(/[^\x00-\x7F]/g)?.length ?? 0;
    const codeLines = value.match(/^\s*(?:[{};]|(?:const|let|var|function|class|def|import|return)\b).*$/gm)?.length ?? 0;
    // English prose averages roughly 4 chars/token. Weight syntax and Unicode so
    // markdown, source code, and non-Latin text do not look artificially cheap.
    return Math.max(1, Math.ceil(words * 1.05 + punctuation * 0.32 + whitespace * 0.08 + nonAscii * 0.42 + codeLines * 1.8));
  }

  estimateMessages(messages) {
    return messages.reduce((total, message) => total + this.estimate(message.text), 0);
  }
}
