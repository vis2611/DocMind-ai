import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SourceCitation from './SourceCitation';

export default function ReadingRoom({ activeDoc, messages, onAsk, asking }) {
  const [question, setQuestion] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || asking) return;
    onAsk(question.trim());
    setQuestion('');
  };

  if (!activeDoc) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-0">
        <div className="max-w-[380px] text-center px-6">
          <span className="font-display text-4xl text-gold block mb-3">§</span>
          <h2 className="font-display text-xl md:text-2xl font-semibold mb-2.5">
            Select a document to begin
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Upload a PDF on the left, then ask it anything. Answers are grounded in the
            document and cite exactly where they came from.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col min-h-0">
      <header className="px-5 md:px-8 py-4 md:py-5 border-b border-line flex items-baseline gap-3">
        <h2 className="font-display text-base md:text-lg font-semibold truncate">
          {activeDoc.originalName}
        </h2>
        <span className="text-xs text-text-muted flex-shrink-0">
          {activeDoc.totalChunks} passages indexed
        </span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 md:py-7 flex flex-col gap-4 md:gap-4.5">
        {messages.length === 0 && (
          <p className="text-text-muted text-sm italic">
            Ask a question about this document to get a grounded, cited answer.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-full sm:max-w-[85%] md:max-w-[640px] px-4 md:px-4.5 py-3 md:py-3.5 rounded-lg text-[14px] md:text-[14.5px] leading-relaxed
              ${m.role === 'user'
                ? 'self-end bg-moss text-paper rounded-br-sm'
                : 'self-start bg-paper-dim border border-line rounded-bl-sm'}`}
          >
            {m.role === 'user' ? (
              <p className="whitespace-pre-wrap">{m.text}</p>
            ) : m.error ? (
              <p className="text-error">{m.text}</p>
            ) : (
              <>
                <div className="prose-sm max-w-none [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_ul]:ml-5 [&_ul]:my-1.5 [&_ol]:ml-5 [&_ol]:my-1.5 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-ink [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-paper [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
                  <ReactMarkdown>{m.text}</ReactMarkdown>
                </div>
                {m.sources?.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-line flex flex-wrap gap-1.5">
                    {m.sources.map((s, idx) => (
                      <SourceCitation key={idx} source={s} number={idx + 1} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {asking && (
          <div className="self-start bg-paper-dim border border-line rounded-lg rounded-bl-sm px-4.5 py-4 flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" />
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse [animation-delay:0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse [animation-delay:0.3s]" />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="flex gap-2.5 px-5 md:px-8 py-4 md:pb-6 border-t border-line"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          placeholder="Ask this document something…"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={asking}
          className="flex-1 min-w-0 px-4 py-3 border border-line rounded-md text-sm bg-paper-dim focus:outline-none focus:border-moss"
        />
        <button
          type="submit"
          disabled={asking || !question.trim()}
          className="px-4 md:px-5.5 py-3 bg-moss text-paper rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          Ask
        </button>
      </form>
    </main>
  );
}