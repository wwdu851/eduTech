import { X, RefreshCw, MessageCircle, Network, MapPin } from 'lucide-react';

const WORKFLOW = [
  { icon: MessageCircle, label: 'Ideation card', desc: 'Capture a topic you want to explore' },
  { icon: RefreshCw, label: 'AI inquiry', desc: 'Use Socratic follow-ups in Research column' },
  { icon: Network, label: 'Graph review', desc: 'Verify extracted knowledge points' },
  { icon: MapPin, label: 'Trip logistics', desc: 'Plan visits using synthesized knowledge' },
];

const SUGGESTIONS = [
  'Review AI-extracted nodes before treating them as facts.',
  'Use open-ended questions — the companion guides inquiry rather than giving direct answers.',
  'Move cards across columns as your understanding deepens.',
  'Periodically revisit your knowledge graph to connect ideas across cards.',
  'Report unsafe or inaccurate AI outputs to your educator.',
];

export default function TrainingSuggestionsPanel({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-lg font-semibold">Closed-Loop Learning Guide</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          <p className="mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Suggested workflow for experiential trip planning:
          </p>
          <ol className="mb-6 space-y-3">
            {WORKFLOW.map((step, i) => (
              <li key={step.label} className="flex items-start gap-3">
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--brand-blue)' }}>
                  {i + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2 font-medium text-slate-800">
                    <step.icon size={14} style={{ color: 'var(--brand-purple)' }} />
                    {step.label}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <h3 className="mb-2 text-sm font-semibold text-slate-800">Training suggestions</h3>
          <ul className="list-disc space-y-1.5 pl-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {SUGGESTIONS.map(s => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="border-t px-6 py-4" style={{ borderColor: 'var(--border)' }}>
          <button type="button" onClick={onClose} className="w-full rounded-xl py-2.5 text-sm font-medium text-white" style={{ background: 'var(--brand-blue)' }}>
            Start exploring
          </button>
        </div>
      </div>
    </div>
  );
}
