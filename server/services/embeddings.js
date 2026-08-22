const { GoogleGenerativeAI } = require('@google/generative-ai');

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    '[embeddings.js] WARNING: GEMINI_API_KEY is not set. Embedding calls will fail until you add it to .env'
  );
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

/**
 * Generates an embedding vector for a single piece of text.
 * Returns an array of floats (768 dimensions for text-embedding-004).
 */
async function embedText(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

/**
 * Generates embeddings for many chunks. Sequential (not parallel) to stay
 * safely inside free-tier rate limits — batch/parallel calls can hit
 * 429 errors quickly on free tiers.
 */
async function embedChunks(chunks) {
  const embedded = [];
  for (const chunk of chunks) {
    const vector = await embedText(chunk.text);
    embedded.push({ ...chunk, embedding: vector });
  }
  return embedded;
}

module.exports = { embedText, embedChunks };
