const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

const Document = require('../models/Document');
const Chunk = require('../models/Chunk');
const { chunkText } = require('../services/chunker');
const { embedChunks } = require('../services/embeddings');

const router = express.Router();

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB cap
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are supported'));
    }
    cb(null, true);
  }
});

// POST /api/documents/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let doc;

  try {
    doc = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      status: 'processing'
    });

    // 1. Extract text from PDF
    const fileBuffer = fs.readFileSync(req.file.path);

    const parser = new PDFParse({
      data: fileBuffer
    });

    const pdfData = await parser.getText();
    await parser.destroy();

    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length === 0) {
      throw new Error(
        'No extractable text found in PDF (it may be a scanned image PDF)'
      );
    }

    // 2. Chunk the text
    const chunks = chunkText(rawText);

    // 3. Generate embeddings
    const embeddedChunks = await embedChunks(chunks);

    // 4. Save chunks to MongoDB
    const chunkDocs = embeddedChunks.map((c) => ({
      documentId: doc._id,
      text: c.text,
      embedding: c.embedding,
      chunkIndex: c.chunkIndex
    }));

    await Chunk.insertMany(chunkDocs);

    // 5. Mark document ready
    doc.status = 'ready';
    doc.totalChunks = chunkDocs.length;
    await doc.save();

    res.json({
      documentId: doc._id,
      originalName: doc.originalName,
      totalChunks: doc.totalChunks,
      status: doc.status
    });
  } catch (err) {
    console.error('Upload processing failed:', err);

    if (doc) {
      doc.status = 'failed';
      doc.errorMessage = err.message;
      await doc.save();
    }

    res.status(500).json({
      error: err.message
    });
  } finally {
    // Clean up temporary file
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});

// GET /api/documents
router.get('/', async (req, res) => {
  const docs = await Document.find().sort({ uploadedAt: -1 });
  res.json(docs);
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  await Chunk.deleteMany({
    documentId: req.params.id
  });

  await Document.findByIdAndDelete(req.params.id);

  res.json({
    deleted: true
  });
});

module.exports = router;