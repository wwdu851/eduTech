import { Lock, Shield } from 'lucide-react';

export default function SafeContentBadge() {
  return (
    <div
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white"
      style={{ background: 'var(--brand-green)' }}
      title="Content is moderated and filtered for educational safety"
    >
      <Lock size={14} />
      <Shield size={14} />
      <span>Educational Safe Content Environment</span>
    </div>
  );
}
