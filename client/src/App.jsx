import { useState, useEffect, useCallback } from 'react';
import DocumentShelf from './components/DocumentShelf';
import ReadingRoom from './components/ReadingRoom';
import { uploadDocument, fetchDocuments, deleteDocument, askQuestion } from './api/client';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [messagesByDoc, setMessagesByDoc] = useState({});
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      setLoadError('Could not reach the server. Is it running on localhost:5000?');
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleUpload = async (file) => {
    setUploading(true);
    setLoadError(null);
    try {
      const result = await uploadDocument(file);
      await loadDocuments();
      setActiveDocId(result.documentId);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteDocument(id);
    if (activeDocId === id) setActiveDocId(null);
    await loadDocuments();
  };

  const handleAsk = async (question) => {
    const docId = activeDocId;
    setMessagesByDoc((prev) => ({
      ...prev,
      [docId]: [...(prev[docId] || []), { role: 'user', text: question }]
    }));
    setAsking(true);
    try {
      const result = await askQuestion(docId, question);
      setMessagesByDoc((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), { role: 'assistant', text: result.answer, sources: result.sources }]
      }));
    } catch (err) {
      setMessagesByDoc((prev) => ({
        ...prev,
        [docId]: [...(prev[docId] || []), { role: 'assistant', text: err.message, error: true }]
      }));
    } finally {
      setAsking(false);
    }
  };

  const activeDoc = documents.find((d) => d._id === activeDocId) || null;
  const messages = messagesByDoc[activeDocId] || [];

  return (
    <div className="flex flex-col md:flex-row h-dvh w-screen overflow-hidden">
      <DocumentShelf
        documents={documents}
        activeDocId={activeDocId}
        onSelect={setActiveDocId}
        onUpload={handleUpload}
        onDelete={handleDelete}
        uploading={uploading}
      />
      <ReadingRoom
        activeDoc={activeDoc}
        messages={messages}
        onAsk={handleAsk}
        asking={asking}
      />
      {loadError && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-md text-sm bg-error text-white shadow-lg z-50">
          {loadError}
        </div>
      )}
    </div>
  );
}