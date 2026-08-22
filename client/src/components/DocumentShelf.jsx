import { useRef, useState } from 'react';

export default function DocumentShelf({ documents, activeDocId, onSelect, onUpload, onDelete, uploading }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are supported.');
      return;
    }
    onUpload(file);
  };

  return (
    <aside className="w-full md:w-[300px] flex-shrink-0 bg-ink text-paper flex flex-col md:h-full">
      <div className="flex items-center justify-between p-5 md:p-7 md:pb-0">
        <div className="flex items-center gap-3">
          <span className="font-display text-3xl text-gold leading-none">§</span>
          <div>
            <h1 className="font-display text-xl font-semibold tracking-wide">DocuChat</h1>
            <p className="text-xs text-paper/55 mt-0.5">Ask your documents directly</p>
          </div>
        </div>
        <button
          className="md:hidden text-paper/70 text-sm border border-paper/25 rounded px-3 py-1.5"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? 'Close' : 'Shelf'}
        </button>
      </div>

      <div className={`${mobileOpen ? 'flex' : 'hidden'} md:flex flex-col flex-1 min-h-0 px-5 md:px-7 pb-5 md:pb-7 pt-5 md:pt-7`}>
        <div
          className={`border-[1.5px] border-dashed rounded-md py-6 px-4 text-center cursor-pointer transition-colors mb-6
            ${dragOver ? 'border-gold bg-gold/10' : 'border-paper/30 hover:border-gold hover:bg-gold/5'}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />
          {uploading ? (
            <p className="text-sm font-medium">Reading &amp; indexing…</p>
          ) : (
            <>
              <p className="text-sm font-medium">Drop a PDF here</p>
              <p className="text-xs text-paper/50 mt-1">or click to browse</p>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <p className="text-[11px] uppercase tracking-wider text-paper/45 mb-3">Your shelf</p>
          {documents.length === 0 && (
            <p className="text-xs text-paper/40 leading-relaxed">
              Nothing uploaded yet. Add a document to begin.
            </p>
          )}
          {documents.map((doc) => (
            <div
              key={doc._id}
              className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-md cursor-pointer mb-1 transition-colors
                ${doc._id === activeDocId ? 'bg-gold/15' : 'hover:bg-paper/5'}`}
              onClick={() => {
                if (doc.status === 'ready') {
                  onSelect(doc._id);
                  setMobileOpen(false);
                }
              }}
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium truncate">{doc.originalName}</span>
                <span
                  className={`text-[11px] ${doc.status === 'processing' ? 'text-gold'
                    : doc.status === 'failed' ? 'text-red-300'
                      : 'text-paper/45'
                    }`}
                >
                  {doc.status === 'ready' ? `${doc.totalChunks} passages indexed` : doc.status}
                </span>
              </div>
              <button
                className="text-paper/35 hover:text-red-300 text-xs p-1 flex-shrink-0"
                title="Remove document"
                onClick={(e) => { e.stopPropagation(); onDelete(doc._id); }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}