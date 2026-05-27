import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { MoreHorizontal } from 'lucide-react';
import { updateCard, deleteCard } from '../../store/boardSlice';

export default function CardActionMenu({ card }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSaveTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === card.title) {
      setModal(null);
      return;
    }
    setSaving(true);
    await dispatch(updateCard({ cardId: card.id, input: { title: trimmed } }));
    setSaving(false);
    setModal(null);
    setOpen(false);
  };

  const handleSaveContent = async () => {
    setSaving(true);
    await dispatch(updateCard({ cardId: card.id, input: { content: content.trim() } }));
    setSaving(false);
    setModal(null);
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${card.title}"? This cannot be undone.`)) return;
    setSaving(true);
    await dispatch(deleteCard(card.id));
    setSaving(false);
    setModal(null);
    setOpen(false);
  };

  return (
    <>
      <div className="absolute right-2 top-2 z-10" ref={menuRef}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Card options"
        >
          <MoreHorizontal size={18} />
        </button>
        {open && (
          <div
            className="absolute right-0 mt-1 min-w-[160px] rounded-xl border bg-white py-1 shadow-lg"
            style={{ borderColor: 'var(--border)' }}
          >
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
              onClick={(e) => { e.stopPropagation(); setTitle(card.title); setModal('title'); setOpen(false); }}
            >
              Edit title
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
              onClick={(e) => { e.stopPropagation(); setContent(card.content || ''); setModal('content'); setOpen(false); }}
            >
              {card.content ? 'Edit content' : 'Add content'}
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              onClick={(e) => { e.stopPropagation(); setModal('delete'); setOpen(false); }}
            >
              Delete card
            </button>
          </div>
        )}
      </div>

      {modal === 'title' && (
        <Modal title="Edit title" onClose={() => setModal(null)}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)' }}
            autoFocus
          />
          <ModalActions onCancel={() => setModal(null)} onSave={handleSaveTitle} saving={saving} disabled={!title.trim()} />
        </Modal>
      )}

      {modal === 'content' && (
        <Modal title={card.content ? 'Edit content' : 'Add content'} onClose={() => setModal(null)}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: 'var(--border)' }}
            autoFocus
          />
          <ModalActions onCancel={() => setModal(null)} onSave={handleSaveContent} saving={saving} />
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete card?" onClose={() => setModal(null)}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Permanently delete &quot;{card.title}&quot;?
          </p>
          <ModalActions onCancel={() => setModal(null)} onSave={handleDelete} saving={saving} saveLabel="Delete" saveClass="bg-red-600" />
        </Modal>
      )}
    </>
  );
}

function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, onSave, saving, disabled, saveLabel = 'Save', saveClass }) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm hover:bg-slate-100">Cancel</button>
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className={`rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${saveClass || ''}`}
        style={!saveClass ? { background: 'var(--brand-blue)' } : undefined}
      >
        {saving ? 'Saving...' : saveLabel}
      </button>
    </div>
  );
}
