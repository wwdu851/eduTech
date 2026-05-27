import { X, Shield, Lock, AlertTriangle } from 'lucide-react';

export default function SecurityHelpPanel({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true" aria-labelledby="security-help-title">
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Shield size={20} style={{ color: 'var(--brand-green)' }} />
            <h2 id="security-help-title" className="text-lg font-semibold">Safety & Security</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <section>
            <h3 className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
              <Lock size={14} /> Content moderation
            </h3>
            <p>Card titles, descriptions, and AI questions are checked against a keyword moderation list before processing.</p>
          </section>
          <section>
            <h3 className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
              <Shield size={14} /> AI guardrails
            </h3>
            <p>Google Gemini safety filters block medium-and-above harmful content. Production limits AI inquiries to 5 per hour per user.</p>
          </section>
          <section>
            <h3 className="mb-1 flex items-center gap-2 font-semibold text-slate-800">
              <AlertTriangle size={14} /> Data handling
            </h3>
            <p>Inputs are sanitized before storage. Your knowledge graph is scoped to your account — other users cannot access your cards or nodes.</p>
          </section>
          <section>
            <h3 className="mb-1 font-semibold text-slate-800">AI and your board</h3>
            <p>The AI suggests Kanban cards during chat — it does not add them automatically. You choose what to add with &quot;Add to board.&quot; Only knowledge graph nodes are created during inquiry.</p>
          </section>
        </div>
        <div className="border-t px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-2.5 text-sm font-medium text-white"
            style={{ background: 'var(--brand-blue)' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
