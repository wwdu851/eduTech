import { Lock, Shield } from 'lucide-react';

export default function SafetyStatusBar({ variant = 'top' }) {
  const messages = {
    top: 'Data Security & Content Safety: Active Safeguard',
    bottom: 'Input/Output Security Guardrails Active: PII Sanitized',
  };

  return (
    <div
      className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-emerald-800"
      style={{ background: '#D1FAE5', borderBottom: variant === 'top' ? '1px solid #A7F3D0' : undefined, borderTop: variant === 'bottom' ? '1px solid #A7F3D0' : undefined }}
    >
      {variant === 'top' ? <Lock size={12} /> : <Shield size={12} />}
      <span>{messages[variant]}</span>
      {variant === 'top' && <Shield size={12} />}
    </div>
  );
}
