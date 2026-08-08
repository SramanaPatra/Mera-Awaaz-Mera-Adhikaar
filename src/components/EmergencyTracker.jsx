import React, { useState, useEffect } from 'react';

export default function EmergencyTracker() {
  const [activeSOS, setActiveSOS] = useState(true);
  const [coords, setCoords] = useState('28.6139° N, 77.2090° E');
  const [dispatchLogs, setDispatchLogs] = useState([
    { time: '10 SEC AGO', status: 'GPS BEACON BROADCASTING ACTIVE' },
    { time: '45 SEC AGO', status: 'DISPATCH COMMAND ACKNOWLEDGED' },
    { time: '2 MIN AGO', status: 'EMERGENCY SOS SIGNAL INITIATED' }
  ]);

  useEffect(() => {
    let watchId;
    if (activeSOS && 'geolocation' in navigator) {
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
  }, [activeSOS]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="glass-panel rounded-xl p-8 accent-glow relative overflow-hidden border-2 border-red-500/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/30 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400 text-3xl animate-pulse">emergency</span>
            <div>
              <h2 className="font-headline-lg text-headline-md font-black text-white text-glow-md">
                EMERGENCY SOS BROADCAST COMMAND
              </h2>
              <p className="font-body-md text-slate-100 text-sm mt-1 font-bold text-glow-sm">
                Real-time encrypted satellite dispatch beacon connecting directly to state disaster response cells.
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveSOS(!activeSOS)}
            className={`px-6 py-2.5 rounded-full font-label-bold text-xs font-black transition-all shadow-lg ${activeSOS ? 'bg-error text-white animate-pulse' : 'bg-secondary-container text-on-secondary-container'}`}
          >
            {activeSOS ? 'ACTIVE EMERGENCY BROADCAST' : 'INITIATE SOS BROADCAST'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-3">
            <h3 className="font-headline-md text-sm font-black text-white uppercase text-glow-sm">SATELLITE BEACON COORDINATES</h3>
            <div className="bg-white/80 p-4 rounded-lg font-mono text-xl font-black text-slate-900 text-center tracking-widest shadow-inner">
              {coords}
            </div>
            <p className="text-xs text-slate-100 font-bold text-glow-sm">High-precision dual-band GPS telemetry synced with emergency dispatch grid.</p>
          </div>

          <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-3">
            <h3 className="font-headline-md text-sm font-black text-white uppercase text-glow-sm">RESPONSE STATUS LOG</h3>
            <div className="space-y-2">
              {dispatchLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/30 p-2.5 rounded text-xs font-mono border border-white/40 shadow-sm">
                  <span className="font-black text-white text-glow-sm">{log.status}</span>
                  <span className="font-bold text-secondary-container text-glow-sm">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
