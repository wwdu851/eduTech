import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, clearError } from '../store/authSlice';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const switchMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login');
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = mode === 'login' ? loginUser : registerUser;
    const result = await dispatch(action({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/board');
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--surface-1)' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ background: 'linear-gradient(145deg, #1e40af 0%, #3730a3 50%, #4c1d95 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">EduTech</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Plan trips.<br />
            Deepen inquiry.<br />
            Build knowledge.
          </h1>
          <p className="text-blue-200 text-base leading-relaxed">
            An AI-powered experiential learning platform that turns trip planning into deep, connected knowledge.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {[
              { emoji: '🗂️', label: 'Kanban-based trip planning' },
              { emoji: '🤖', label: 'AI Socratic inquiry companion' },
              { emoji: '🕸️', label: 'Personal knowledge graph' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-white text-sm font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-blue-300 text-xs">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Educational Safe Content Environment Active
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-slate-800">EduTech</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">
            Sign in to EduTech
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            Sign in to continue your learning journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm outline-none transition-all"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-0)', color: 'var(--text-primary)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--brand-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-slate-400 mt-1">Minimum 8 characters</p>
              )}
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all mt-2 cursor-pointer"
              style={{ background: loading ? '#93C5FD' : 'var(--brand-blue)' }}
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" />{mode === 'login' ? 'Signing in…' : 'Creating account…'}</>
                : <>{mode === 'login' ? 'Sign in' : 'Create account'}<ArrowRight size={16} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6 italic">
            Registration is currently closed to new users.
          </p>
        </div>
      </div>
    </div>
  );
}
