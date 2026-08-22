const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true
  },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }, // vector array (768 dims for Gemini text-embedding-004)
  chunkIndex: { type: Number, required: true },
  pageNumber: { type: Number, default: null }
});

module.exports = mongoose.model('Chunk', chunkSchema);
