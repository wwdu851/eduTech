import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Brain } from 'lucide-react';
import { sendInquiry, selectConversation } from '../../store/inquirySlice';
import SafetyStatusBar from '../security/SafetyStatusBar';
import ErrorBanner from '../shared/ErrorBanner';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

export default function InquiryChat({ cardId, cardTitle }) {
  const dispatch = useDispatch();
  const messages = useSelector(selectConversation(cardId));
  const { loading, error } = useSelector(state => state.inquiry);
  const [input, setInput] = useState('');
  const [dismissedError, setDismissedError] = useState(null);
  const bottomRef = useRef(null);
  const showError = error && dismissedError !== error;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = (question) => {
    setInput('');
    dispatch(sendInquiry({ cardId, question }));
  };

  return (
    <div className="flex h-full flex-col rounded-xl border bg-white shadow-sm" style={{ borderColor: 'var(--border)' }}>
      <SafetyStatusBar variant="top" />

      <div className="border-b px-4 py-3" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <Brain size={20} style={{ color: 'var(--brand-purple)' }} />
          <div>
            <h2 className="font-semibold">AI Explorer Companion (Socrates Mode)</h2>
            {cardTitle && (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Exploring: {cardTitle}</p>
            )}
          </div>
        </div>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
          Guided inquiry — explore questions rather than direct answers.
        </p>
      </div>

      {showError && (
        <div className="px-3 pt-3">
          <ErrorBanner message={error} onDismiss={() => setDismissedError(error)} />
        </div>
      )}

      <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Ask a question about this topic to begin your inquiry journey.
          </p>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={`${msg.timestamp}-${i}`} message={msg} messageKey={`${cardId}-${msg.timestamp}-${i}`} />
        ))}
        {loading && (
          <p className="text-center text-sm animate-pulse" style={{ color: 'var(--text-muted)' }}>
            Thinking...
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <SafetyStatusBar variant="bottom" />
      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSend}
        disabled={loading}
      />
    </div>
  );
}
