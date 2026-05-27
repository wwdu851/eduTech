import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft } from 'lucide-react';
import client from '../apollo/client';
import { GET_CARD } from '../apollo/operations/board';
import { setActiveCard } from '../store/inquirySlice';
import { fetchBoard } from '../store/boardSlice';
import { fetchKnowledgeGraph } from '../store/knowledgeSlice';
import AppShell from '../components/layout/AppShell';
import InquiryChat from '../components/inquiry/InquiryChat';
import ExplorerTabs from '../components/inquiry/ExplorerTabs';
import SecurityHelpPanel from '../components/security/SecurityHelpPanel';

export default function InquiryPage() {
  const { cardId } = useParams();
  const dispatch = useDispatch();
  const [cardTitle, setCardTitle] = useState('');
  const [securityOpen, setSecurityOpen] = useState(false);
  const nodeCount = useSelector(state => state.knowledge.nodes.length);
  const cardCount = useSelector(state => Object.keys(state.board.cards).length);

  useEffect(() => {
    if (!cardId) return;
    dispatch(setActiveCard(cardId));
    dispatch(fetchKnowledgeGraph());
    dispatch(fetchBoard());

    client.query({ query: GET_CARD, variables: { cardId } })
      .then(({ data }) => setCardTitle(data.getCard?.title || ''))
      .catch(() => setCardTitle(''));
  }, [cardId, dispatch]);

  return (
    <AppShell showHelp>
      <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="flex items-center justify-between border-b px-4 py-2 md:px-6" style={{ borderColor: 'var(--border)', background: 'var(--surface-0)' }}>
          <Link
            to="/board"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--brand-blue)' }}
          >
            <ArrowLeft size={16} />
            Back to board
          </Link>
          <button
            type="button"
            onClick={() => setSecurityOpen(true)}
            className="text-xs underline"
            style={{ color: 'var(--text-muted)' }}
          >
            Safety info
          </button>
        </div>

        <div className="grid flex-1 gap-4 p-4 lg:grid-cols-2 md:p-6" style={{ minHeight: 0 }}>
          <div className="min-h-[500px] lg:min-h-0">
            <InquiryChat cardId={cardId} cardTitle={cardTitle} />
          </div>
          <div className="min-h-[500px] lg:min-h-0">
            <ExplorerTabs />
          </div>
        </div>

        <footer
          className="flex flex-wrap items-center justify-center gap-6 border-t px-4 py-3 text-sm"
          style={{ borderColor: 'var(--border)', background: 'var(--surface-0)', color: 'var(--text-secondary)' }}
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--brand-blue)' }} />
            Total Cards: {cardCount}
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--brand-green)' }} />
            Knowledge Points in Graph: {nodeCount}
          </span>
        </footer>
      </div>

      <SecurityHelpPanel open={securityOpen} onClose={() => setSecurityOpen(false)} />
    </AppShell>
  );
}
