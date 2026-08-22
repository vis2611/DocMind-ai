require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const documentsRouter = require('./routes/documents');
const askRouter = require('./routes/ask');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/documents', documentsRouter);
app.use('/api/ask', askRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongoConnected: mongoose.connection.readyState === 1 });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set in .env — cannot start server.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

start();
