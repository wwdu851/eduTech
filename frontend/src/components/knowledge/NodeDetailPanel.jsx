export default function NodeDetailPanel({ node, onClose }) {
  if (!node) return null;

  const tagClass = node.category ? `tag-${node.category}` : 'tag-default';

  return (
    <div className="absolute right-3 top-3 z-10 w-56 rounded-xl border bg-white p-4 shadow-lg" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 text-xs text-slate-400 hover:text-slate-600"
      >
        Close
      </button>
      <h3 className="mb-2 pr-8 font-semibold text-sm">{node.label}</h3>
      {node.category && (
        <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${tagClass}`}>
          {node.category}
        </span>
      )}
      {node.description && (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {node.description}
        </p>
      )}
    </div>
  );
}
