import { useDispatch } from 'react-redux';
import { AlertTriangle, Trash2, X } from 'lucide-react';
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
        aria-label="Close node details"
      >
        <X size={14} />
      </button>
      <div className="mb-3">
        <h3 className="pr-8 font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{node.label}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {node.category && (
            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tagClass}`}>
              {node.category}
            </span>
          )}
          {node.isAIGenerated && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              <AlertTriangle size={11} />
              AI generated
            </span>
          )}
        </div>
      </div>
      {node.isAIGenerated && (
        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
          Verify this AI-extracted point before treating it as a fact.
        </div>
      )}
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
