const SENSITIVITY = { low: 1.25, normal: 1, high: 0.75 };

/** Deterministic, explainable scoring isolated from presentation code. */
export class HealthScorer {
  constructor({ sensitivity = "normal" } = {}) { this.sensitivity = SENSITIVITY[sensitivity] ?? 1; }

  score({ messages, totalTokens, repetition = 0 }) {
    const scale = this.sensitivity;
    const recent = messages.slice(-4);
    const recentTokens = recent.reduce((sum, message) => sum + (message.tokens ?? 0), 0);
    const average = messages.length ? totalTokens / messages.length : 0;
    const largest = Math.max(0, ...messages.map((message) => message.tokens ?? 0));
    const penalties = {
      context: Math.min(42, Math.max(0, (totalTokens - 2500) / 250) / scale),
      turns: Math.min(12, Math.max(0, (messages.length - 8) * 0.8) / scale),
      rapidGrowth: Math.min(18, Math.max(0, (recentTokens - totalTokens * 0.48) / 180) / scale),
      largeMessage: Math.min(14, Math.max(0, (largest - 1200) / 150) / scale),
      repetition: Math.min(16, repetition * 16 / scale),
      density: Math.min(8, Math.max(0, (average - 700) / 180) / scale)
    };
    const totalPenalty = Object.values(penalties).reduce((sum, penalty) => sum + penalty, 0);
    const score = Math.max(0, Math.round(100 - totalPenalty));
    const state = score <= 45 ? "fresh" : score <= 70 ? "lengthy" : "healthy";
    const expectedSavings = totalTokens > 3000 && (penalties.context + penalties.rapidGrowth + penalties.repetition) >= 15;
    return { score, state, recommendCompression: state !== "healthy" && expectedSavings, penalties, recentTokens, totalTokens };
  }
}
