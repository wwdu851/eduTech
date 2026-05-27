import { Send } from 'lucide-react';

export default function ChatInput({ value, onChange, onSubmit, disabled, placeholder = 'Continue your inquiry...' }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-0)' }}>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 rounded-xl border px-4 py-2.5 text-sm outline-none focus:ring-2 disabled:opacity-50"
        style={{ borderColor: 'var(--border)' }}
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white disabled:opacity-50"
        style={{ background: 'var(--brand-blue)' }}
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
}
