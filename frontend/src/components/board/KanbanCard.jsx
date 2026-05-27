import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { getCardTags, getColumnAction } from '../../utils/columnActions';
import CardActionMenu from './CardActionMenu';

export default function KanbanCard({ card }) {
  const navigate = useNavigate();
  const action = getColumnAction(card.columnId);
  const tags = getCardTags(card);

  const openInquiry = () => navigate(`/inquiry/${card.id}`);

  return (
    <div
      className="relative rounded-xl border bg-white p-4 pt-8 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: 'var(--border)' }}
    >
      <CardActionMenu card={card} />
      <h3 className="mb-2 pr-6 font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
        {card.title}
      </h3>
      {card.content && (
        <p className="mb-3 line-clamp-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {card.content}
        </p>
      )}
      {tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {tags.map(tag => {
            const category = tag.replace('#', '').toUpperCase();
            const tagClass = CATEGORY_TAG_CLASS[category] || 'tag-default';
            return (
              <span key={tag} className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagClass}`}>
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            );
          })}
        </div>
      )}
      {action.showAi && (
        <button
          type="button"
          onClick={openInquiry}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-white transition-colors"
          style={{ background: 'var(--brand-blue)' }}
        >
          <Sparkles size={14} />
          {action.label}
        </button>
      )}
    </div>
  );
}

const CATEGORY_TAG_CLASS = {
  HISTORY: 'tag-HISTORY',
  ARCHITECTURE: 'tag-ARCHITECTURE',
  TRADE: 'tag-TRADE',
  CULTURE: 'tag-CULTURE',
  FOOD: 'tag-FOOD',
  POLITICS: 'tag-POLITICS',
  LOGISTICS: 'tag-LOGISTICS',
  PLANNING: 'tag-PLANNING',
  SCIENCE: 'tag-SCIENCE',
  ENGINEERING: 'tag-ENGINEERING',
  GEOGRAPHY: 'tag-GEOGRAPHY',
  ECONOMICS: 'tag-ECONOMICS',
};
