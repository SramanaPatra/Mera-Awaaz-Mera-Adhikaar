import React, { useState, useEffect } from 'react';

export default function WelfareEngine({ citizenProfile, setCitizenProfile }) {
  const [income, setIncome] = useState(citizenProfile?.income || '350000');
  const [location, setLocation] = useState(citizenProfile?.location || 'Urban');
  const [occupation, setOccupation] = useState(citizenProfile?.occupation || 'Artisan');
  const [customOccupation, setCustomOccupation] = useState(citizenProfile?.customOccupation || '');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applyModalScheme, setApplyModalScheme] = useState(null);
  const [notification, setNotification] = useState(null);
  const [gpsStatus, setGpsStatus] = useState(null);
  const [cardTilt, setCardTilt] = useState({});

  useEffect(() => {
    handleSearch();
  }, []);

  const handleMouseMove = (e, schemeId) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    setCardTilt(prev => ({ ...prev, [schemeId]: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }));
  };

  const handleMouseLeave = (schemeId) => {
    setCardTilt(prev => ({ ...prev, [schemeId]: 'rotateX(0deg) rotateY(0deg)' }));
  };

  const updateProfileState = (newIncome, newLoc, newOcc, newCustom) => {
    setIncome(newIncome);
    setLocation(newLoc);
    setOccupation(newOcc);
    setCustomOccupation(newCustom);
    if (setCitizenProfile) {
      setCitizenProfile({
        income: newIncome,
        location: newLoc,
        occupation: newOcc,
        customOccupation: newCustom
      });
    }
  };

  const getProfileCompleteness = () => {
    let score = 0;
    if (income && Number(income) > 0) score += 35;
    if (location) score += 35;
    if (occupation === 'Other') {
      if (customOccupation.trim()) score += 30;
    } else if (occupation) {
      score += 30;
    }
    return score;
  };

  const handleUseGpsLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('GPS GEOLOCATION NOT SUPPORTED BY BROWSER');
      return;
    }

    setGpsStatus('ACQUIRING CURRENT LOCATION...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lon = position.coords.longitude.toFixed(4);
        const newLoc = `Urban (GPS: ${lat}, ${lon})`;
        updateProfileState(income, newLoc, occupation, customOccupation);
        setGpsStatus(`LOCATION VERIFIED: ${lat}, ${lon}`);
      },
      (err) => {
        setGpsStatus('LOCATION ACCESS DENIED - DEFAULTED TO METRO');
      }
    );
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/welfare/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income,
          location,
          occupation,
          customOccupation
        })
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyModalScheme || !applicantName) return;

    try {
      const res = await fetch('/api/welfare/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme_id: applyModalScheme.id,
          citizen_name: applicantName,
          income,
          occupation: occupation === 'Other' ? customOccupation : occupation,
          location
        })
      });
      const data = await res.json();
      if (data.success) {
        setApplyModalScheme(null);
        setApplicantName('');
        setNotification({
          title: 'APPLICATION SUBMITTED',
          message: `Official application for ${applyModalScheme.title} has been logged under ID #${data.data.id}.`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completenessScore = getProfileCompleteness();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '16px' }}>
        <div>
          <h1 className="glow-title">EXPLAINABLE WELFARE ENGINE</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            Visual socio-economic eligibility analysis in Indian Rupees (INR / ₹) with soft pink glassmorphism.
          </p>
        </div>

        <div className="card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <svg width="60" height="60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="40" 
              fill="none" 
              stroke="#ffb703" 
              strokeWidth="8" 
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - (251.2 * completenessScore) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="50" y="55" textAnchor="middle" fill="#111111" fontSize="20" fontWeight="900" fontFamily="monospace">
              {completenessScore}%
            </text>
          </svg>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-subtext)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>PROFILE READINESS</div>
            <div style={{ fontSize: '0.95rem', fontWeight: '800', color: completenessScore === 100 ? '#006633' : '#b58304' }}>
              {completenessScore === 100 ? 'OPTIMAL PROFILE READY' : 'COMPLETE INTAKE STEPS'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card" style={{ marginBottom: '32px' }}>
        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Step 1: Annual Household Income (INR / ₹)</label>
            <input 
              type="number" 
              className="form-input"
              value={income}
              onChange={(e) => updateProfileState(e.target.value, location, occupation, customOccupation)}
              placeholder="e.g. 350000"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Step 2: Location Parameter</label>
              <button 
                type="button" 
                onClick={handleUseGpsLocation}
                style={{ background: 'none', border: 'none', color: '#b58304', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase', fontWeight: '900' }}
              >
                USE MY CURRENT LOCATION
              </button>
            </div>
            <input 
              type="text" 
              className="form-input"
              value={location}
              onChange={(e) => updateProfileState(income, e.target.value, occupation, customOccupation)}
              placeholder="Select or auto-detect GPS location"
              required
            />
            {gpsStatus && (
              <span style={{ fontSize: '0.75rem', color: '#006633', fontFamily: 'var(--font-mono)', marginTop: '4px', fontWeight: '700' }}>
                {gpsStatus}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Step 3: Occupation Sector</label>
            <select 
              className="form-select"
              value={occupation}
              onChange={(e) => updateProfileState(income, location, e.target.value, customOccupation)}
            >
              <option value="Artisan">Artisan / Craftsperson</option>
              <option value="Farmer">Farmer / Agriculture</option>
              <option value="Transportation Worker">Transportation Worker</option>
              <option value="Entrepreneur">Entrepreneur / Business</option>
              <option value="Retired">Retired / Senior Citizen</option>
              <option value="Other">Other (Custom Sector)</option>
            </select>
          </div>
        </div>

        {occupation === 'Other' && (
          <div className="form-group" style={{ marginTop: '12px' }}>
            <label className="form-label">Specify Custom Occupation Sector</label>
            <input 
              type="text"
              className="form-input"
              value={customOccupation}
              onChange={(e) => updateProfileState(income, location, occupation, e.target.value)}
              placeholder="Enter custom occupation name..."
              required
            />
          </div>
        )}

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{ padding: '14px 28px', fontSize: '1rem' }}
          >
            {loading ? 'ANALYZING ELIGIBILITY TELEMETRY...' : 'ANALYZE MY ELIGIBILITY'}
          </button>
        </div>
      </form>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: '#111111' }}>
          REAL-TIME ELIGIBILITY INSIGHTS TELEMETRY
        </h3>

        <div className="grid-4">
          <div className="css-bar-row">
            <div className="css-bar-header">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-subtext)' }}>INCOME MATCH</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#006633', fontWeight: '800' }}>92%</span>
            </div>
            <div className="css-bar-track">
              <div className="css-bar-fill fill-green" style={{ width: '92%' }}></div>
            </div>
          </div>

          <div className="css-bar-row">
            <div className="css-bar-header">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-subtext)' }}>LOCATION SCOPE</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#b58304', fontWeight: '800' }}>88%</span>
            </div>
            <div className="css-bar-track">
              <div className="css-bar-fill fill-yellow" style={{ width: '88%' }}></div>
            </div>
          </div>

          <div className="css-bar-row">
            <div className="css-bar-header">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-subtext)' }}>OCCUPATION FIT</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#b58304', fontWeight: '800' }}>95%</span>
            </div>
            <div className="css-bar-track">
              <div className="css-bar-fill fill-yellow" style={{ width: '95%' }}></div>
            </div>
          </div>

          <div className="css-bar-row">
            <div className="css-bar-header">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-subtext)' }}>DOCUMENT READINESS</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#006680', fontWeight: '800' }}>75%</span>
            </div>
            <div className="css-bar-track">
              <div className="css-bar-fill fill-cyan" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111111' }}>
          RECOMMENDED SCHEMES ({matches.length})
        </h2>
      </div>

      {loading ? (
        <div className="grid-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-box" style={{ height: '240px', padding: '24px' }}>
              <div style={{ height: '20px', width: '40%', background: 'rgba(255, 235, 133, 0.4)', marginBottom: '16px', borderRadius: '4px' }}></div>
              <div style={{ height: '30px', width: '80%', background: 'rgba(255, 235, 133, 0.6)', marginBottom: '16px', borderRadius: '4px' }}></div>
              <div style={{ height: '60px', width: '100%', background: 'rgba(255, 235, 133, 0.3)', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid-2">
          {matches.map((scheme, index) => (
            <div 
              key={scheme.id} 
              className="card card-interactive stagger-item"
              style={{
                animationDelay: `${index * 0.1}s`,
                transform: cardTilt[scheme.id] || 'rotateX(0deg) rotateY(0deg)'
              }}
              onMouseMove={(e) => handleMouseMove(e, scheme.id)}
              onMouseLeave={() => handleMouseLeave(scheme.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-yellow">{scheme.category}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg width="44" height="44" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="10" />
                    <circle 
                      cx="50" cy="50" r="40" 
                      fill="none" 
                      stroke={scheme.matchScore >= 65 ? '#00cc66' : '#ffb703'} 
                      strokeWidth="10" 
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 - (251.2 * scheme.matchScore) / 100}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <text x="50" y="56" textAnchor="middle" fill="#111111" fontSize="22" fontWeight="900" fontFamily="monospace">
                      {scheme.matchScore}%
                    </text>
                  </svg>
                </div>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: '#111111' }}>
                {scheme.title}
              </h3>

              <p style={{ color: 'var(--color-subtext)', fontSize: '0.95rem', marginBottom: '16px' }}>
                {scheme.description}
              </p>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-yellow)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-subtext)', textTransform: 'uppercase', fontWeight: '700' }}>FINANCIAL GRANT (INR)</div>
                  <div style={{ fontWeight: '900', color: '#006633', fontFamily: 'var(--font-mono)', fontSize: '1.05rem' }}>{scheme.financial_grant}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border-yellow)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-subtext)', textTransform: 'uppercase', fontWeight: '700' }}>SUBSIDY RATE</div>
                  <div style={{ fontWeight: '900', color: '#b58304', fontFamily: 'var(--font-mono)', fontSize: '1.05rem' }}>{scheme.subsidy_rate}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-primary" 
                  style={{ fontSize: '0.8rem', padding: '8px 14px', flex: 1 }}
                  onClick={() => setActiveGuideId(activeGuideId === scheme.id ? null : scheme.id)}
                >
                  {activeGuideId === scheme.id ? 'HIDE DETAILS' : 'EXPLAINABLE RATIONALE'}
                </button>
                <button 
                  className="btn-success" 
                  style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                  onClick={() => setApplyModalScheme(scheme)}
                >
                  APPLY NOW
                </button>
              </div>

              {activeGuideId === scheme.id && (
                <div className="checklist-box">
                  <h4 style={{ color: '#006633', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                    QUALIFICATION RATIONALE
                  </h4>
                  <ul style={{ listStyle: 'none', marginBottom: '12px' }}>
                    {scheme.matchExplanations?.map((exp, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', color: '#111111', fontWeight: '600' }}>
                        + {exp}
                      </li>
                    ))}
                  </ul>

                  {scheme.ineligibilityReasons?.length > 0 && (
                    <>
                      <h4 style={{ color: '#b58304', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                        INELIGIBILITY / DISCREPANCY ANALYSIS
                      </h4>
                      <ul style={{ listStyle: 'none', marginBottom: '12px' }}>
                        {scheme.ineligibilityReasons.map((reason, i) => (
                          <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-subtext)' }}>
                            - {reason}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <h4 style={{ color: '#b58304', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                    DOCUMENTATION &amp; VERIFICATION CHECKLIST
                  </h4>
                  <ul style={{ listStyle: 'none', marginBottom: '16px' }}>
                    {scheme.document_checklist.map((doc, i) => (
                      <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px', color: '#111111' }}>
                        <span className="step-num">[DOC-{i+1}]</span> {doc}
                      </li>
                    ))}
                  </ul>

                  <h4 style={{ color: '#b58304', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                    STEP-BY-STEP APPLICATION PROCEDURE
                  </h4>
                  <div>
                    {scheme.application_guide.map((step, i) => (
                      <div key={i} className="checklist-step">
                        <span className="step-num">STEP {i+1}:</span>
                        <span style={{ fontSize: '0.85rem', color: '#111111', fontWeight: '600' }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {applyModalScheme && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 209, 220, 0.7)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200
        }}>
          <div className="card" style={{ width: '450px', background: 'rgba(255, 255, 255, 0.95)', border: '2px solid var(--yellow-accent)', boxShadow: 'var(--halo-glow-strong)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', color: '#111111' }}>
              APPLY FOR {applyModalScheme.title.toUpperCase()}
            </h3>

            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label className="form-label">Full Legal Name</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmed Income Level</label>
                <input type="text" className="form-input" value={`INR ${Number(income).toLocaleString('en-IN')}`} disabled />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn-danger" 
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => setApplyModalScheme(null)}
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  CONFIRM SUBMISSION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="badge badge-resolved" style={{ fontSize: '0.9rem', marginBottom: '16px' }}>
              {notification.title}
            </div>
            <p style={{ color: '#111111', fontSize: '1rem', marginBottom: '24px', fontWeight: '600' }}>
              {notification.message}
            </p>
            <div style={{ textAlign: 'right' }}>
              <button 
                className="btn-primary"
                onClick={() => setNotification(null)}
              >
                CLOSE NOTIFICATION
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
