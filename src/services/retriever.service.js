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

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

const retrieveSementicChunks = async (
  questionEmbedding,
  embeddingChunks,
  topK = 5,
) => {
  const scored = embeddingChunks.map((chunk) => {
    const score = cosineSimilarity(questionEmbedding, chunk.embedding);
    return { ...chunk, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
};

const retrieveCode = async (question, chunks, topK = 5) => {
  if (!chunks || !Array.isArray(chunks)) return [];
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

    return { ...chunk, score };
  });

  const filteredChunks = scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return filteredChunks.slice(0, topK).map(({ score, ...chunk }) => chunk);
};

export { retrieveCode, retrieveSementicChunks };
