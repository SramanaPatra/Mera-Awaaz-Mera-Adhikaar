import React, { useState, useEffect } from 'react';

export default function PublicTracker() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
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
        setComplaints(prev => prev.map(c => c.id === id ? { ...c, upvotes: data.data.upvotes } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && c.category !== filterCategory) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    if (status === 'Escalated') return 'bg-error text-white border border-red-300 font-black';
    if (status === 'Resolved') return 'bg-emerald-300 text-emerald-950 font-black';
    return 'bg-secondary-container text-on-secondary-container font-black';
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="glass-panel rounded-xl p-8 accent-glow relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-white/30 pb-4 gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-md font-black text-white text-glow-md">
              PUBLIC GRIEVANCE LEDGER &amp; TRACKER
            </h2>
            <p className="font-body-md text-slate-100 text-sm mt-1 font-bold text-glow-sm">
              Real-time transparent audit tracker monitoring civic complaint resolutions and authority SLAs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-label-bold text-xs text-white font-black mr-2 text-glow-sm">STATUS FILTER:</span>
            {['ALL', 'Pending', 'Resolved', 'Escalated'].map(st => (
              <button 
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full text-xs font-label-bold font-black transition-all ${filterStatus === st ? 'bg-secondary-container text-on-secondary-container shadow-md' : 'bg-white/30 text-white hover:bg-white/50 border border-white/40 text-glow-sm'}`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <div className="flex items-center gap-2">
            <span className="font-label-bold text-xs text-white font-black text-glow-sm">CATEGORY:</span>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white/80 border border-white/60 rounded-lg px-3 py-1.5 text-xs font-black text-slate-900 outline-none shadow-sm cursor-pointer"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Public Safety">Public Safety</option>
              <option value="Sanitation & Sewage">Sanitation &amp; Sewage</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel p-6 rounded-xl h-28 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map(c => (
              <div key={c.id} className="glass-panel p-6 rounded-xl border border-white/40 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center shadow-md">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-white text-glow-sm">#{c.tracking_hash || `CMP-${c.id}`}</span>
                    <span className={`px-3 py-0.5 rounded-full text-xs font-label-bold ${getStatusBadge(c.status)}`}>
                      {c.status}
                    </span>
                    <span className="text-xs font-black text-slate-100 text-glow-sm">{c.category}</span>
                  </div>

                  <h3 className="font-headline-md text-lg font-black text-white text-glow-sm">{c.title}</h3>
                  <p className="font-body-md text-sm text-slate-100 font-bold text-glow-sm">{c.description}</p>

                  <div className="font-mono text-xs text-slate-200 font-bold text-glow-sm">
                    LOCATION: {c.location_descriptor} ({c.latitude}, {c.longitude})
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button 
                    onClick={() => handleUpvote(c.id)}
                    className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-xs font-label-bold font-black flex items-center gap-1 hover:shadow-lg transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">thumb_up</span>
                    UPVOTE COMPLAINT ({c.upvotes || 0})
                  </button>
                  <span className="text-[10px] font-mono text-slate-200 font-bold text-glow-sm">LOGGED: 18 HOURS AGO</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
