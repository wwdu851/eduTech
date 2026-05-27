import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { logout } from '../../store/authSlice';
import { getDisplayName } from '../../utils/auth';
import SafeContentBadge from '../security/SafeContentBadge';
import SecurityHelpPanel from '../security/SecurityHelpPanel';
import TrainingSuggestionsPanel from '../security/TrainingSuggestionsPanel';

export default function AppShell({ children, title, showHelp = true }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(state => state.auth.user);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const displayName = getDisplayName(user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--surface-1)' }}>
      <header
        className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-6"
        style={{ background: 'var(--surface-0)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--surface-2)' }}>
            <User size={18} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Student Explorer: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{displayName}</span>
          </span>
        </div>

        {title && (
          <h1 className="order-3 w-full text-center text-lg font-bold md:order-none md:flex-1 md:text-xl">
            {title}
          </h1>
        )}

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSecurityOpen(true)} className="hidden sm:block">
            <SafeContentBadge />
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-100"
            style={{ color: 'var(--text-secondary)' }}
            title="Log out"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Log out</span>
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {showHelp && (
        <button
          type="button"
          onClick={() => setTrainingOpen(true)}
          className="fixed bottom-24 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
          style={{ background: 'var(--brand-purple)' }}
          title="Learning guide"
          aria-label="Open learning guide"
        >
          ?
        </button>
      )}

      <SecurityHelpPanel open={securityOpen} onClose={() => setSecurityOpen(false)} />
      <TrainingSuggestionsPanel open={trainingOpen} onClose={() => setTrainingOpen(false)} />
    </div>
  );
}
