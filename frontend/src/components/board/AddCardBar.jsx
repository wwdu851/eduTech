import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plus } from 'lucide-react';
import { createCard, selectColumns } from '../../store/boardSlice';

export default function AddCardBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const columns = useSelector(selectColumns);
  const loading = useSelector(state => state.board.loading);
  const [title, setTitle] = useState('');
  const [columnId, setColumnId] = useState('IDEATION_DISCOVERY');
  const [lastCardId, setLastCardId] = useState(null);

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    const result = await dispatch(createCard({ title: trimmed, content: '', columnId }));
    if (result.meta.requestStatus === 'fulfilled') {
      setLastCardId(result.payload.id);
      setTitle('');
    }
  };

  const openAiForLast = () => {
    if (lastCardId) navigate(`/inquiry/${lastCardId}`);
  };

  return (
    <form
      onSubmit={handleAdd}
      className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t px-4 py-4 md:px-6"
      style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
    >
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter new card title..."
        className="min-w-[200px] flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2"
        style={{ borderColor: 'var(--border)' }}
      />
      <select
        value={columnId}
        onChange={e => setColumnId(e.target.value)}
        className="rounded-xl border px-3 py-2.5 text-sm outline-none"
        style={{ borderColor: 'var(--border)', background: 'var(--surface-0)' }}
      >
        {columns.map(col => (
          <option key={col.id} value={col.id}>{col.label}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={openAiForLast}
        disabled={!lastCardId}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
        style={{ background: 'var(--brand-purple)' }}
        title="Open AI inquiry for last card"
      >
        <Sparkles size={18} />
      </button>
      <button
        type="submit"
        disabled={loading || !title.trim()}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        style={{ background: 'var(--brand-blue)' }}
      >
        <Plus size={18} />
        Add to board
      </button>
    </form>
  );
}
