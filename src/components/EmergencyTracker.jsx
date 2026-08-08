import React, { useState, useEffect, useRef } from 'react';

export default function EmergencyTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [userSession] = useState(() => `SES-${Math.floor(100000 + Math.random() * 900000)}`);
  const [coords, setCoords] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [statusMessage, setStatusMessage] = useState('EMERGENCY SOS SYSTEM READY - PRESS BUTTON TO BROADCAST GPS TELEMETRY');
  const [errorMessage, setErrorMessage] = useState(null);

  const watchIdRef = useRef(null);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const sendLocationToBackend = async (lat, lon, acc) => {
    try {
      await fetch('/api/emergency/live-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSession,
          latitude: lat,
          longitude: lon,
          accuracy: acc
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const startTracking = () => {
    setErrorMessage(null);
    if (!('geolocation' in navigator)) {
      setErrorMessage('GPS GEOLOCATION API IS NOT SUPPORTED BY THIS BROWSER ENVIRONMENT');
      return;
    }

    setStatusMessage('REQUESTING HIGH-ACCURACY GPS FIX...');

    const handleSuccess = (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const acc = position.coords.accuracy;

      setCoords({ lat, lon });
      setAccuracy(acc);
      setIsTracking(true);
      setStatusMessage('LIVE TELEMETRY ACTIVE - BROADCASTING TO MUNICIPAL EMERGENCY RESPONSE UNIT');

      sendLocationToBackend(lat, lon, acc);
    };

    const handleError = (error) => {
      let msg = 'LOCATION ERROR ENCOUNTERED';
      if (error.code === error.PERMISSION_DENIED) {
        msg = 'LOCATION PERMISSION DENIED BY CITIZEN - PLEASE ALLOW GPS ACCESS IN BROWSER SETTINGS';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        msg = 'SATELLITE POSITION UNKNOWN OR TEMPORARILY UNAVAILABLE';
      } else if (error.code === error.TIMEOUT) {
        msg = 'SATELLITE SIGNAL TIMED OUT';
      }
      setErrorMessage(msg);
      setIsTracking(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000
    });

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 2000
    });
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (isTracking) {
      fetch('/api/emergency/stop-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userSession })
      }).catch(err => console.error(err));
    }

    setIsTracking(false);
    setStatusMessage('LOCATION BROADCAST TERMINATED BY CITIZEN');
  };

  const getSvgCoordinates = () => {
    if (!coords) return { x: 250, y: 175 };
    const x = 250 + ((coords.lon % 1) * 300);
    const y = 175 - ((coords.lat % 1) * 300);
    return {
      x: Math.max(50, Math.min(450, x)),
      y: Math.max(50, Math.min(300, y))
    };
  };

  const svgPos = getSvgCoordinates();

  return (
    <div>
      <h1 className="glow-title">REAL-TIME EMERGENCY ASSISTANCE &amp; GPS TRACKER</h1>
      <p className="subtitle">High-accuracy satellite telemetry streaming for immediate civic emergency dispatch.</p>

      <div className="card" style={{ marginBottom: '24px', border: isTracking ? '2px solid var(--neon-red)' : '1px solid var(--border-color)', boxShadow: isTracking ? 'var(--glow-red)' : 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>SESSION REF</span>
            <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>{userSession}</div>
          </div>

          <div>
            {isTracking ? (
              <span className="badge badge-escalated" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                <span className="status-dot"></span> LOCATION SHARING ACTIVE
              </span>
            ) : (
              <span className="badge badge-pending" style={{ fontSize: '0.9rem', padding: '8px 16px' }}>
                SYSTEM STANDBY
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: '12px', background: 'var(--bg-input)', borderRadius: '6px', marginBottom: '20px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <div style={{ color: isTracking ? 'var(--neon-green)' : 'var(--neon-yellow)' }}>{statusMessage}</div>
          {errorMessage && <div style={{ color: 'var(--neon-red)', marginTop: '4px' }}>{errorMessage}</div>}
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {!isTracking ? (
            <button 
              className="btn-danger"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
              onClick={startTracking}
            >
              SHARE LIVE EMERGENCY LOCATION
            </button>
          ) : (
            <button 
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem', borderColor: 'var(--neon-yellow)', color: 'var(--neon-yellow)' }}
              onClick={stopTracking}
            >
              STOP LOCATION SHARING
            </button>
          )}
        </div>
      </div>

      {coords && (
        <div className="grid-2" style={{ marginBottom: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', color: '#FFFFFF' }}>
              GPS TELEMETRY READOUT
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-mono)' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>LATITUDE:</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{coords.lat.toFixed(6)} DEG</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>LONGITUDE:</span>
                <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>{coords.lon.toFixed(6)} DEG</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>ACCURACY RADIUS:</span>
                <span style={{ color: 'var(--neon-green)', fontWeight: '700' }}>{accuracy ? `${Math.round(accuracy)} METERS` : 'HIGH FIX'}</span>
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '12px', color: '#FFFFFF', width: '100%' }}>
              SATELLITE POSITION BEACON (PURE SVG GRID)
            </h3>

            <svg width="100%" height="220" viewBox="0 0 500 350" style={{ background: '#05070A', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#111B28" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="500" height="350" fill="url(#grid)" />
              
              <circle cx={svgPos.x} cy={svgPos.y} r="30" fill="rgba(255, 0, 85, 0.15)" stroke="var(--neon-red)" strokeWidth="1" />
              <circle cx={svgPos.x} cy={svgPos.y} r="15" fill="rgba(255, 0, 85, 0.3)" />
              <circle cx={svgPos.x} cy={svgPos.y} r="6" fill="var(--neon-red)" />
              
              <line x1={svgPos.x - 40} y1={svgPos.y} x2={svgPos.x + 40} y2={svgPos.y} stroke="var(--neon-cyan)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1={svgPos.x} y1={svgPos.y - 40} x2={svgPos.x} y2={svgPos.y + 40} stroke="var(--neon-cyan)" strokeWidth="1" strokeDasharray="3,3" />

              <text x="20" y="330" fill="var(--neon-cyan)" fontSize="12" fontFamily="monospace">
                TARGET LOCK: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
              </text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
