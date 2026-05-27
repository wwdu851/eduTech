import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import KnowledgeGraphView from '../knowledge/KnowledgeGraphView';

const TABS = [
  { id: 'graph', label: 'Personal Learning Knowledge Graph' },
  { id: 'timeline', label: 'Timeline View' },
  { id: 'gallery', label: 'Card Gallery' },
];

export default function ExplorerTabs() {
  const [activeTab, setActiveTab] = useState('graph');
  const cards = useSelector(state => Object.values(state.board.cards));
  const columns = useSelector(state => state.board.columns);

  return (
    <div className="flex h-full flex-col rounded-xl border bg-white shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <div className="flex flex-wrap gap-2 border-b p-3" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors md:text-sm ${
              activeTab === tab.id
                ? 'text-white'
                : 'hover:bg-slate-100'
            }`}
            style={
              activeTab === tab.id
                ? { background: 'var(--brand-blue)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden" style={{ minHeight: 400 }}>
        {activeTab === 'graph' && <KnowledgeGraphView />}
        {activeTab === 'timeline' && (
          <div className="p-4">
            <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              Cards ordered by learning stage:
            </p>
            <ol className="space-y-2">
              {columns.flatMap(col =>
                cards
                  .filter(c => c.columnId === col.id)
                  .map(card => (
                    <li key={card.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'var(--border)' }}>
                      <span className="font-medium">{card.title}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{col.label}</span>
                    </li>
                  ))
              )}
              {cards.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No cards yet.</p>
              )}
            </ol>
          </div>
        )}
        {activeTab === 'gallery' && (
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {cards.map(card => (
              <Link
                key={card.id}
                to={`/inquiry/${card.id}`}
                className="rounded-xl border p-3 text-sm transition-shadow hover:shadow-md"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="font-medium">{card.title}</div>
                {card.content && (
                  <p className="mt-1 line-clamp-2 text-xs" style={{ color: 'var(--text-muted)' }}>{card.content}</p>
                )}
              </Link>
            ))}
            {cards.length === 0 && (
              <p className="col-span-2 text-sm" style={{ color: 'var(--text-muted)' }}>No cards on your board yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
