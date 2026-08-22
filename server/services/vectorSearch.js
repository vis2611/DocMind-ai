const Chunk = require('../models/Chunk');

/**
 * Primary retrieval path: MongoDB Atlas Vector Search.
 * Requires an Atlas Search index named "vector_index" on the `chunks`
 * collection (see README for the exact index definition to paste into
 * the Atlas UI). Only works when connected to an Atlas cluster — will
 * throw if run against a non-Atlas / local MongoDB instance.
 */
async function vectorSearchAtlas(queryEmbedding, documentId, topK = 4) {
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: topK,
        filter: { documentId: documentId }
      }
    },
    {
      $project: {
        text: 1,
        chunkIndex: 1,
        pageNumber: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ]);
  return results;
}

/**
 * Fallback retrieval: manual cosine similarity in JS.
 * Use this while developing locally, before you've created the Atlas
 * Search index, or if you're testing against a non-Atlas MongoDB.
 * Not efficient at scale, but fine for a student-project document size.
 */
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function vectorSearchManual(queryEmbedding, documentId, topK = 4) {
  const chunks = await Chunk.find({ documentId }).lean();
  const scored = chunks.map(c => ({
    ...c,
    score: cosineSimilarity(queryEmbedding, c.embedding)
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

module.exports = { vectorSearchAtlas, vectorSearchManual };
