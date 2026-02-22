/**
 * Splits a given text into chunks for better AI processing
 * @param {string} text - The input text to be chunked
 * @param {number} chunkSize - Target size per chunk (in words)
 * @param {number} overlap - The number of words to overlap between chunks
 * @return {Array<{content: string, chunkIndex: number, pageNumber: number}>} An array of text chunks
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean text while preserving paragraphs structure
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();

  // Try to split by paragraphs (single or double newlines)

  const parapgraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of parapgraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // If single paragraph exceeds chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0, // Page number is not tracked in this implementation
        });
        currentChunk = [];
        currentWordCount = 0;
      }
      // Split large paragraph into word-based chunks
      for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0, // Page number is not tracked in this implementation
        });
        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    // If adding the paragraph exceeds chunk size, save current chunk
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      // Add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Add the last chunk

  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  }

  // Fallback: if no chunks created, split by words
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allwords = cleanedText.split(/\s+/);
    for (let i = 0; i < allwords.length; i += chunkSize - overlap) {
      const chunkWords = allwords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });
      if (i + chunkSize >= allwords.length) break;
    }
  }

  return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - The search query to match against chunk content
 * @param {number} maxChunks - Number of top relevant chunks to return
 * @return {Array<Object>} An array of relevant chunks sorted by relevance
 */

export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  // Common stop words to exclude from relevance scoring
  const stopWords = new Set([
    "the",
    "is",
    "in",
    "and",
    "to",
    "of",
    "a",
    "that",
    "it",
    "with",
    "as",
    "for",
    "was",
    "on",
    "are",
    "by",
    "this",
    "be",
    "or",
    "from",
    "at",
    "which",
    "an",
  ]);

  // Extract and clean query words
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
  if (queryWords.length === 0) {
    // Return clean chunk objects without mongoose metadata
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
    }));
  }

  // Score each chunk based on query word matches
  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    // Score each query word
    for (const word of queryWords) {
      // exact word match (higher score)
      const exactMatches = (
        content.match(new RegExp(`\\b${word}\\b`, "g")) || []
      ).length;
      score += exactMatches * 3; // Exact matches are weighted more

      // partial word match (lower score)
      const partialMatches = content.match(new RegExp(word, "g")) || [];
      score += partialMatches.length; // Partial matches are weighted less
    }

    // Bonus: Multiple query words found
    const uniqueWordsFound = queryWords.filter((word) =>
      content.includes(word),
    ).length;
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2; // Bonus for multiple query words
    }

    // Normalize score by content length to avoid bias towards longer chunks
    const normalizedScore = score / Math.sqrt(contentWords);

    // Small bonus for earlier chunks (assuming they might be more relevant)
    const positionBonus = 1 - (index / chunks.length) * 0.1; // Up to 10% bonus for earlier chunks

    // Return clean object without mongoose metadata
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound,
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0) // Only include chunks with a positive score
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Sort by score descending
      }
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      return a.chunkIndex - b.chunkIndex; // If scores and matched words are equal, sort by chunk index
    })
    .slice(0, maxChunks); // Return top relevant chunks
};
