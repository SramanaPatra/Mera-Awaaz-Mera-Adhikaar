import React, { useState, useEffect } from 'react';
import StitchCitizenDashboard from './components/stitch-ui/StitchCitizenDashboard';
import StitchAdminPortal from './components/stitch-ui/StitchAdminPortal';
import EmergencyTracker from './components/EmergencyTracker';
import IssueReporter from './components/IssueReporter';
import PublicTracker from './components/PublicTracker';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('welfare');
  const [citizenSubView, setCitizenSubView] = useState('dashboard');
  const [loginRole, setLoginRole] = useState('citizen');
  const [email, setEmail] = useState('citizen@adhikar.gov.in');
  const [password, setPassword] = useState('citizen123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateY(0deg) rotateX(0deg)');

  useEffect(() => {
    const savedToken = localStorage.getItem('adhikar_token');
    const savedUser = localStorage.getItem('adhikar_user');
    const lastEmail = localStorage.getItem('adhikar_last_email');
    const lastRole = localStorage.getItem('adhikar_last_role');

    if (lastEmail) {
      setEmail(lastEmail);
      if (lastEmail.includes('admin') || lastRole === 'authority') {
        setPassword('admin123');
        setLoginRole('authority');
      } else {
        setPassword('citizen123');
        setLoginRole('citizen');
      }
    }

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        if (parsed.role === 'authority') {
          setActiveTab('admin');
        }
      } catch (e) {}
    }
  }, []);

  const handleMouseMove = (e) => {
    if (window.innerWidth < 768) return;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    setCardTransform(`perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`);
  };

  const handleMouseLeave = () => {
    setCardTransform('perspective(1000px) rotateY(0deg) rotateX(0deg)');
  };

  const handleDemoFill = (role) => {
    setLoginRole(role);
    setAuthError(null);
    if (role === 'citizen') {
      setEmail('citizen@adhikar.gov.in');
      setPassword('citizen123');
    } else {
      setEmail('admin@adhikar.gov.in');
      setPassword('admin123');
    }
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || 'citizen@adhikar.gov.in',
          password: password || 'citizen123',
          requestedRole: loginRole
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('adhikar_token', data.token);
      localStorage.setItem('adhikar_user', JSON.stringify(data.user));
      localStorage.setItem('adhikar_last_email', data.user.email);
      localStorage.setItem('adhikar_last_role', data.user.role);

      if (data.user.role === 'authority') {
        setActiveTab('admin');
      } else {
        setActiveTab('welfare');
        setCitizenSubView('dashboard');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('adhikar_token');
    localStorage.removeItem('adhikar_user');
    setActiveTab('welfare');
    setCitizenSubView('dashboard');

    const lastEmail = localStorage.getItem('adhikar_last_email') || 'citizen@adhikar.gov.in';
    const lastRole = localStorage.getItem('adhikar_last_role') || 'citizen';
    setEmail(lastEmail);
    setLoginRole(lastRole);
    setPassword(lastRole === 'authority' ? 'admin123' : 'citizen123');
  };

  return (
    <>
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="fixed inset-0 w-full h-full object-cover -z-20 pointer-events-none"
        src="/bg.mp4"
      >
        <source src="/bg.mp4" type="video/mp4" />
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 w-full h-full -z-10 pink-frosted-overlay pointer-events-none"></div>

      {!user ? (
        <div 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="bg-transparent text-on-background font-body-md min-h-screen flex items-center justify-center relative overflow-hidden p-4"
        >
          <main className="relative z-10 w-full max-w-md px-margin-mobile md:px-0">
            <div 
              className="glass-card rounded-xl p-8 flex flex-col items-center w-full"
              style={{ transform: cardTransform }}
            >
              <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-2 border-white/50 bg-white/20 p-2 shadow-sm flex items-center justify-center">
                <img src="/profile-shield-emblem.jpg" alt="Citizen Profile Shield Emblem" className="w-full h-full object-cover rounded-full" />
              </div>

              <div className="text-center mb-8 w-full">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-2 tracking-tight font-black uppercase">
                  {loginRole === 'citizen' ? 'Citizen Access Portal' : 'Authority Command'}
                </h1>
                <p className="font-label-bold text-label-bold text-on-surface-variant font-bold">
                  Mera Awaaz Mera Adhikar - Secure Authentication
                </p>
              </div>

              <div className="flex w-full bg-surface-container-high/50 rounded-lg p-1 mb-8 shadow-inner border border-white/20">
                <button 
                  type="button"
                  onClick={() => handleDemoFill('citizen')}
                  className={`flex-1 py-2 px-4 rounded-md font-label-bold text-label-bold flex items-center justify-center gap-2 transition-all font-black ${loginRole === 'citizen' ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-white/20'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Citizen Login
                </button>

                <button 
                  type="button"
                  onClick={() => handleDemoFill('authority')}
                  className={`flex-1 py-2 px-4 rounded-md font-label-bold text-label-bold flex items-center justify-center gap-2 transition-all font-black ${loginRole === 'authority' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:bg-white/20'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                  Authority Command
                </button>
              </div>

              {authError && (
                <div className="w-full mb-6 p-3 bg-error-container text-on-error-container rounded-lg text-xs font-bold font-mono text-center border border-error">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="w-full flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider ml-1 text-xs font-bold">
                    {loginRole === 'citizen' ? 'Citizen Email Address' : 'Authority Officer ID'}
                  </label>
                  <input 
                    type="email"
                    className="input-glass w-full rounded-lg px-4 py-3 text-on-surface font-body-md placeholder:text-on-surface-variant/60 shadow-inner font-bold"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={loginRole === 'citizen' ? 'citizen@adhikar.gov.in' : 'admin@adhikar.gov.in'}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-bold text-label-bold text-on-surface uppercase tracking-wider ml-1 text-xs font-bold">
                    Security Access Code
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      className="input-glass w-full rounded-lg px-4 py-3 text-on-surface font-body-md placeholder:text-on-surface-variant/60 shadow-inner pr-10 font-bold"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter security passcode..."
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary-container text-on-secondary-container font-label-bold text-label-bold py-4 rounded-lg mt-4 accent-glow hover:-translate-y-1 transition-all duration-300 uppercase tracking-widest shadow-lg font-black"
                >
                  {loading ? 'AUTHENTICATING SESSION...' : 'LOGIN TO PORTAL'}
                </button>
              </form>

              <div className="w-full flex flex-col items-center mt-8 gap-3 border-t border-white/20 pt-6">
                <span className="font-label-bold text-label-bold text-on-surface-variant flex items-center gap-1 hover:text-primary transition-colors text-xs font-bold">
                  <span className="material-symbols-outlined text-[16px]">shield</span>
                  Encrypted Role-Based Security System
                </span>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest font-mono">
                  DEMO PRESETS FOR INSTANT AUDIT
                </p>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => handleDemoFill('citizen')}
                    className="px-3 py-1 bg-white/50 border border-white/80 rounded-full text-xs font-bold text-on-surface hover:bg-white/80 transition-colors font-bold"
                  >
                    Citizen Demo
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleDemoFill('authority')}
                    className="px-3 py-1 bg-white/50 border border-white/80 rounded-full text-xs font-bold text-on-surface hover:bg-white/80 transition-colors font-bold"
                  >
                    Authority Demo
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div className="min-h-screen relative overflow-x-hidden font-body-md text-on-surface">
          <nav className="hidden md:flex flex-col py-8 fixed left-0 top-0 h-full w-64 z-40 bg-surface/20 backdrop-blur-2xl border-r border-white/30 shadow-2xl">
            <div className="px-6 mb-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-white/30 mb-3 flex items-center justify-center overflow-hidden border-2 border-white/60 shadow-md">
                <img src="/profile-shield-emblem.jpg" alt="Citizen Profile Shield Emblem" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-headline-md text-sm font-black text-white text-center uppercase tracking-wider text-glow-sm">
                Mera Awaaz Mera Adhikar
              </h2>
              <p className="font-label-bold text-xs text-slate-100 text-center mt-1 font-bold text-glow-sm">
                {user.name} ({user.role.toUpperCase()})
              </p>

              <button 
                onClick={handleLogout}
                className="mt-3 px-3.5 py-1 bg-white/40 hover:bg-error hover:text-white rounded-full text-[11px] font-mono font-black text-slate-900 transition-all border border-white/60 flex items-center gap-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-xs">logout</span>
                LOGOUT
              </button>
            </div>

            <div className="flex-1 px-2 space-y-1">
              <button 
                onClick={() => { setActiveTab('welfare'); setCitizenSubView('dashboard'); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mx-2 my-1 transition-all ${activeTab === 'welfare' && citizenSubView === 'dashboard' ? 'bg-secondary-container text-on-secondary-container font-black shadow-md' : 'text-white hover:bg-white/20 hover:text-white font-bold text-glow-sm'}`}
              >
                <span className="material-symbols-outlined">dashboard</span>
                <span className="font-label-bold text-label-bold">Dashboard</span>
              </button>

              <button 
                onClick={() => { setActiveTab('welfare'); setCitizenSubView('eligibility'); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mx-2 my-1 transition-all ${activeTab === 'welfare' && citizenSubView === 'eligibility' ? 'bg-secondary-container text-on-secondary-container font-black shadow-md' : 'text-white hover:bg-white/20 hover:text-white font-bold text-glow-sm'}`}
              >
                <span className="material-symbols-outlined">fact_check</span>
                <span className="font-label-bold text-label-bold">Eligibility</span>
              </button>

              <button 
                onClick={() => { setActiveTab('welfare'); setCitizenSubView('profile'); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mx-2 my-1 transition-all ${activeTab === 'welfare' && citizenSubView === 'profile' ? 'bg-secondary-container text-on-secondary-container font-black shadow-md' : 'text-white hover:bg-white/20 hover:text-white font-bold text-glow-sm'}`}
              >
                <span className="material-symbols-outlined">person</span>
                <span className="font-label-bold text-label-bold">Profile</span>
              </button>

              <button 
                onClick={() => { setActiveTab('welfare'); setCitizenSubView('ai-assistant'); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mx-2 my-1 transition-all ${activeTab === 'welfare' && citizenSubView === 'ai-assistant' ? 'bg-secondary-container text-on-secondary-container font-black shadow-md' : 'text-white hover:bg-white/20 hover:text-white font-bold text-glow-sm'}`}
              >
                <span className="material-symbols-outlined">psychology</span>
                <span className="font-label-bold text-label-bold">AI Assistant</span>
              </button>

              <button 
                onClick={() => setActiveTab('tracker')}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg mx-2 my-1 transition-all ${activeTab === 'tracker' ? 'bg-secondary-container text-on-secondary-container font-black shadow-md' : 'text-white hover:bg-white/20 hover:text-white font-bold text-glow-sm'}`}
              >
                <span className="material-symbols-outlined">analytics</span>
                <span className="font-label-bold text-label-bold">Telemetry</span>
              </button>

              {user.role === 'authority' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="w-full flex items-center gap-4 px-4 py-3 text-white hover:bg-white/20 rounded-lg mx-2 my-1 transition-colors font-bold text-glow-sm"
                >
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                  <span className="font-label-bold text-label-bold">Authority Portal</span>
                </button>
              )}
            </div>

            <div className="px-6 mt-auto">
              <button 
                onClick={() => setActiveTab('reporter')}
                className="w-full py-3 bg-secondary-container text-on-secondary-container font-label-bold text-label-bold rounded-full hover:opacity-90 transition-opacity font-black shadow-lg"
              >
                New Grievance
              </button>
            </div>
          </nav>

          <main className="md:ml-64 pt-12 pb-24 px-margin-mobile md:px-margin-desktop min-h-screen">
            {activeTab === 'welfare' && (
              <StitchCitizenDashboard 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                user={user} 
                onLogout={handleLogout} 
                activeSubView={citizenSubView}
                setActiveSubView={setCitizenSubView}
              />
            )}
            {activeTab === 'admin' && user.role === 'authority' && (
              <StitchAdminPortal setActiveTab={setActiveTab} user={user} onLogout={handleLogout} />
            )}
            {activeTab === 'emergency' && <EmergencyTracker />}
            {activeTab === 'reporter' && <IssueReporter onReportSubmitted={() => setActiveTab('tracker')} />}
            {activeTab === 'tracker' && <PublicTracker />}
          </main>

          <footer className="relative w-full md:w-[calc(100%-16rem)] md:ml-64 py-8 bg-surface/10 backdrop-blur-md border-t border-white/20 flex flex-col md:flex-row justify-between items-center px-6 md:px-12 gap-4 z-30">
            <div className="font-headline-md text-sm md:text-base font-black text-white text-glow-sm">
              &copy; 2024 Mera Awaaz Mera Adhikar. Dusk Empowerment Initiative.
            </div>
            <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end font-label-bold text-xs md:text-sm">
              <button onClick={() => setActiveTab('emergency')} className="text-secondary-container font-black hover:underline text-glow-sm">Emergency SOS</button>
              <button onClick={() => setActiveTab('tracker')} className="text-white hover:text-secondary-container hover:underline font-bold text-glow-sm">Track Status</button>
              <button onClick={() => setActiveTab('reporter')} className="text-white hover:text-secondary-container hover:underline font-bold text-glow-sm">Report Grievance</button>
              <button onClick={handleLogout} className="text-white hover:text-secondary-container hover:underline font-bold text-glow-sm">Sign Out</button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
