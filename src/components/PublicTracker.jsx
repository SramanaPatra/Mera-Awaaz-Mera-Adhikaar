import React, { useState, useEffect } from 'react';

export default function PublicTracker() {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter !== 'All') queryParams.append('status', statusFilter);
      if (categoryFilter !== 'All') queryParams.append('category', categoryFilter);

      const res = await fetch(`/api/complaints?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const res = await fetch(`/api/complaints/${id}/upvote`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, upvotes: data.upvotes } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return <span className="badge badge-resolved"><span className="status-dot"></span>RESOLVED</span>;
      case 'Escalated':
        return <span className="badge badge-escalated"><span className="status-dot"></span>ESCALATED</span>;
      default:
        return <span className="badge badge-pending"><span className="status-dot"></span>PENDING</span>;
    }
  };

  const calculateHoursAgo = (timestamp) => {
    const hours = Math.round((new Date().getTime() - new Date(timestamp).getTime()) / (1000 * 60 * 60));
    if (hours < 1) return 'JUST NOW';
    return `${hours} HOURS AGO`;
  };

  return (
    <div>
      <h1 className="glow-title">PUBLIC GRIEVANCE LEDGER &amp; TRACKER</h1>
      <p className="subtitle">Real-time transparent audit tracker monitoring civic complaint resolutions and authority SLAs.</p>

      <div className="card" style={{ marginBottom: '24px', padding: '16px 24px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="form-label">STATUS FILTER:</span>
            {['All', 'Pending', 'Resolved', 'Escalated'].map((st) => (
              <button 
                key={st}
                className={`tab-btn ${statusFilter === st ? 'active' : ''}`}
                onClick={() => setStatusFilter(st)}
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
            <span className="form-label">CATEGORY:</span>
            <select 
              className="form-select" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '6px 12px', width: 'auto', fontSize: '0.85rem' }}
            >
              <option value="All">ALL CATEGORIES</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Sanitation & Sewage">Sanitation &amp; Sewage</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Water Supply">Water Supply</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--neon-cyan)' }}>
          FETCHING PUBLIC LEDGER...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {complaints.map((item, idx) => (
            <div 
              key={item.id} 
              className="card card-interactive stagger-item"
              style={{ animationDelay: `${idx * 0.08}s` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: '#FFFFFF', fontSize: '1.1rem' }}>
                    {item.id}
                  </span>
                  {getStatusBadge(item.status)}
                  <span className="badge badge-cyan">{item.category}</span>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  LOGGED: {calculateHoursAgo(item.reported_at)}
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '8px', color: '#FFFFFF' }}>
                {item.title}
              </h3>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '16px' }}>
                {item.description}
              </p>

              {item.resolution_note && (
                <div style={{ background: 'rgba(0, 255, 102, 0.05)', borderLeft: '4px solid var(--neon-green)', padding: '12px', marginBottom: '16px', borderRadius: '0 6px 6px 0' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neon-green)', textTransform: 'uppercase', display: 'block' }}>
                    RESOLUTION AUDIT NOTE
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#FFFFFF' }}>
                    {item.resolution_note}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                  LOCATION: {item.location_name} ({item.latitude}, {item.longitude})
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    className="btn-primary"
                    style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                    onClick={() => handleUpvote(item.id)}
                  >
                    UPVOTE COMPLAINT ({item.upvotes})
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
