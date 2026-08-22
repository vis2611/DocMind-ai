/**
 * Splits a long text into overlapping chunks for embedding + retrieval.
 *
 * Why overlap matters: if a sentence containing the answer gets cut
 * exactly at a chunk boundary, a hard split would break it across two
 * chunks and hurt retrieval. Overlap ensures context isn't lost at edges.
 *
 * We chunk by approximate word count (simple, no tokenizer dependency).
 * ~500 tokens ≈ ~375-400 words for English text; we use word count as
 * a close-enough proxy so we don't need a tokenizer library.
 */

function chunkText(text, { chunkSizeWords = 350, overlapWords = 50 } = {}) {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ');

  if (words.length === 0) return [];

  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSizeWords, words.length);
    const chunkWords = words.slice(start, end);
    const chunkStr = chunkWords.join(' ').trim();

    if (chunkStr.length > 0) {
      chunks.push({
        text: chunkStr,
        chunkIndex: chunkIndex++
      });
    }

    if (end === words.length) break;
    start = end - overlapWords; // step forward, but overlap with previous chunk
  }

  return chunks;
}

module.exports = { chunkText };
