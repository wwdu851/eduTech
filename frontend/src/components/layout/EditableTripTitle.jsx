import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { loadTripTitle, saveTripTitle, getDefaultTripTitle } from '../../utils/tripTitle';

export default function EditableTripTitle({ user }) {
  const [title, setTitle] = useState(() => loadTripTitle(user));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);

  const startEdit = () => {
    setDraft(title);
    setEditing(true);
  };

  const save = () => {
    const trimmed = draft.trim() || getDefaultTripTitle(user);
    setTitle(trimmed);
    if (user?.id) saveTripTitle(user.id, trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(title);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') cancel();
        }}
        className="w-full max-w-xl rounded-lg border px-3 py-1 text-center text-lg font-bold outline-none focus:ring-2 md:text-xl"
        style={{ borderColor: 'var(--brand-blue)' }}
        autoFocus
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group flex items-center justify-center gap-2 text-lg font-bold transition-colors hover:opacity-90 md:text-xl"
      title="Click to edit trip title"
    >
      <span className="border-b border-transparent group-hover:border-slate-300">{title}</span>
      <Pencil size={14} className="opacity-0 transition-opacity group-hover:opacity-60" style={{ color: 'var(--text-muted)' }} />
    </button>
  );
}
