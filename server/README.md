# DocuChat AI — Server (Day 1 & 2 backend)

RAG-based document Q&A backend built with Express + MongoDB Atlas Vector Search + Gemini.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` — from your MongoDB Atlas cluster (free M0 tier is fine)
   - `GEMINI_API_KEY` — from https://aistudio.google.com/apikey (free tier)
3. `npm start` (or `node server.js`)
4. Check it's alive: `GET http://localhost:5000/api/health`

## Testing the pipeline (Postman or curl)

**Upload a PDF:**
```
POST http://localhost:5000/api/documents/upload
form-data: file = <your.pdf>
```

**Ask a question:**
```
POST http://localhost:5000/api/ask
JSON body: { "documentId": "<id from upload response>", "question": "your question" }
```

## Important: about vector search

Right now `USE_ATLAS_VECTOR_SEARCH = false` in `routes/ask.js` — this means it's
using the manual cosine-similarity fallback (`vectorSearch.js`), which works
immediately with zero extra setup. This is fine for development and even fine
to demo, but to use the *real* Atlas Vector Search (the more impressive,
production-realistic version), you need to:

1. In Atlas UI, go to your cluster -> Atlas Search -> Create Search Index
2. Choose "JSON Editor", select the `chunks` collection, and use this definition:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "documentId"
    }
  ]
}
```

3. Name the index `vector_index` (must match the name in `vectorSearch.js`)
4. Wait for it to finish building (a few minutes)
5. Flip `USE_ATLAS_VECTOR_SEARCH = true` in `routes/ask.js`

## Folder structure

```
server/
  models/       Mongoose schemas (Document, Chunk)
  services/     Business logic (chunker, embeddings, llm, vectorSearch)
  routes/       Express routes (documents, ask)
  server.js     Entry point
```

## What's next (Day 3)

Build the React frontend: upload UI, chat interface, and source citations.
See the main project brief document for the full plan.
