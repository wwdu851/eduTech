import { useRef, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Plus, X, Layers } from 'lucide-react';
import { createCard, fetchBoard, selectColumns } from '../../store/boardSlice';
import { updateSuggestedCardStatus } from '../../store/inquirySlice';

const COLUMN_LABELS = {
  IDEATION_DISCOVERY: 'Ideation & Discovery',
  RESEARCH_INQUIRY: 'Research & Inquiry',
  SYNTHESIS_KNOWLEDGE: 'Synthesis & Knowledge',
  TRIP_PLANNING_LOGISTICS: 'Trip Planning & Logistics',
};

export default function SuggestedCardsPanel({ suggestions, messageKey, messageIndex }) {
  const dispatch = useDispatch();
  const { cardId } = useParams();
  const columns = useSelector(selectColumns);
  const [showConfirmAll, setShowConfirmAll] = useState(false);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);

  const makeIdempotencyKey = () =>
    (crypto?.randomUUID?.() || `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`);

  if (!suggestions?.length) return null;

  // Compute visible suggestions based on Redux status
  const grouped = useMemo(() => {
    const acc = columns.reduce((acc, col) => {
      acc[col.id] = [];
      return acc;
    }, {});
    
    suggestions.forEach((s, i) => {
      if (s.status !== 'dismissed' && acc[s.columnId]) {
        acc[s.columnId].push({ ...s, index: i });
      }
    });
    return acc;
  }, [suggestions, columns]);

  const hasVisible = suggestions.some(s => s.status !== 'dismissed');
  if (!hasVisible) return null;

  const addOne = async (suggestion, index) => {
    if (addingRef.current) return;
    addingRef.current = true;
    setAdding(true);
    try {
      const idempotencyKey = makeIdempotencyKey();
      const result = await dispatch(createCard({
        title: suggestion.title,
        content: suggestion.content || '',
        columnId: suggestion.columnId,
        idempotencyKey,
      }));
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(updateSuggestedCardStatus({
          cardId,
          messageIndex,
          suggestionIndex: index,
          status: 'added'
        }));
        dispatch(fetchBoard());
      }
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  const addAll = async () => {
    if (addingRef.current) return;
    addingRef.current = true;
    setShowConfirmAll(false);
    setAdding(true);
    try {
      for (let i = 0; i < suggestions.length; i++) {
        const s = suggestions[i];
        if (s.status === 'dismissed' || s.status === 'added') continue;
        
        const idempotencyKey = makeIdempotencyKey();
        const result = await dispatch(createCard({
          title: s.title,
          content: s.content || '',
          columnId: s.columnId,
          idempotencyKey,
        }));
        if (result.meta.requestStatus === 'fulfilled') {
          dispatch(updateSuggestedCardStatus({
            cardId,
            messageIndex,
            suggestionIndex: i,
            status: 'added'
          }));
        }
      }
      dispatch(fetchBoard());
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  const pendingCount = suggestions.filter(s => s.status === 'pending').length;

  return (
    <div className="mt-3 rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Suggested cards — you choose what to add
        </span>
        {pendingCount > 1 && (
          <button
            type="button"
            onClick={() => setShowConfirmAll(true)}
            disabled={adding}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--brand-blue)' }}
          >
            <Layers size={12} />
            Add all ({pendingCount})
          </button>
        )}
      </div>

      <div className="space-y-3">
        {columns.map(col => {
          const items = grouped[col.id];
          if (!items?.length) return null;
          return (
            <div key={col.id}>
              <div className="mb-1 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {COLUMN_LABELS[col.id] || col.label}
              </div>
              <div className="space-y-2">
                {items.map(s => (
                  <SuggestionRow
                    key={`${messageKey}-${s.index}`}
                    suggestion={s}
                    isAdded={s.status === 'added'}
                    isAdding={adding}
                    onAdd={() => addOne(s, s.index)}
                    onDismiss={() => dispatch(updateSuggestedCardStatus({
                      cardId,
                      messageIndex,
                      suggestionIndex: s.index,
                      status: 'dismissed'
                    }))}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showConfirmAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h4 className="font-semibold">Add all suggested cards?</h4>
            <ul className="mt-2 max-h-40 overflow-y-auto text-sm" style={{ color: 'var(--text-secondary)' }}>
              {suggestions.filter(s => s.status === 'pending').map((s, i) => (
                <li key={i} className="py-0.5">• {s.title}</li>
              ))}
            </ul>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowConfirmAll(false)} className="rounded-lg px-3 py-1.5 text-sm hover:bg-slate-100">Cancel</button>
              <button
                type="button"
                onClick={addAll}
                disabled={adding}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                style={{ background: 'var(--brand-blue)' }}
              >
                Add all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionRow({ suggestion, isAdded, isAdding, onAdd, onDismiss }) {
  return (
    <div className="rounded-lg border bg-white p-3" style={{ borderColor: 'var(--border)' }}>
      <div className="font-medium text-sm">{suggestion.title}</div>
      {suggestion.content && (
        <p className="mt-1 line-clamp-2 text-xs" style={{ color: 'var(--text-muted)' }}>{suggestion.content}</p>
      )}
      {suggestion.rationale && (
        <p className="mt-1 text-xs italic" style={{ color: 'var(--text-secondary)' }}>{suggestion.rationale}</p>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded || isAdding}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          style={{ background: 'var(--brand-blue)' }}
        >
          <Plus size={12} />
          {isAdded ? 'Added' : 'Add to board'}
        </button>
        {!isAdded && (
          <button type="button" onClick={onDismiss} className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100">
            <X size={12} />
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
