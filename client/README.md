# DocuChat AI — Client (Day 3 frontend)

React + Vite frontend for the DocuChat AI RAG project.

## Setup

1. Make sure the backend server is running first (see `../server/README.md`) — it must be live on `http://localhost:5000`
2. `npm install`
3. `npm run dev`
4. Open the URL Vite prints (usually `http://localhost:5173`)

## Design notes

The interface is themed as a "reading room": a document shelf (sidebar) on the
left, and a reading room (chat) on the right. Citations appear as numbered
footnote markers `[1] [2]` under each answer — click one to expand and see
the exact source passage it was pulled from, plus its relevance score. This
was a deliberate choice to match the *subject* of the tool (documents,
sources, citations) rather than reusing a generic chat-bubble UI.

## Structure

```
src/
  api/client.js              All backend fetch calls in one place
  components/
    DocumentShelf.jsx        Upload + document list sidebar
    ReadingRoom.jsx           Chat thread + composer
    SourceCitation.jsx        Expandable footnote-style citation
  App.jsx                    Wires state + components together
  App.css                    Design system (paper/ink/moss/gold palette)
```

## If something doesn't connect

- Check the browser console (F12) for errors first
- Confirm the backend is running and reachable at `http://localhost:5000/api/health`
- CORS is already enabled server-side (`cors()` in `server.js`), so cross-origin
  requests from `localhost:5173` to `localhost:5000` should work out of the box
