import React, { useState, useEffect, useRef } from 'react';
import { useWebSpeech } from '../../hooks/useWebSpeech';

export default function StitchCitizenDashboard({ activeTab, setActiveTab, user, onLogout, activeSubView = 'dashboard', setActiveSubView }) {
  const [income, setIncome] = useState(user && user.income ? user.income : '');
  const [location, setLocation] = useState(user && user.location ? user.location : '');
  const [occupation, setOccupation] = useState(user && user.occupation ? user.occupation : '');
  const [customOccupation, setCustomOccupation] = useState('');
  const [age, setAge] = useState(user && user.age ? user.age : '');
  const [gender, setGender] = useState(user && user.gender ? user.gender : '');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applicantName, setApplicantName] = useState(user ? user.name : '');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [activeRationaleId, setActiveRationaleId] = useState(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const [sosActive, setSosActive] = useState(true);
  const [coords, setCoords] = useState('28.6139° N, 77.2090° E');

  const [selectedLocale, setSelectedLocale] = useState('hi-IN');
  const [chatInput, setChatInput] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  const chatEndRef = useRef(null);
  const engineRef = useRef(null);
  const aiCardRef = useRef(null);
  const chatInputRef = useRef(null);

  const {
    speechState,
    speechError,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    clearError
  } = useWebSpeech();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiProcessing]);

  useEffect(() => {
    if (activeSubView === 'eligibility' && engineRef.current) {
      engineRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (activeSubView === 'ai-assistant') {
      if (aiCardRef.current) {
        aiCardRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      if (chatInputRef.current) {
        setTimeout(() => chatInputRef.current.focus(), 400);
      }
    }
  }, [activeSubView]);

  useEffect(() => {
    let watchId;
    if (sosActive && 'geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(4);
          const lon = pos.coords.longitude.toFixed(4);
          setCoords(`${lat}° N, ${lon}° E`);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [sosActive]);

  const getReadinessScore = () => {
    let score = 0;
    if (income && Number(income) > 0) score += 35;
    if (location && location.trim()) score += 35;
    if (occupation === 'Other') {
      if (customOccupation.trim()) score += 30;
    } else if (occupation) {
      score += 30;
    }
    return score;
  };

  const handleUseGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('GPS GEOLOCATION NOT SUPPORTED');
      return;
    }

    setGpsStatus('ACQUIRING SATELLITE LOCATION...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          const geoData = await res.json();
          const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Verified Location';
          const state = geoData.principalSubdivision || '';
          const resolvedLoc = city && state ? `${city}, ${state}` : city || 'Verified Location';
          setLocation(resolvedLoc);
          setGpsStatus(`RESOLVED: ${resolvedLoc} (GPS: ${lat}, ${lon})`);
        } catch (err) {
          setLocation('Verified Location');
          setGpsStatus(`VERIFIED GPS: ${lat}, ${lon}`);
        }
      },
      () => {
        setGpsStatus('LOCATION ACCESS DENIED');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!income && !location && !occupation) return;

    setLoading(true);
    try {
      const res = await fetch('/api/welfare/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income,
          location,
          occupation,
          customOccupation,
          age: user ? user.age : age,
          gender: user ? user.gender : gender
        })
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedScheme || !applicantName) return;

    try {
      const res = await fetch('/api/welfare/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme_id: selectedScheme.id,
          citizen_name: applicantName,
          income,
          occupation: occupation === 'Other' ? customOccupation : occupation,
          location
        })
      });
      const data = await res.json();
      if (data.success) {
        setApplicationSuccess(true);
        setTimeout(() => {
          setApplicationSuccess(false);
          setSelectedScheme(null);
          setApplicantName('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMicClick = () => {
    clearError();
    if (speechState === 'listening') {
      stopListening();
    } else {
      startListening(selectedLocale, (recognizedText) => {
        setChatInput(recognizedText);
      });
    }
  };

  const executeSendPipeline = async (textOverride) => {
    const query = textOverride || chatInput;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAiProcessing(true);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: [...chatMessages, userMsg],
          citizenProfile: { income, location, occupation, customOccupation, age, gender },
          localeCode: selectedLocale
        })
      });

      const data = await res.json();
      if (data.success) {
        const botMsg = { sender: 'bot', text: data.reply, localeCode: data.localeCode };
        setChatMessages(prev => [...prev, botMsg]);
        speak(data.reply, data.localeCode || selectedLocale);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiProcessing(false);
    }
  };

  const readinessScore = getReadinessScore();

  return (
    <div className="font-body-md text-on-surface antialiased">
      <div className="max-w-container-max mx-auto space-y-gutter">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <h1 className="font-display-lg text-display-lg text-white font-black uppercase text-glow-md">
              {activeSubView === 'profile' ? 'Citizen Profile' : 'Citizen Dashboard'}
            </h1>
            <p className="font-body-lg text-body-lg text-slate-100 mt-2 font-bold text-glow-sm">
              {activeSubView === 'profile' 
                ? 'Manage your entitlements, linked documents, and civic identity.' 
                : 'Discover your entitlements and secure your future.'}
            </p>
          </div>
        </header>

        {activeSubView === 'profile' ? (
          <div className="space-y-8">
            <div className="glass-panel rounded-2xl p-8 border-2 border-secondary-container relative overflow-hidden accent-glow">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-secondary-container overflow-hidden flex items-center justify-center shrink-0 shadow-md">
                    <img src="/profile-shield-emblem.jpg" alt="Citizen Profile Shield Emblem" className="w-full h-full object-cover" />
                  </div>

                  <div className="text-center md:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                      <h2 className="font-headline-md text-2xl font-black text-white text-glow-sm">
                        {user ? user.name : 'Verified Citizen User'}
                      </h2>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-mono text-xs font-black uppercase">
                        VERIFIED AADHAAR LINKED
                      </span>
                    </div>
                    <p className="font-mono text-xs text-slate-100 font-bold text-glow-sm">
                      CITIZEN ID: CIT-2026-{user ? user.id * 849 : 8849} &bull; AGE: {user && user.age ? user.age : '32'} &bull; GENDER: {user && user.gender ? user.gender : 'Male'}
                    </p>
                    <p className="text-sm font-bold text-slate-100 text-glow-sm">
                      {user ? user.email : 'citizen@adhikar.gov.in'} &bull; Primary Location: {user && user.location ? user.location : location || 'Not Specified'}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowCertificateModal(true)}
                  className="px-6 py-3 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-xs font-black shadow-lg hover:shadow-[0_0_20px_rgba(252,222,103,0.8)] transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  Export Entitlements Certificate (PDF)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/40">
                <h3 className="font-headline-md text-lg font-black text-white flex items-center gap-2 text-glow-sm">
                  <span className="material-symbols-outlined text-secondary-container bg-primary p-1 rounded-full text-base">badge</span>
                  Socioeconomic Profile Data
                </h3>

                <div className="space-y-3 text-sm font-bold">
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="text-slate-100 text-glow-sm">Declared Annual Income:</span>
                    <span className="font-mono text-white font-black text-glow-sm">₹ {income ? Number(income).toLocaleString('en-IN') : '0'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="text-slate-100 text-glow-sm">Occupation Category:</span>
                    <span className="text-white font-black text-glow-sm">{occupation === 'Other' ? customOccupation : occupation || 'Not Specified'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="text-slate-100 text-glow-sm">Municipal Jurisdiction:</span>
                    <span className="text-white font-black text-glow-sm">{location || 'Not Specified'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/20 pb-2">
                    <span className="text-slate-100 text-glow-sm">Direct Benefit Transfer (DBT):</span>
                    <span className="text-emerald-300 font-black text-glow-sm">ACTIVE (Aadhaar Seeded)</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 space-y-4 border border-white/40">
                <h3 className="font-headline-md text-lg font-black text-white flex items-center gap-2 text-glow-sm">
                  <span className="material-symbols-outlined text-secondary-container bg-primary p-1 rounded-full text-base">folder_shared</span>
                  Linked Document Vault
                </h3>

                <div className="space-y-3 text-sm font-bold">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <div>
                      <span className="block text-white font-black text-glow-sm">Aadhaar National ID</span>
                      <span className="text-xs text-slate-200 font-mono text-glow-sm">**** **** 8849</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-xs rounded-full font-mono font-bold">VERIFIED</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <div>
                      <span className="block text-white font-black text-glow-sm">State Ration Card</span>
                      <span className="text-xs text-slate-200 font-mono text-glow-sm">BPL-DEL-2024-9102</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-xs rounded-full font-mono font-bold">LINKED</span>
                  </div>

                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <div>
                      <span className="block text-white font-black text-glow-sm">Income &amp; Asset Certificate</span>
                      <span className="text-xs text-slate-200 font-mono text-glow-sm">INC-2026-VAL-489</span>
                    </div>
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-xs rounded-full font-mono font-bold">VALID</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <button 
                onClick={() => setActiveSubView && setActiveSubView('dashboard')}
                className="px-8 py-3 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-xs font-black shadow-lg hover:opacity-90 uppercase tracking-wider"
              >
                Return to Dashboard Overview
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
              <section id="welfare-engine-card" ref={engineRef} className="lg:col-span-2 glass-panel rounded-xl p-8 accent-glow relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                <h3 className="font-headline-md text-headline-md text-white mb-6 flex items-center gap-2 font-black text-glow-sm">
                  <span className="material-symbols-outlined text-secondary-container bg-primary p-1.5 rounded-full">troubleshoot</span>
                  Welfare Recommendation Engine
                </h3>

                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-label-bold text-label-bold text-white block text-glow-sm font-black">Location</label>
                      <div className="relative group">
                        <input 
                          type="text"
                          className="w-full bg-white/30 border-b-2 border-white/40 focus:border-secondary-container border-t-0 border-l-0 border-r-0 pl-4 pr-12 py-3 font-body-md outline-none transition-colors cursor-pointer group-hover:bg-white/40 rounded-t-lg text-slate-900 font-black truncate shadow-inner"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Type city/state or click target icon..."
                          required
                        />
                        <button 
                          type="button" 
                          onClick={handleUseGpsLocation}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-900 hover:text-secondary-container p-1 z-10"
                        >
                          <span className="material-symbols-outlined">my_location</span>
                        </button>
                      </div>
                      {gpsStatus && (
                        <span className="text-xs font-mono text-emerald-300 font-bold block text-glow-sm">{gpsStatus}</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="font-label-bold text-label-bold text-white block text-glow-sm font-black">Annual Income (INR / ₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-body-md text-slate-900 font-black">₹</span>
                        <input 
                          type="number"
                          className="w-full bg-white/30 border-b-2 border-white/40 focus:border-secondary-container border-t-0 border-l-0 border-r-0 pl-8 pr-4 py-3 font-body-md outline-none transition-colors rounded-t-lg text-slate-900 font-black shadow-inner"
                          value={income}
                          onChange={(e) => setIncome(e.target.value)}
                          placeholder="Enter annual income in INR..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-label-bold text-label-bold text-white block text-glow-sm font-black">Occupation Category</label>
                    <div className="flex flex-wrap gap-3">
                      {['Artisan', 'Farmer', 'Transport', 'Entrepreneur', 'Retired', 'Other'].map((occ) => (
                        <label key={occ} className="cursor-pointer">
                          <input 
                            type="radio"
                            name="occupation"
                            className="peer sr-only"
                            checked={occupation === occ}
                            onChange={() => setOccupation(occ)}
                          />
                          <span className="px-4 py-2 border-2 border-white/40 rounded-full font-label-bold text-label-bold peer-checked:bg-secondary-container peer-checked:text-on-secondary-container peer-checked:border-secondary-container transition-all hover:bg-white/40 block bg-white/20 text-white font-black text-glow-sm shadow-sm">
                            {occ}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {occupation === 'Other' && (
                    <div className="space-y-2 mt-4">
                      <label className="font-label-bold text-label-bold text-white block text-glow-sm font-black">Specify Custom Occupation Sector</label>
                      <input 
                        type="text"
                        className="w-full bg-white/30 border-b-2 border-white/40 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-body-md outline-none rounded-t-lg text-slate-900 font-black shadow-inner"
                        value={customOccupation}
                        onChange={(e) => setCustomOccupation(e.target.value)}
                        placeholder="Enter custom occupation name..."
                        required
                      />
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-label-bold text-label-bold hover:shadow-[0_0_20px_rgba(252,222,103,0.8)] transition-all font-black shadow-lg"
                    >
                      {loading ? 'ANALYZING ELIGIBILITY...' : 'Analyze Eligibility'}
                    </button>
                  </div>
                </form>
              </section>

              <section className="glass-panel rounded-xl p-8 flex flex-col items-center justify-between">
                <h3 className="font-headline-md text-headline-md text-white mb-4 w-full font-black text-glow-sm">Readiness</h3>
                
                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.3)" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" fill="none" r="45" 
                      stroke="#fcde67" 
                      strokeWidth="8"
                      strokeDasharray="282.7"
                      strokeDashoffset={282.7 - (282.7 * readinessScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-glow-md">
                    <span className="font-headline-lg text-headline-lg font-black">{readinessScore}</span>
                    <span className="font-label-bold text-label-bold">%</span>
                  </div>
                </div>

                <div className="w-full space-y-4 font-bold">
                  <div>
                    <div className="flex justify-between font-label-bold text-label-bold text-white mb-1 text-glow-sm">
                      <span>Income Match</span>
                      <span>{income ? '100%' : '0%'}</span>
                    </div>
                    <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                      <div className={`h-full bg-secondary-container transition-all ${income ? 'w-full' : 'w-0'}`}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-bold text-label-bold text-white mb-1 text-glow-sm">
                      <span>Location Scope</span>
                      <span>{location ? '80%' : '0%'}</span>
                    </div>
                    <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                      <div className={`h-full bg-secondary-container transition-all ${location ? 'w-4/5' : 'w-0'}`}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-bold text-label-bold text-white mb-1 text-glow-sm">
                      <span>Occupation Fit</span>
                      <span>{occupation ? '95%' : '0%'}</span>
                    </div>
                    <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                      <div className={`h-full bg-secondary-container transition-all ${occupation ? 'w-[95%]' : 'w-0'}`}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-label-bold text-label-bold text-white mb-1 text-glow-sm">
                      <span>Document Readiness</span>
                      <span>75%</span>
                    </div>
                    <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[75%] rounded-full"></div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mt-12">
              <section className="lg:col-span-2 space-y-6 relative">
                <h3 className="font-headline-md text-headline-md text-white mb-6 font-black text-glow-sm">
                  Matched Schemes ({matches.length})
                </h3>

                {matches.length === 0 ? (
                  <div className="glass-panel rounded-xl p-8 text-center text-white space-y-3 border border-white/40">
                    <span className="material-symbols-outlined text-4xl text-secondary-container">search_off</span>
                    <h4 className="font-headline-md text-lg font-black uppercase text-glow-sm">No Recommendations Generated Yet</h4>
                    <p className="font-body-md text-sm text-slate-100 font-bold max-w-md mx-auto text-glow-sm">
                      Fill in your location, annual income, and occupation sector above, then click <strong className="text-secondary-container">Analyze Eligibility</strong> to evaluate state welfare schemes.
                    </p>
                  </div>
                ) : loading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="glass-panel rounded-xl p-6 h-36 animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  matches.map((scheme) => (
                    <div 
                      key={scheme.id}
                      className="glass-panel rounded-xl p-6 tilt-card flex flex-col sm:flex-row gap-6 items-center sm:items-start relative overflow-hidden accent-glow"
                    >
                      <div className="absolute left-0 top-0 w-2 h-full bg-secondary-container"></div>
                      <div className="w-20 h-20 shrink-0 rounded-full bg-white/30 flex flex-col items-center justify-center border-2 border-secondary-container shadow-md">
                        <span className="font-headline-md text-headline-md font-black text-white text-glow-sm">
                          {scheme.matchScore}<span className="text-sm">%</span>
                        </span>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-headline-md text-[20px] font-black text-white mb-1 text-glow-sm">{scheme.title}</h4>
                        <p className="font-body-md text-slate-100 mb-3 font-bold text-glow-sm">{scheme.description}</p>
                        
                        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                          <span className="px-3 py-1 bg-white/30 rounded-full font-label-bold text-label-bold text-white text-xs font-black text-glow-sm border border-white/40">
                            Grant: {scheme.financial_grant}
                          </span>
                          <span className="px-3 py-1 bg-white/30 rounded-full font-label-bold text-label-bold text-white text-xs font-black text-glow-sm border border-white/40">
                            Subsidy: {scheme.subsidy_rate}
                          </span>
                        </div>

                        {activeRationaleId === scheme.id && (
                          <div className="mt-4 p-4 bg-white/90 rounded-xl border border-white/60 text-xs space-y-3 shadow-inner">
                            <h5 className="font-black text-slate-900 uppercase">MATHEMATICAL MATCH SCORE WEIGHT BREAKDOWN</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] text-slate-900 font-bold border-b border-slate-300 pb-2">
                              <div className="bg-amber-100 p-2 rounded text-center">
                                <span className="block text-slate-700 font-bold">INCOME ALIGNMENT</span>
                                <span className="font-black text-slate-950">35 / 35 PTS</span>
                              </div>
                              <div className="bg-amber-100 p-2 rounded text-center">
                                <span className="block text-slate-700 font-bold">JURISDICTION FIT</span>
                                <span className="font-black text-slate-950">35 / 35 PTS</span>
                              </div>
                              <div className="bg-amber-100 p-2 rounded text-center">
                                <span className="block text-slate-700 font-bold">OCCUPATION MATCH</span>
                                <span className="font-black text-slate-950">30 / 30 PTS</span>
                              </div>
                            </div>

                            <h5 className="font-black text-slate-900 uppercase pt-1">EXPLAINABLE RATIONALE</h5>
                            <ul className="list-disc pl-4 space-y-1">
                              {scheme.matchExplanations?.map((exp, idx) => (
                                <li key={idx} className="font-bold text-emerald-900">{exp}</li>
                              ))}
                            </ul>
                            <h5 className="font-black text-slate-900 uppercase pt-1">DOCUMENT CHECKLIST</h5>
                            <p className="font-bold text-slate-900">{scheme.document_checklist?.join(', ')}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 sm:mt-0 flex flex-col gap-2">
                        <button 
                          onClick={() => setSelectedScheme(scheme)}
                          className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-full font-label-bold text-label-bold hover:opacity-90 transition-colors whitespace-nowrap font-black shadow-md"
                        >
                          Apply Now
                        </button>
                        <button 
                          onClick={() => setActiveRationaleId(activeRationaleId === scheme.id ? null : scheme.id)}
                          className="border-2 border-white/50 text-white px-4 py-1.5 rounded-full font-label-bold text-xs hover:bg-white/20 transition-colors whitespace-nowrap font-black text-glow-sm"
                        >
                          {activeRationaleId === scheme.id ? 'Hide Rationale' : 'Explain Rationale'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </section>

              <section className="space-y-6">
                <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    {sosActive && (
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-headline-md text-headline-md text-white mb-2 flex items-center gap-2 font-black text-glow-sm">
                    <span className="material-symbols-outlined text-error">emergency</span>
                    {sosActive ? 'SOS Active' : 'SOS Standby'}
                  </h3>
                  <p className="font-body-md text-slate-100 mb-4 text-sm font-bold text-glow-sm">Broadcasting coordinates to designated response center.</p>

                  <div className="bg-white/30 rounded-lg p-3 mb-4 font-label-bold text-label-bold text-slate-900 font-mono text-center tracking-widest border border-white/40 font-black shadow-inner">
                    {coords}
                  </div>

                  <button 
                    onClick={() => setSosActive(!sosActive)}
                    className={`w-full border-2 px-4 py-2 rounded-full font-label-bold text-label-bold transition-colors font-black ${sosActive ? 'border-error text-error hover:bg-error hover:text-white' : 'border-white text-white hover:bg-white hover:text-slate-900'}`}
                  >
                    {sosActive ? 'STOP BROADCAST' : 'START BROADCAST'}
                  </button>
                </div>

                <div id="ask-adhikar-ai-card" ref={aiCardRef} className="glass-panel rounded-xl p-6 flex flex-col h-[520px] relative accent-glow border-2 border-secondary-container/50">
                  <div className="flex justify-between items-center mb-4 border-b border-white/30 pb-3">
                    <h3 className="font-headline-md text-[20px] text-white flex items-center gap-2 font-black text-glow-sm">
                      <span className="material-symbols-outlined text-secondary-container bg-primary p-1.5 rounded-full text-base">graphic_eq</span>
                      Ask Adhikar AI
                    </h3>

                    <select 
                      value={selectedLocale}
                      onChange={(e) => {
                        setSelectedLocale(e.target.value);
                        setChatMessages([]);
                      }}
                      className="bg-white/30 border border-white/40 text-xs font-label-bold text-slate-900 outline-none focus:ring-0 cursor-pointer px-3 py-1.5 rounded-lg font-black shadow-sm"
                    >
                      <option value="hi-IN">हिन्दी (hi-IN)</option>
                      <option value="en-IN">English (en-IN)</option>
                      <option value="mr-IN">मराठी (mr-IN)</option>
                      <option value="ta-IN">தமிழ் (ta-IN)</option>
                      <option value="te-IN">తెలుగు (te-IN)</option>
                      <option value="bn-IN">বাংলা (bn-IN)</option>
                    </select>
                  </div>

                  {speechError && (
                    <div className="text-xs font-mono text-error font-bold mb-2 p-2 bg-error-container rounded">
                      MIC ERROR: {speechError}
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 flex flex-col scrollbar-thin">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-white space-y-2">
                        <span className="material-symbols-outlined text-3xl text-secondary-container">forum</span>
                        <p className="text-xs font-black font-body-md text-glow-sm text-slate-100">
                          Ask any question about welfare schemes, eligibility requirements, or document checklists.
                        </p>
                      </div>
                    )}

                    {chatMessages.map((msg, i) => (
                      <div 
                        key={i} 
                        className={`p-4 rounded-2xl max-w-[90%] text-sm font-body-md shadow-sm ${msg.sender === 'user' ? 'bg-secondary-container text-on-secondary-container rounded-tr-sm self-end font-black' : 'bg-white/90 rounded-tl-sm self-start text-slate-900 font-bold border border-white/50'}`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        {msg.sender === 'bot' && (
                          <button 
                            onClick={() => speak(msg.text, msg.localeCode || selectedLocale)}
                            className="text-[11px] font-mono text-emerald-900 font-black block mt-2 underline uppercase tracking-wider"
                          >
                            READ ALOUD
                          </button>
                        )}
                      </div>
                    ))}

                    {aiProcessing && (
                      <div className="flex items-center gap-2 text-xs font-label-bold text-white pt-2 pl-2 font-black text-glow-sm">
                        <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                        ANALYZING CITIZEN PROFILE &amp; SCHEMES...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="relative mt-auto pt-2">
                    <input 
                      ref={chatInputRef}
                      type="text"
                      className="w-full bg-white/80 border border-white/60 focus:border-secondary-container px-4 pr-12 py-3 font-body-md outline-none rounded-xl text-sm text-slate-900 font-black placeholder:text-slate-600 shadow-inner"
                      placeholder={speechState === 'listening' ? 'Listening...' : 'Speak or type prompt...'}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && executeSendPipeline()}
                    />
                    <button 
                      onClick={handleMicClick}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all p-1.5 rounded-full ${speechState === 'listening' ? 'bg-error text-white animate-pulse' : 'text-slate-900 hover:bg-secondary-container'}`}
                    >
                      <span className="material-symbols-outlined text-xl">mic</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>

      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-2xl w-full rounded-2xl p-8 bg-white/95 border-2 border-secondary-container shadow-2xl text-slate-900 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-300 pb-4">
              <div>
                <h3 className="font-headline-md text-2xl font-black text-slate-950 uppercase tracking-tight">
                  STATE WELFARE &amp; ENTITLEMENTS CERTIFICATE
                </h3>
                <p className="font-mono text-xs font-bold text-slate-700 mt-1">
                  MERA AWAAZ MERA ADHIKAR &bull; OFFICIAL CIVIC VERIFICATION PORTAL
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-950 rounded-full font-mono text-xs font-black uppercase">
                VERIFIED OFFICIAL DOCUMENT
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono font-bold bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div>
                <span className="text-slate-500 block">BENEFICIARY NAME</span>
                <span className="text-slate-950 font-black text-sm">{user ? user.name : 'Verified Citizen User'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">CITIZEN ID</span>
                <span className="text-slate-950 font-black text-sm">CIT-2026-{user ? user.id * 849 : 8849}</span>
              </div>
              <div>
                <span className="text-slate-500 block">DECLARED INCOME</span>
                <span className="text-slate-950 font-black text-sm">₹ {income ? Number(income).toLocaleString('en-IN') : '0'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">DIRECT BENEFIT TRANSFER</span>
                <span className="text-emerald-800 font-black text-sm">ACTIVE (Aadhaar Seeded)</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-black text-xs uppercase tracking-wider text-slate-700">VERIFIED WELFARE SCHEMES</h4>
              <ul className="list-disc pl-5 text-xs font-bold space-y-1">
                <li>PM Vishwakarma Toolkit Grant &amp; Credit Subsidy</li>
                <li>PM Krishi Sinchayee Yojana Water Infrastructure Scheme</li>
                <li>Atal Pension Yojana Retired Worker Security Fund</li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-300">
              <span className="font-mono text-[10px] font-bold text-slate-500">HASH: 0x8F92A47B-9102-ADHIKAR-2026</span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCertificateModal(false)}
                  className="px-4 py-2 border border-slate-400 rounded-full font-label-bold text-xs text-slate-800 hover:bg-slate-100 font-bold"
                >
                  Close
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-xs font-black shadow flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print / Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedScheme && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-xl p-8 bg-white/95 border-2 border-secondary-container shadow-2xl">
            <h3 className="font-headline-md text-headline-md text-slate-900 mb-2 font-black">
              Apply for {selectedScheme.title}
            </h3>
            <p className="text-sm font-body-md text-slate-700 mb-4 font-bold">
              Financial Benefit: <span className="font-black text-emerald-800">{selectedScheme.financial_grant}</span> ({selectedScheme.subsidy_rate})
            </p>

            {applicationSuccess ? (
              <div className="p-4 bg-emerald-100 text-emerald-900 rounded-lg text-center font-black font-mono">
                APPLICATION SUBMITTED SUCCESSFULLY
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                <div>
                  <label className="font-label-bold text-xs text-slate-900 block mb-1 uppercase font-black">Full Citizen Name</label>
                  <input 
                    type="text"
                    className="w-full bg-white border border-black/20 rounded-lg px-3 py-2 text-sm font-bold text-slate-900"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="Enter full legal name"
                    required
                  />
                </div>

                <div>
                  <label className="font-label-bold text-xs text-slate-900 block mb-1 uppercase font-black">Confirmed Income Level</label>
                  <input 
                    type="text"
                    className="w-full bg-black/5 border border-black/10 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 font-mono"
                    value={`₹ ${Number(income).toLocaleString('en-IN')}`}
                    disabled
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedScheme(null)}
                    className="px-4 py-2 border border-black/20 rounded-full font-label-bold text-xs text-slate-900 hover:bg-black/5 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-bold text-xs font-black shadow"
                  >
                    Confirm &amp; Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
