import { useEffect } from 'react';

export default function CardDetailsModal({ card, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15, 23, 42, 0.5)' }}
      onMouseDown={(e) => {
        // Close only when user clicks outside the dialog.
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
        style={{ border: `1px solid var(--border)` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold">{card.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {card.content ? (
          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {card.content}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            No content on this card yet.
          </p>
        )}
      </div>
    </div>
  );
}

