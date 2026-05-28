import { useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus } from 'lucide-react';
import { createCard, selectColumns } from '../../store/boardSlice';
import ErrorBanner from '../shared/ErrorBanner';
import { getAiTargetCardId } from '../../utils/addCardBar';

export default function AddCardBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const columns = useSelector(selectColumns);
  const loading = useSelector(state => state.board.loading);
  const [title, setTitle] = useState('');
  const [columnId, setColumnId] = useState('IDEATION_DISCOVERY');
  const [lastCardId, setLastCardId] = useState(null);
  const [adding, setAdding] = useState(false);
  const addingRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (addingRef.current) return;
    const trimmed = title.trim();
    if (!trimmed) return;

    addingRef.current = true;
    setAdding(true);
    setErrorMsg(null);
    try {
      const idempotencyKey = (crypto?.randomUUID?.() || `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      const result = await dispatch(
        createCard({ title: trimmed, content: '', columnId, idempotencyKey })
      );
      if (result.meta.requestStatus === 'fulfilled') {
        setLastCardId(result.payload.id);
        setTitle('');
      } else {
        setErrorMsg(result.payload || 'Failed to add card.');
      }
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  const cards = useSelector(state => state.board.cards);
  const aiTargetCardId = useMemo(() => getAiTargetCardId({ cards, lastCardId }), [cards, lastCardId]);

  const openAiForLast = () => {
    if (!aiTargetCardId) return;
    navigate(`/inquiry/${aiTargetCardId}`);
  };

  return (
    <div className="sticky bottom-0 z-10">
      {errorMsg && (
        <div className="px-4 pb-2 md:px-6">
          <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg(null)} />
        </div>
      )}
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-center gap-3 border-t px-4 py-4 md:px-6 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.1)]"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
      >
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter new card title..."
        className="min-w-[200px] flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
        style={{ borderColor: 'var(--border)' }}
        disabled={adding || loading}
      />
      <select
        value={columnId}
        onChange={e => setColumnId(e.target.value)}
        className="rounded-xl border px-3 py-2.5 text-sm outline-none"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-0)' }}
        disabled={adding || loading}
      >
        {columns.map(col => (
          <option key={col.id} value={col.id}>{col.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={openAiForLast}
        disabled={!aiTargetCardId || adding || loading}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
        style={{ background: 'var(--brand-purple)' }}
        title="Open AI inquiry and knowledge graph"
      >
        <Sparkles size={18} />
      </button>
      <button
        type="submit"
        disabled={loading || adding || !title.trim()}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        style={{ background: 'var(--brand-blue)' }}
      >
        <Plus size={18} />
        Add to board
      </button>
      </form>
    </div>
  );
}
