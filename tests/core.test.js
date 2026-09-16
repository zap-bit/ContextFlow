import test from "node:test";
import assert from "node:assert/strict";
import { TokenEstimator } from "../src/core/TokenEstimator.js";
import { ConversationAnalyzer } from "../src/core/ConversationAnalyzer.js";
import { validateCompression, formatContinuationContext } from "../src/core/Compression.js";
import { PromptAnalyzer } from "../src/core/PromptAnalyzer.js";

const estimator = new TokenEstimator();
test("token estimator handles empty, prose, markdown, code, unicode, and large pasted text", () => {
  assert.equal(estimator.estimate(""), 0);
  assert.ok(estimator.estimate("A short sentence.") > 0);
  assert.ok(estimator.estimate("# Heading\n\n```js\nconst x = 1;\n```") > estimator.estimate("Heading"));
  assert.ok(estimator.estimate("こんにちは世界 🌍") > 0);
  assert.ok(estimator.estimate("word ".repeat(10000)) > 9000);
});
test("health stays healthy for short small conversations", () => {
  const result = new ConversationAnalyzer().analyze([{ text: "hello" }, { text: "hi" }]);
  assert.equal(result.messageCount, 2); assert.equal(result.health.state, "healthy"); assert.equal(result.health.recommendCompression, false);
});
test("health recognizes long, rapid-growth, repetitive, and huge-message signals", () => {
  const repeated = "We need a secure local Chrome extension with no backend and user controlled continuation. ".repeat(75);
  const result = new ConversationAnalyzer().analyze([{ text: "tiny" }, { text: repeated }, { text: repeated }, { text: "x ".repeat(1700) }]);
  assert.ok(result.totalTokens > 2500); assert.ok(result.health.penalties.context > 0); assert.ok(result.health.penalties.rapidGrowth > 0); assert.ok(result.health.penalties.largeMessage > 0); assert.ok(result.health.penalties.repetition > 0); assert.equal(result.health.recommendCompression, true);
});
test("compression validation covers normal, empty, and oversized output", () => {
  assert.equal(validateCompression("", 5000).reason, "empty");
  assert.equal(validateCompression("OBJECTIVE:\nShip safely.", 5000).reason, "normal");
  assert.equal(validateCompression("word ".repeat(5000), 5000).reason, "large");
  assert.match(formatContinuationContext("OBJECTIVE: Test"), /^Continuation context/);
});
test("prompt coach only flags concise vague prompts", () => {
  assert.equal(new PromptAnalyzer().analyze("Make this better.").length, 3);
  assert.equal(new PromptAnalyzer().analyze("Please write a detailed launch plan with risks.").length, 0);
});
