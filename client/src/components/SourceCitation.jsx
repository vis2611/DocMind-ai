import { useState } from 'react';

export default function SourceCitation({ source, number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="inline-flex flex-col">
      <button
        className={`font-mono text-xs border rounded px-1.5 py-0.5 transition-colors
          ${source.flagged
            ? 'text-error border-error/40 hover:bg-error/10'
            : 'text-gold border-gold/40 hover:bg-gold/10'}`}
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        title={source.flagged ? 'This passage contains text resembling an instruction override attempt' : undefined}
      >
        [{number}]{source.flagged ? ' ⚠' : ''}
      </button>
      {expanded && (
        <div className="mt-1.5 px-3 py-2.5 bg-paper border-l-2 border-gold font-mono text-xs max-w-[90vw] sm:max-w-[420px]">
          {source.flagged && (
            <p className="text-error mb-2 font-sans leading-relaxed">
              ⚠ This passage contains phrasing that resembles a prompt-injection attempt.
              It was treated as plain document text, not as an instruction.
            </p>
          )}
          <p className="text-ink leading-relaxed">&ldquo;{source.text}&rdquo;</p>
          {typeof source.score === 'number' && (
            <p className="text-text-muted mt-1.5">relevance {(source.score * 100).toFixed(0)}%</p>
          )}
        </div>
      )}
    </div>
  );
}