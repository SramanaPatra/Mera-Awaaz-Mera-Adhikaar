import React, { useState } from 'react';

export default function IssueReporter({ onReportSubmitted }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Medium');
  const [locationName, setLocationName] = useState('Metro District Corridor');
  const [latitude, setLatitude] = useState(40.7128);
  const [longitude, setLongitude] = useState(-74.0060);
  const [geoStatus, setGeoStatus] = useState('DEFAULT METRO COORDINATES');
  const [submitting, setSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      setGeoStatus('ACQUIRING SATELLITE FIX...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setGeoStatus(`LAT: ${position.coords.latitude.toFixed(4)}, LON: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          setGeoStatus('LOCATION PERMISSION DENIED - USING METRO FALLBACK');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGeoStatus('GEOLOCATION API NOT SUPPORTED BY BROWSER');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          description,
          urgency,
          latitude,
          longitude,
          location_name: locationName
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedComplaint(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="glow-title">ANONYMOUS CIVIC ISSUE REPORTING</h1>
      <p className="subtitle">Encrypted public reporting mechanism with automated GPS coordinate binding and immediate ledger entry.</p>

      {submittedComplaint ? (
        <div className="card" style={{ border: '2px solid var(--neon-green)', boxShadow: 'var(--glow-green)', textAlign: 'center', padding: '40px' }}>
          <div className="badge badge-resolved" style={{ fontSize: '1rem', padding: '8px 18px', marginBottom: '16px' }}>
            REPORT LOGGED TO PUBLIC LEDGER
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#FFFFFF', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
            ID: {submittedComplaint.id}
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
            Coordinates: {submittedComplaint.latitude}, {submittedComplaint.longitude} | Urgency: {submittedComplaint.urgency}
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button 
              className="btn-primary"
              onClick={() => {
                setSubmittedComplaint(null);
                setTitle('');
                setDescription('');
              }}
            >
              SUBMIT ANOTHER REPORT
            </button>
            <button 
              className="btn-success"
              onClick={onReportSubmitted}
            >
              VIEW ON PUBLIC TRACKER
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card">
          <div className="form-group">
            <label className="form-label">Issue Headline / Short Title</label>
            <input 
              type="text" 
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous Road Sinkhole near Transit Hub"
              required
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Sanitation & Sewage">Sanitation &amp; Sewage</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Environmental Hazard">Environmental Hazard</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Severity / Urgency Tier</label>
              <select 
                className="form-select"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Severity</option>
                <option value="Critical">Critical Emergency</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location Descriptor / Landmark</label>
            <input 
              type="text" 
              className="form-input"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Corner of 5th Ave and Maple Street"
              required
            />
          </div>

          <div className="card" style={{ background: 'var(--bg-input)', marginBottom: '20px', border: '1px dashed var(--neon-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: '700', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  HTML5 GEOLOCATION DISCOVERY
                </div>
                <div style={{ fontSize: '0.9rem', color: '#FFFFFF', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                  {geoStatus}
                </div>
              </div>

              <button 
                type="button" 
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                onClick={handleGetLocation}
              >
                AUTO-DETECT GPS COORDINATES
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <span className="form-label">LATITUDE</span>
                <input type="text" className="form-input" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <span className="form-label">LONGITUDE</span>
                <input type="text" className="form-input" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description of Incident</label>
            <textarea 
              className="form-textarea"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exact observations, hazards, or impact on public safety..."
              required
            ></textarea>
          </div>

          <div style={{ textAlign: 'right', marginTop: '24px' }}>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={submitting}
            >
              {submitting ? 'TRANSMITTING REPORT...' : 'SUBMIT ANONYMOUS REPORT'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
