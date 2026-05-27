import { useDispatch } from 'react-redux';
import { Trash2 } from 'lucide-react';
import { deleteKnowledgeNode } from '../../store/knowledgeSlice';

export default function NodeDetailPanel({ node, onClose }) {
  const dispatch = useDispatch();
  if (!node) return null;

  const tagClass = node.category ? `tag-${node.category}` : 'tag-default';

  const handleDelete = async () => {
    if (window.confirm(`Delete knowledge node "${node.label}"?`)) {
      await dispatch(deleteKnowledgeNode(node.id));
      onClose?.();
    }
  };

  return (
    <div className="absolute right-3 top-3 z-10 w-64 rounded-xl border bg-white/90 p-4 shadow-xl backdrop-blur-md" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div className="mb-3">
        <h3 className="pr-8 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{node.label}</h3>
        {node.category && (
          <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tagClass}`}>
            {node.category}
          </span>
        )}
      </div>
      {node.description && (
        <div className="max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {node.description}
          </p>
        </div>
      )}
      <div className="mt-4 pt-3 border-t flex justify-end" style={{ borderColor: 'var(--border)' }}>
        <button
          type="button"
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} />
          Delete Node
        </button>
      </div>
    </div>
  );
}
