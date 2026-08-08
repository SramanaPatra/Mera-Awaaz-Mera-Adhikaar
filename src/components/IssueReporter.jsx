import React, { useState } from 'react';

export default function IssueReporter({ onReportSubmitted }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [urgency, setUrgency] = useState('Medium Priority');
  const [locationDescriptor, setLocationDescriptor] = useState('Metro District Corridor');
  const [latitude, setLatitude] = useState('28.6139');
  const [longitude, setLongitude] = useState('77.2090');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [gpsStatus, setGpsStatus] = useState(null);

  const handleAutoDetectLocation = () => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('GPS GEOLOCATION NOT SUPPORTED');
      return;
    }

    setGpsStatus('ACQUIRING COORDS...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        setGpsStatus('GPS BINDING SUCCESSFUL');
      },
      () => {
        setGpsStatus('LOCATION ACCESS DENIED');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          urgency,
          location_descriptor: locationDescriptor,
          latitude,
          longitude,
          description
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmissionResult(data.data);
        setTitle('');
        setDescription('');
        if (onReportSubmitted) {
          setTimeout(onReportSubmitted, 2000);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="glass-panel rounded-xl p-8 accent-glow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-6 border-b border-white/30 pb-4">
          <span className="material-symbols-outlined text-secondary-container bg-primary p-2 rounded-full text-2xl">report_problem</span>
          <div>
            <h2 className="font-headline-lg text-headline-md font-black text-white text-glow-md">
              ANONYMOUS CIVIC ISSUE REPORTING
            </h2>
            <p className="font-body-md text-slate-100 text-sm mt-1 font-bold text-glow-sm">
              Encrypted public reporting mechanism with automated GPS coordinate binding and immediate ledger entry.
            </p>
          </div>
        </div>

        {submissionResult ? (
          <div className="p-6 bg-white/80 border-2 border-secondary-container rounded-xl text-center space-y-4 shadow-xl">
            <span className="material-symbols-outlined text-emerald-800 text-4xl">check_circle</span>
            <h3 className="font-headline-md text-xl font-black text-slate-900">GRIEVANCE LOGGED SUCCESSFULLY</h3>
            <p className="font-mono text-sm font-black text-slate-900">
              Tracking Hash: <span className="bg-emerald-100 px-3 py-1 rounded text-emerald-900">{submissionResult.tracking_hash}</span>
            </p>
            <p className="text-xs font-body-md text-slate-700 font-bold">Redirecting to Public Ledger in 2 seconds...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-label-bold text-xs text-white block uppercase font-black text-glow-sm">Issue Headline / Short Title</label>
              <input 
                type="text"
                className="w-full bg-white/80 border-b-2 border-white/60 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-body-md outline-none transition-colors rounded-t-lg text-slate-900 font-black shadow-inner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hazardous Road Sinkhole near Central Market"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-bold text-xs text-white block uppercase font-black text-glow-sm">Category</label>
                <select 
                  className="w-full bg-white/80 border-b-2 border-white/60 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-body-md outline-none rounded-t-lg text-slate-900 font-black cursor-pointer shadow-inner"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Public Sanitation">Public Sanitation &amp; Sewage</option>
                  <option value="Public Safety">Public Safety &amp; Lighting</option>
                  <option value="Traffic & Transit">Traffic &amp; Transit</option>
                  <option value="Environmental Hazard">Environmental Hazard</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="font-label-bold text-xs text-white block uppercase font-black text-glow-sm">Severity / Urgency Tier</label>
                <select 
                  className="w-full bg-white/80 border-b-2 border-white/60 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-body-md outline-none rounded-t-lg text-slate-900 font-black cursor-pointer shadow-inner"
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                >
                  <option value="Low Priority">Low Priority (Routine Standard)</option>
                  <option value="Medium Priority">Medium Priority (Standard SLA)</option>
                  <option value="High Priority">High Priority (Urgent Intervention)</option>
                  <option value="Critical Emergency">Critical Emergency (Immediate Dispatch)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-label-bold text-xs text-white uppercase font-black text-glow-sm">Location Descriptor / Landmark</label>
                <button 
                  type="button" 
                  onClick={handleAutoDetectLocation}
                  className="text-xs font-label-bold text-secondary-container flex items-center gap-1 hover:underline font-black text-glow-sm"
                >
                  <span className="material-symbols-outlined text-sm">my_location</span>
                  AUTO-DETECT GPS COORDINATES
                </button>
              </div>

              <input 
                type="text"
                className="w-full bg-white/80 border-b-2 border-white/60 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-body-md outline-none rounded-t-lg text-slate-900 font-black shadow-inner"
                value={locationDescriptor}
                onChange={(e) => setLocationDescriptor(e.target.value)}
                placeholder="Metro District Corridor"
                required
              />

              {gpsStatus && (
                <span className="text-xs font-mono text-emerald-300 font-bold block text-glow-sm">{gpsStatus}</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-bold text-xs text-white block uppercase font-black text-glow-sm">Latitude</label>
                <input 
                  type="text"
                  className="w-full bg-white/80 border-b-2 border-white/60 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-mono text-sm outline-none rounded-t-lg text-slate-900 font-black shadow-inner"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-bold text-xs text-white block uppercase font-black text-glow-sm">Longitude</label>
                <input 
                  type="text"
                  className="w-full bg-white/80 border-b-2 border-white/60 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-mono text-sm outline-none rounded-t-lg text-slate-900 font-black shadow-inner"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-label-bold text-xs text-white block uppercase font-black text-glow-sm">Detailed Description of Incident</label>
              <textarea 
                rows="4"
                className="w-full bg-white/80 border-b-2 border-white/60 focus:border-secondary-container border-t-0 border-l-0 border-r-0 px-4 py-3 font-body-md outline-none rounded-t-lg text-slate-900 font-black shadow-inner"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide exact observations, hazards, or impact on public safety..."
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                disabled={submitting}
                className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-label-bold text-label-bold hover:shadow-[0_0_20px_rgba(252,222,103,0.8)] transition-all font-black shadow-lg"
              >
                {submitting ? 'TRANSMITTING REPORT...' : 'SUBMIT ANONYMOUS REPORT'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
