import { TokenEstimator } from "./TokenEstimator.js";
import { RepetitionDetector } from "./RepetitionDetector.js";
import { HealthScorer } from "./HealthScorer.js";

export class ConversationAnalyzer {
  constructor(settings = {}) { this.estimator = new TokenEstimator(); this.repetition = new RepetitionDetector(); this.scorer = new HealthScorer(settings); }
  analyze(messages) {
    const enriched = messages.map((message) => ({ ...message, tokens: this.estimator.estimate(message.text) }));
    const totalTokens = enriched.reduce((sum, message) => sum + message.tokens, 0);
    return { messageCount: enriched.length, messages: enriched, totalTokens, repetition: this.repetition.score(enriched), health: this.scorer.score({ messages: enriched, totalTokens, repetition: this.repetition.score(enriched) }) };
  }
}
