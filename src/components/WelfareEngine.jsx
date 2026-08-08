import React, { useState, useEffect } from 'react';

export default function WelfareEngine() {
  const [income, setIncome] = useState('350000');
  const [location, setLocation] = useState('Urban');
  const [occupation, setOccupation] = useState('Artisan');
  const [customOccupation, setCustomOccupation] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState(null);
  const [applicantName, setApplicantName] = useState('');
  const [applyModalScheme, setApplyModalScheme] = useState(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null);

  useEffect(() => {
    handleSearch();
  }, []);

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
        setLocation(`Urban (GPS: ${lat}, ${lon})`);
        setGpsStatus(`LOCATION VERIFIED: ${lat}, ${lon}`);
      },
      (err) => {
        setGpsStatus('LOCATION ACCESS DENIED - DEFAULTED TO REGIONAL METRO');
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
      setLoading(false);
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
        setApplicationSuccess(true);
        setTimeout(() => {
          setApplicationSuccess(false);
          setApplyModalScheme(null);
          setApplicantName('');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="glow-title">EXPLAINABLE WELFARE RECOMMENDATION ENGINE</h1>
      <p className="subtitle">Algorithmic socio-economic matching in Indian Rupees (INR / ₹) with explainable qualification rationale.</p>

      <form onSubmit={handleSearch} className="card" style={{ marginBottom: '32px' }}>
        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Annual Household Income (INR / ₹)</label>
            <input 
              type="number" 
              className="form-input"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="e.g. 350000"
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Location Parameter</label>
              <button 
                type="button" 
                onClick={handleUseGpsLocation}
                style={{ background: 'none', border: 'none', color: 'var(--neon-cyan)', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase', fontWeight: '700' }}
              >
                USE MY CURRENT LOCATION
              </button>
            </div>
            <input 
              type="text" 
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Select or auto-detect GPS location"
              required
            />
            {gpsStatus && (
              <span style={{ fontSize: '0.75rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {gpsStatus}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Occupation Category</label>
            <select 
              className="form-select"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            >
              <option value="Artisan">Artisan / Craftsperson</option>
              <option value="Farmer">Farmer / Agriculture</option>
              <option value="Transportation Worker">Transportation Worker</option>
              <option value="Entrepreneur">Entrepreneur / Business</option>
              <option value="Retired">Retired / Senior</option>
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
              onChange={(e) => setCustomOccupation(e.target.value)}
              placeholder="Enter custom occupation name..."
              required
            />
          </div>
        )}

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'CALCULATING MATCHES...' : 'RUN EXPLAINABLE MATCHING ENGINE'}
          </button>
        </div>
      </form>

      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          ELIGIBLE SCHEME MATCHES ({matches.length})
        </h2>
      </div>

      <div className="grid-2">
        {matches.map((scheme, index) => (
          <div 
            key={scheme.id} 
            className="card card-interactive stagger-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span className="badge badge-cyan">{scheme.category}</span>
              <span className={`badge ${scheme.matchScore >= 65 ? 'badge-resolved' : 'badge-pending'}`}>
                {scheme.matchScore}% MATCH SCORE
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px', color: '#FFFFFF' }}>
              {scheme.title}
            </h3>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
              {scheme.description}
            </p>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>GRANT VALUE (INR)</div>
                <div style={{ fontWeight: '700', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>{scheme.financial_grant}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>SUBSIDY RATE</div>
                <div style={{ fontWeight: '700', color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>{scheme.subsidy_rate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-primary" 
                style={{ fontSize: '0.8rem', padding: '8px 14px', flex: 1 }}
                onClick={() => setActiveGuideId(activeGuideId === scheme.id ? null : scheme.id)}
              >
                {activeGuideId === scheme.id ? 'HIDE ANALYSIS' : 'EXPLAINABLE RATIONALE & WORKFLOW'}
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
                <h4 style={{ color: 'var(--neon-green)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ALGORITHMIC QUALIFICATION RATIONALE
                </h4>
                <ul style={{ listStyle: 'none', marginBottom: '12px' }}>
                  {scheme.matchExplanations?.map((exp, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', color: '#FFFFFF' }}>
                      + {exp}
                    </li>
                  ))}
                </ul>

                {scheme.ineligibilityReasons?.length > 0 && (
                  <>
                    <h4 style={{ color: 'var(--neon-yellow)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                      INELIGIBILITY / DISCREPANCY ANALYSIS
                    </h4>
                    <ul style={{ listStyle: 'none', marginBottom: '12px' }}>
                      {scheme.ineligibilityReasons.map((reason, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', color: 'var(--color-text-muted)' }}>
                          - {reason}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <h4 style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                  DOCUMENTATION &amp; VERIFICATION CHECKLIST
                </h4>
                <ul style={{ listStyle: 'none', marginBottom: '16px' }}>
                  {scheme.document_checklist.map((doc, i) => (
                    <li key={i} style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="step-num">[DOC-{i+1}]</span> {doc}
                    </li>
                  ))}
                </ul>

                <h4 style={{ color: 'var(--neon-cyan)', fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>
                  STEP-BY-STEP APPLICATION PROCEDURE
                </h4>
                <div>
                  {scheme.application_guide.map((step, i) => (
                    <div key={i} className="checklist-step">
                      <span className="step-num">STEP {i+1}:</span>
                      <span style={{ fontSize: '0.85rem' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {applyModalScheme && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200
        }}>
          <div className="card" style={{ width: '450px', border: '2px solid var(--neon-cyan)', boxShadow: 'var(--glow-cyan)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', color: '#FFFFFF' }}>
              APPLY FOR {applyModalScheme.title.toUpperCase()}
            </h3>

            {applicationSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div className="badge badge-resolved" style={{ fontSize: '1rem', padding: '12px 24px' }}>
                  APPLICATION SUBMITTED SUCCESSFULLY
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
