const express = require('express');
const mongoose = require('mongoose');

const { embedText } = require('../services/embeddings');
const { vectorSearchAtlas, vectorSearchManual } = require('../services/vectorSearch');
const { generateAnswer } = require('../services/llm');
const { scanForInjection } = require('../services/promptGuard');

const router = express.Router();

const USE_ATLAS_VECTOR_SEARCH = true;

// POST /api/ask  { documentId, question }
router.post('/', async (req, res) => {
  const { documentId, question } = req.body;

  if (!documentId || !question) {
    return res.status(400).json({ error: 'documentId and question are required' });
  }

  try {
    // 1. Embed the question
    const queryEmbedding = await embedText(question);

    // 2. Retrieve top-k relevant chunks
    const docObjectId = new mongoose.Types.ObjectId(documentId);
    const topChunks = USE_ATLAS_VECTOR_SEARCH
      ? await vectorSearchAtlas(queryEmbedding, docObjectId)
      : await vectorSearchManual(queryEmbedding, docObjectId);

    if (topChunks.length === 0) {
      return res.json({
        answer: "I couldn't find any relevant content for that question in this document.",
        sources: []
      });
    }

    // 2b. Scan each retrieved chunk for prompt-injection patterns before
    // it reaches the LLM. Flagged chunks are NOT dropped — the LLM prompt
    // itself is hardened to treat all context as data, not commands — but
    // flagging them lets the UI surface a visible warning, which is good
    // security practice: don't silently swallow the signal.
    const scannedChunks = topChunks.map((c) => ({
      ...c,
      injectionCheck: scanForInjection(c.text)
    }));

    // 3. Generate a grounded answer using only those chunks as context
    const answer = await generateAnswer(question, scannedChunks);

    res.json({
      answer,
      sources: scannedChunks.map(c => ({
        chunkIndex: c.chunkIndex,
        text: c.text,
        score: c.score,
        flagged: c.injectionCheck.flagged
      }))
    });
  } catch (err) {
    console.error('Ask failed:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;