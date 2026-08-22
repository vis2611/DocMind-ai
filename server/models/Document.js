const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  totalChunks: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'processing'
  },
  errorMessage: { type: String, default: null }
});

module.exports = mongoose.model('Document', documentSchema);
