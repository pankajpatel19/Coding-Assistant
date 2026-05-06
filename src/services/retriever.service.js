const stopWords = new Set([
  "how",
  "what",
  "where",
  "when",
  "why",
  "who",
  "is",
  "are",
  "am",
  "was",
  "were",
  "do",
  "does",
  "did",
  "the",
  "a",
  "an",
  "in",
  "of",
  "to",
  "and",
  "or",
  "for",
  "with",
  "on",
  "can",
  "you",
  "me",
  "this",
  "that",
  "it",
  "i",
  "we",
  "they",
  "about",
  "explain",
  "code",
  "file",
  "project",
  "repository",
  "work",
  "implemented",
]);

const retrieveCode = async (question, chunks, topK = 5) => {
  const words = question
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/);

  const keywords = words.filter(
    (word) => word.length > 1 && !stopWords.has(word),
  );

  if (keywords.length === 0) {
    return [];
  }

  const scored = chunks.map((chunk) => {
    const text = chunk.content.toLowerCase();

    const score = keywords.reduce((acc, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      const matches = text.match(regex);
      if (matches) {
        acc += matches.length;
      }
      return acc;
    }, 0);

    return { chunk, score };
  });

  const filteredChunks = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return filteredChunks.slice(0, topK).map((item) => item.chunk);
};

export { retrieveCode };
