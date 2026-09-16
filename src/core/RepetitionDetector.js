function normalize(text) {
  return String(text).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

/** Returns the share of adjacent content that is substantially repeated (0–1). */
export class RepetitionDetector {
  score(messages) {
    const meaningful = messages.map((message) => normalize(message.text)).filter((text) => text.length >= 40);
    if (meaningful.length < 2) return 0;
    let repeated = 0;
    for (let index = 1; index < meaningful.length; index += 1) {
      const previous = new Set(meaningful[index - 1].split(" "));
      const current = new Set(meaningful[index].split(" "));
      const overlap = [...current].filter((word) => previous.has(word)).length;
      const union = new Set([...previous, ...current]).size;
      if (union && overlap / union >= 0.62) repeated += 1;
    }
    return repeated / (meaningful.length - 1);
  }
}
