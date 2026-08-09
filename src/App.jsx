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
  const [authMode, setAuthMode] = useState('register');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [location, setLocation] = useState('');
  const [income, setIncome] = useState('');
  const [occupation, setOccupation] = useState('Artisan');
  const [department, setDepartment] = useState('Municipal Operations Command');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardTransform, setCardTransform] = useState('perspective(1000px) rotateY(0deg) rotateX(0deg)');

  useEffect(() => {
    const savedToken = localStorage.getItem('adhikar_token');
    const savedUser = localStorage.getItem('adhikar_user');

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        if (parsed.role === 'authority') {
          setActiveTab('admin');
        }
      } catch (e) {
        localStorage.removeItem('adhikar_token');
        localStorage.removeItem('adhikar_user');
      }
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

  const handleAuthSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = authMode === 'register' ? {
      email,
      password,
      name,
      role: loginRole,
      department: loginRole === 'authority' ? department : 'Citizen Self-Service',
      age,
      gender,
      location,
      income,
      occupation
    } : {
      email,
      password
    };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('adhikar_token', data.token);
      localStorage.setItem('adhikar_user', JSON.stringify(data.user));

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
    setEmail('');
    setPassword('');
    setAuthError(null);
    setAuthMode('register');
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
          className="bg-transparent text-on-background font-body-md min-h-screen flex items-center justify-center relative overflow-hidden p-4 py-12"
        >
          <main className="relative z-10 w-full max-w-md px-margin-mobile md:px-0">
            <div 
              className="glass-card rounded-xl p-8 flex flex-col items-center w-full shadow-2xl border-2 border-white/40"
              style={{ transform: cardTransform }}
            >
              <div className="w-24 h-24 mb-6 rounded-full overflow-hidden border-2 border-white/50 bg-white/20 p-2 shadow-sm flex items-center justify-center">
                <img src="/profile-shield-emblem.jpg" alt="Citizen Profile Shield Emblem" className="w-full h-full object-cover rounded-full" />
              </div>

              <div className="text-center mb-6 w-full">
                <h1 className="font-headline-md text-headline-md text-on-surface mb-1 tracking-tight font-black uppercase">
                  {authMode === 'register' ? 'Create Account' : 'Sign In Portal'}
                </h1>
                <p className="font-label-bold text-xs text-on-surface-variant font-bold">
                  Mera Awaaz Mera Adhikar - Secure Authentication
                </p>
              </div>

              <div className="flex w-full bg-surface-container-high/50 rounded-lg p-1 mb-6 shadow-inner border border-white/20">
                <button 
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(null); }}
                  className={`flex-1 py-2 px-3 rounded-md font-label-bold text-xs flex items-center justify-center gap-1 transition-all font-black ${authMode === 'register' ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-white/20'}`}
                >
                  Create Account
                </button>

                <button 
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(null); }}
                  className={`flex-1 py-2 px-3 rounded-md font-label-bold text-xs flex items-center justify-center gap-1 transition-all font-black ${authMode === 'login' ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-white/20'}`}
                >
                  Sign In
                </button>
              </div>

              {authError && (
                <div className="w-full mb-6 p-3 bg-error-container text-on-error-container rounded-lg text-xs font-bold font-mono text-center border border-error">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="w-full flex flex-col gap-4">
                {authMode === 'register' && (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Account Role / Access Level</label>
                    <select 
                      className="input-glass w-full rounded-lg px-4 py-2.5 text-on-surface font-body-md shadow-inner font-bold text-sm cursor-pointer border border-white/40"
                      value={loginRole}
                      onChange={(e) => setLoginRole(e.target.value)}
                    >
                      <option value="citizen">Citizen Self-Service Account</option>
                      <option value="authority">Authority Command Officer</option>
                    </select>
                  </div>
                )}

                {authMode === 'register' && loginRole === 'authority' && (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Municipal Department Name</label>
                    <input 
                      type="text"
                      className="input-glass w-full rounded-lg px-4 py-2.5 text-on-surface font-body-md shadow-inner font-bold text-sm"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Municipal Operations Command"
                      required
                    />
                  </div>
                )}

                {authMode === 'register' && (
                  <div className="flex flex-col gap-1">
                    <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Full Legal Name</label>
                    <input 
                      type="text"
                      className="input-glass w-full rounded-lg px-4 py-2.5 text-on-surface font-body-md shadow-inner font-bold text-sm"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Email Address</label>
                  <input 
                    type="email"
                    className="input-glass w-full rounded-lg px-4 py-2.5 text-on-surface font-body-md shadow-inner font-bold text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Security Passcode</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      className="input-glass w-full rounded-lg px-4 py-2.5 text-on-surface font-body-md shadow-inner pr-10 font-bold text-sm"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password..."
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                {authMode === 'register' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Age</label>
                        <input 
                          type="number"
                          className="input-glass w-full rounded-lg px-3 py-2 text-on-surface font-body-md shadow-inner font-bold text-sm"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="32"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Gender</label>
                        <select 
                          className="input-glass w-full rounded-lg px-3 py-2 text-on-surface font-body-md shadow-inner font-bold text-sm cursor-pointer"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Primary Location</label>
                      <input 
                        type="text"
                        className="input-glass w-full rounded-lg px-4 py-2.5 text-on-surface font-body-md shadow-inner font-bold text-sm"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. New Delhi, DL"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Annual Income (₹)</label>
                        <input 
                          type="number"
                          className="input-glass w-full rounded-lg px-3 py-2 text-on-surface font-body-md shadow-inner font-bold text-sm"
                          value={income}
                          onChange={(e) => setIncome(e.target.value)}
                          placeholder="350000"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-label-bold text-xs text-on-surface uppercase font-bold">Occupation</label>
                        <select 
                          className="input-glass w-full rounded-lg px-3 py-2 text-on-surface font-body-md shadow-inner font-bold text-sm cursor-pointer"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                        >
                          <option value="Artisan">Artisan</option>
                          <option value="Farmer">Farmer</option>
                          <option value="Transport">Transport</option>
                          <option value="Entrepreneur">Entrepreneur</option>
                          <option value="Retired">Retired</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary-container text-on-secondary-container font-label-bold text-label-bold py-3 rounded-lg mt-2 accent-glow hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest shadow-lg font-black"
                >
                  {loading ? 'PROCESSING...' : authMode === 'register' ? 'REGISTER ACCOUNT' : 'LOGIN TO PORTAL'}
                </button>
              </form>
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
