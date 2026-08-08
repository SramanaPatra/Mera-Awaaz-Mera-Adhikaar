import React, { useState, useEffect } from 'react';
import CssCharts from './CssCharts';

export default function AdminPortal() {
  const [metrics, setMetrics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [emergencySignals, setEmergencySignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolutionInput, setResolutionInput] = useState({});
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, eRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/complaints'),
        fetch('/api/emergency/active-signals')
      ]);

      const mData = await mRes.json();
      const cData = await cRes.json();
      const eData = await eRes.json();

      if (mData.success) setMetrics(mData.data);
      if (cData.success) setComplaints(cData.data);
      if (eData.success) setEmergencySignals(eData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const note = resolutionInput[id] || '';
    try {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          resolution_note: note,
          officer_id: 'DISTRICT_OFFICER_LEAD'
        })
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerEscalation = async () => {
    try {
      const res = await fetch('/api/admin/trigger-escalation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholdHours: 48 })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neon-cyan)' }}>
        INITIALIZING AUTHORITY CONTROL CONSOLE...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div>
          <h1 className="glow-title">MUNICIPAL AUTHORITY PORTAL</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>Command console for 48-hour SLA governance, emergency beacons, and welfare metrics.</p>
        </div>

        <button 
          className="btn-danger"
          onClick={handleTriggerEscalation}
          style={{ fontSize: '0.85rem' }}
        >
          TRIGGER 48-HR SLA ESCALATION RUN NOW
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: '32px' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--neon-cyan)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>TOTAL GRIEVANCES</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
            {metrics?.totalComplaints || 0}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--neon-yellow)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>PENDING / INVESTIGATION</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--neon-yellow)', fontFamily: 'var(--font-mono)' }}>
            {(metrics?.pendingCount || 0) + (metrics?.underInvestigationCount || 0)}
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--neon-red)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>ACTIVE LIVE GPS SOS BEACONS</div>
          <div style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--neon-red)', fontFamily: 'var(--font-mono)' }}>
            {emergencySignals.length}
          </div>
        </div>
      </div>

      <div className="nav-tabs" style={{ marginBottom: '24px', display: 'inline-flex' }}>
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          ANALYTICS &amp; VISUALIZATIONS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          ACTION QUEUE ({complaints.filter(c => c.status !== 'Resolved').length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
        >
          EMERGENCY BEACONS ({emergencySignals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          AUDIT LOGS
        </button>
      </div>

      {activeTab === 'overview' && (
        <CssCharts metrics={metrics} />
      )}

      {activeTab === 'management' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map((item) => (
            <div key={item.id} className="card" style={{ borderLeft: item.status === 'Escalated' ? '4px solid var(--neon-red)' : '4px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#FFFFFF' }}>{item.id}</span>
                <span className={`badge ${item.status === 'Resolved' ? 'badge-resolved' : item.status === 'Escalated' ? 'badge-escalated' : 'badge-pending'}`}>
                  {item.status.toUpperCase()}
                </span>
              </div>

              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>{item.title}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{item.description}</p>

              {item.status !== 'Resolved' && (
                <div style={{ marginTop: '12px', background: 'var(--bg-input)', padding: '12px', borderRadius: '6px' }}>
                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label">OFFICIAL RESOLUTION NOTE / DISPATCH LOG</label>
                    <input 
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.85rem' }}
                      placeholder="Specify corrective action taken..."
                      value={resolutionInput[item.id] || ''}
                      onChange={(e) => setResolutionInput({ ...resolutionInput, [item.id]: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {item.status !== 'Escalated' && (
                      <button 
                        className="btn-danger"
                        style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                        onClick={() => handleStatusUpdate(item.id, 'Escalated')}
                      >
                        MANUALLY ESCALATE
                      </button>
                    )}
                    <button 
                      className="btn-success"
                      style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                      onClick={() => handleStatusUpdate(item.id, 'Resolved')}
                    >
                      MARK RESOLVED &amp; DISPATCH
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'emergency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {emergencySignals.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '32px' }}>
              NO ACTIVE EMERGENCY LOCATION BEACONS CURRENTLY BROADCASTING
            </div>
          ) : (
            emergencySignals.map((sig) => (
              <div key={sig.id} className="card" style={{ borderLeft: '4px solid var(--neon-red)', boxShadow: 'var(--glow-red)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: 'var(--neon-red)' }}>{sig.id}</span>
                  <span className="badge badge-escalated">LIVE EMERGENCY SIGNAL</span>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#FFFFFF', marginBottom: '8px' }}>
                  SESSION: {sig.user_session} | LAT: {sig.latitude}, LON: {sig.longitude} (ACCURACY: {sig.accuracy}M)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  UPDATED: {new Date(sig.updated_at).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', color: '#FFFFFF' }}>
            AUTOMATED &amp; MANUAL ESCALATION AUDIT TRAIL
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(metrics?.recentLogs || []).map((log, idx) => (
              <div key={idx} style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: '700' }}>[{log.complaint_id}]</span> STATUS: {log.previous_status} -&gt; <span style={{ color: 'var(--neon-green)' }}>{log.new_status}</span>
                </div>
                <div style={{ color: 'var(--color-text-muted)' }}>
                  BY: {log.action_by} | {new Date(log.action_timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
