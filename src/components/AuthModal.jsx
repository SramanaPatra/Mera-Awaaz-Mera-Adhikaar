import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess, initialRole = 'citizen' }) {
  const [activeRole, setActiveRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDemoFill = (role) => {
    setActiveRole(role);
    setError(null);
    if (role === 'citizen') {
      setEmail('citizen@adhikar.gov.in');
      setPassword('citizen123');
    } else {
      setEmail('admin@adhikar.gov.in');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          requestedRole: activeRole
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLoginSuccess(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="glass-panel max-w-md w-full rounded-2xl p-8 bg-white/90 border-2 border-secondary-container shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-secondary-container"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-primary hover:text-error p-1 rounded-full font-black text-xl"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-6">
          <h2 className="font-headline-md text-xl font-black text-primary uppercase tracking-wider">
            Mera Awaaz Mera Adhikar
          </h2>
          <p className="font-label-bold text-xs text-on-surface-variant mt-1">
            Secure Role-Based Authentication Engine
          </p>
        </div>

        <div className="flex bg-black/5 rounded-xl p-1 mb-6 border border-black/10">
          <button 
            type="button"
            onClick={() => handleDemoFill('citizen')}
            className={`flex-1 py-2.5 rounded-lg font-label-bold text-xs font-black transition-all flex items-center justify-center gap-2 ${activeRole === 'citizen' ? 'bg-secondary-container text-on-secondary-container shadow' : 'text-primary/70 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-sm">person</span>
            Citizen Login
          </button>

          <button 
            type="button"
            onClick={() => handleDemoFill('authority')}
            className={`flex-1 py-2.5 rounded-lg font-label-bold text-xs font-black transition-all flex items-center justify-center gap-2 ${activeRole === 'authority' ? 'bg-primary text-white shadow' : 'text-primary/70 hover:text-primary'}`}
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Authority Command
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-xs font-bold font-mono text-center border border-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-bold text-xs text-primary block uppercase font-bold mb-1">
              {activeRole === 'citizen' ? 'Citizen Email Address' : 'Authority Officer ID / Email'}
            </label>
            <input 
              type="email"
              className="w-full bg-white border border-primary/30 rounded-xl px-4 py-2.5 text-sm font-bold text-primary outline-none focus:border-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={activeRole === 'citizen' ? 'citizen@adhikar.gov.in' : 'admin@adhikar.gov.in'}
              required
            />
          </div>

          <div>
            <label className="font-label-bold text-xs text-primary block uppercase font-bold mb-1">
              Security Access Code / Password
            </label>
            <input 
              type="password"
              className="w-full bg-white border border-primary/30 rounded-xl px-4 py-2.5 text-sm font-bold text-primary outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-full font-label-bold text-xs font-black transition-all shadow-md ${activeRole === 'citizen' ? 'bg-secondary-container text-on-secondary-container hover:shadow-[0_0_15px_rgba(252,222,103,0.8)]' : 'bg-primary text-white hover:bg-black/80'}`}
            >
              {loading ? 'AUTHENTICATING SESSION...' : activeRole === 'citizen' ? 'LOGIN TO CITIZEN PORTAL' : 'AUTHENTICATE AUTHORITY COMMAND'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-black/10 text-center space-y-2">
          <span className="text-[11px] font-mono text-primary/70 font-bold block">
            DEMO PRESETS FOR INSTANT AUDIT:
          </span>
          <div className="flex gap-2 justify-center text-xs">
            <button 
              type="button" 
              onClick={() => handleDemoFill('citizen')}
              className="px-3 py-1 bg-white border border-black/10 rounded-full font-bold hover:bg-black/5"
            >
              Citizen Demo
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoFill('authority')}
              className="px-3 py-1 bg-white border border-black/10 rounded-full font-bold hover:bg-black/5"
            >
              Authority Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
