import { Sparkles } from 'lucide-react';
import SuggestedCardsPanel from './SuggestedCardsPanel';

export default function MessageBubble({ message, messageKey }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 text-sm text-white"
          style={{ background: 'var(--brand-blue)' }}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="flex gap-2">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
          style={{ background: '#EDE9FE' }}
        >
          <Sparkles size={14} style={{ color: 'var(--brand-purple)' }} />
        </div>
        <div className="max-w-[85%] flex-1">
          <div
            className="rounded-2xl rounded-bl-sm px-4 py-3 text-sm"
            style={{ background: 'var(--surface-2)', color: 'var(--text-primary)' }}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <SuggestedCardsPanel suggestions={message.suggestedCards} messageKey={messageKey} />
        </div>
      </div>
    </div>
  );
}
