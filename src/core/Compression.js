import { TokenEstimator } from "./TokenEstimator.js";
export const COMPRESSION_INSTRUCTION = `Create a compact continuation context for this conversation. Preserve only what is necessary to continue the current objective: objective, important context, explicit requirements, constraints, decisions, current state, relevant results, unresolved issues, and next action. Remove greetings, filler, repetition, resolved questions, obsolete approaches, redundant examples, and no-longer-needed reasoning. Do not invent information or omit explicit requirements merely for brevity. Use concise structured facts with only non-empty headings: OBJECTIVE, IMPORTANT CONTEXT, CONSTRAINTS, DECISIONS, CURRENT STATE, RELEVANT RESULTS, OPEN ISSUES, NEXT ACTION. This will be pasted into a new chat; optimize for minimum tokens while preserving accurate continuation.`;
export function formatContinuationContext(context) { return `Continuation context (review and use as working context):\n\n${context.trim()}`; }
export function validateCompression(context, originalTokens) {
  const text = String(context ?? "").trim(); const tokens = new TokenEstimator().estimate(text);
  if (!text) return { valid: false, reason: "empty", tokens, reduction: 0 };
  if (tokens > Math.max(1200, originalTokens * 0.8)) return { valid: true, reason: "large", tokens, reduction: Math.max(0, 1 - tokens / Math.max(1, originalTokens)) };
  return { valid: true, reason: "normal", tokens, reduction: Math.max(0, 1 - tokens / Math.max(1, originalTokens)) };
}
