import { useState, useRef } from 'react';
import { AlertTriangle, Eye, EyeOff, Upload, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { calculateAge } from '../lib/format';

type Tab = 'signin' | 'register';

export default function Landing() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    full_name: '', email: '', phone: '', birthdate: '', password: '', confirm_password: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(signInForm.email, signInForm.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regForm.password !== regForm.confirm_password) { setError('Passwords do not match.'); return; }
    if (regForm.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const age = calculateAge(regForm.birthdate);
    if (age < 18) { setError('You must be at least 18 years old to register.'); return; }
    setLoading(true);
    try {
      await register({ full_name: regForm.full_name, email: regForm.email, phone: regForm.phone, birthdate: regForm.birthdate }, regForm.password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Left premium brand panel */}
      <div className="hidden md:flex md:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-zinc-950">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-900/10 via-background to-background" />

        {/* Brand */}
        <div className="relative z-10">
          <div className="mb-2">
            <h1 className="font-display text-4xl text-primary tracking-wide">
              RV VAPE SHOP
            </h1>
          </div>
          <p className="text-muted-foreground text-sm font-sans tracking-widest uppercase mt-3 text-primary/70">
            Premium Vaping Goods
          </p>
        </div>

        {/* Middle content */}
        <div className="relative z-10 space-y-8">
          <div className="border-l border-primary/50 pl-6 space-y-2">
            <p className="font-display text-3xl text-foreground leading-tight font-light">Quality you can</p>
            <p className="font-display text-3xl text-primary leading-tight">Trust.</p>
            <p className="font-display text-3xl text-foreground leading-tight font-light">Compliance you</p>
            <p className="font-display text-3xl text-primary leading-tight">Count on.</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-5 flex gap-4 items-start max-w-md backdrop-blur-sm">
            <ShieldAlert size={20} className="text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-sans font-medium text-primary uppercase tracking-widest mb-1.5">Age-Restricted Platform</p>
              <p className="text-sm text-muted-foreground leading-relaxed font-light">
                18+ only. By entering you confirm you are of legal age.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-muted-foreground/40 font-sans tracking-widest">
            DTI-REGISTERED &bull; RA-11900 COMPLIANT
          </p>
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:px-12 relative bg-background">
        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="md:hidden mb-10 text-center">
            <h1 className="font-display text-3xl text-primary tracking-wide">
              RV VAPE SHOP
            </h1>
          </div>

          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl mb-2 text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground text-sm font-light">Sign in to access premium products.</p>
          </div>

          {/* Tab switcher */}
          <div className="flex p-1 bg-white/5 rounded-md mb-8">
            {(['signin', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-sm font-sans font-medium rounded transition-all ${
                  tab === t 
                    ? 'bg-primary text-background shadow-md' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-950/30 border border-red-900/50 rounded-md p-3 mb-6">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-light">{error}</p>
            </div>
          )}

          {/* Sign in form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">Email Address</label>
                <input type="email" required value={signInForm.email}
                  onChange={(e) => setSignInForm({ ...signInForm, email: e.target.value })}
                  placeholder="name@example.com" className="premium-input" />
              </div>
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">Password</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} required value={signInForm.password}
                    onChange={(e) => setSignInForm({ ...signInForm, password: e.target.value })}
                    placeholder="••••••••" className="premium-input pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-premium w-full mt-2">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">Full Name</label>
                <input type="text" required value={regForm.full_name}
                  onChange={(e) => setRegForm({ ...regForm, full_name: e.target.value })}
                  placeholder="As it appears on your ID" className="premium-input" />
              </div>
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">
                  Date of Birth <span className="text-primary ml-1">(18+ Required)</span>
                </label>
                <input type="date" required value={regForm.birthdate}
                  onChange={(e) => setRegForm({ ...regForm, birthdate: e.target.value })}
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                  className="premium-input" style={{ colorScheme: 'dark' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">Email</label>
                  <input type="email" required value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} placeholder="you@example.com" className="premium-input" />
                </div>
                <div>
                  <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">Mobile</label>
                  <input type="tel" required value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} placeholder="09XXXXXXXXX" className="premium-input" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">Password</label>
                <input type="password" required minLength={8} value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} placeholder="Min. 8 characters" className="premium-input" />
              </div>
              <div>
                <label className="block text-xs font-sans text-muted-foreground tracking-wide mb-2">Confirm Password</label>
                <input type="password" required value={regForm.confirm_password} onChange={(e) => setRegForm({ ...regForm, confirm_password: e.target.value })} placeholder="Repeat password" className="premium-input" />
              </div>
              <button type="submit" disabled={loading} className="btn-premium w-full mt-4">
                {loading && <Loader2 size={16} className="animate-spin" />}
                Create Account
              </button>
              <p className="text-xs text-muted-foreground/60 text-center font-light leading-relaxed mt-4">
                By registering, you confirm you are 18 years of age or older.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
