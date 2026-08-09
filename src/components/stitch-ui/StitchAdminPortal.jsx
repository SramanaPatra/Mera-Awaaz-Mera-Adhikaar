import React, { useState, useEffect } from 'react';

export default function StitchAdminPortal({ setActiveTab, user, onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, SLA: '98.4%' });
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/complaints', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adhikar_token')}` }
      });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
        const pending = data.data.filter(c => c.status === 'Pending').length;
        const resolved = data.data.filter(c => c.status === 'Resolved').length;
        setStats({ total: data.data.length, pending, resolved, SLA: '98.4%' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, newStatus, trackingRef) => {
    setUpdatingId(id);
    setActionNotice(null);
    try {
      const res = await fetch(`/api/admin/complaints/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adhikar_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Grievance #${trackingRef || id} updated to ${newStatus}`);
        setTimeout(() => setActionNotice(null), 3000);
        await fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredComplaints = complaints.filter(c => {
    if (selectedFilter === 'ALL') return true;
    return c.status === selectedFilter;
  });

  return (
    <div className="font-body-md text-on-surface antialiased p-6 max-w-container-max mx-auto space-y-gutter">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/30 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-secondary-container bg-primary p-1.5 rounded-full">admin_panel_settings</span>
            <h1 className="font-display-lg text-display-lg text-white font-black uppercase text-glow-md">AUTHORITY COMMAND PORTAL</h1>
          </div>
          <p className="font-body-lg text-slate-100 mt-1 font-bold text-glow-sm">
            Municipal Governance Operations &amp; Grievance SLA Dispatch Center &bull; Officer: {user ? user.name : 'Authorized Officer'} ({user ? user.department : 'General Affairs'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('welfare')}
            className="px-4 py-2 bg-white/30 text-white font-label-bold text-xs font-black rounded-full hover:bg-white/40 border border-white/40 text-glow-sm shadow"
          >
            Switch to Citizen View
          </button>
          <button 
            onClick={onLogout}
            className="px-4 py-2 bg-error text-white font-label-bold text-xs font-black rounded-full hover:bg-red-700 shadow"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {actionNotice && (
        <div className="p-4 bg-emerald-300 text-emerald-950 rounded-xl font-mono text-xs font-black text-center border-2 border-white shadow-lg animate-bounce">
          {actionNotice.toUpperCase()}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-1 shadow-md">
          <span className="font-label-bold text-xs text-white font-black uppercase text-glow-sm">TOTAL LOGGED COMPLAINTS</span>
          <p className="font-headline-lg text-3xl font-black text-white text-glow-md">{stats.total}</p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-1 shadow-md">
          <span className="font-label-bold text-xs text-white font-black uppercase text-glow-sm">PENDING ACTION</span>
          <p className="font-headline-lg text-3xl font-black text-amber-300 text-glow-md">{stats.pending}</p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-1 shadow-md">
          <span className="font-label-bold text-xs text-white font-black uppercase text-glow-sm">RESOLVED CASES</span>
          <p className="font-headline-lg text-3xl font-black text-emerald-300 text-glow-md">{stats.resolved}</p>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-1 shadow-md">
          <span className="font-label-bold text-xs text-white font-black uppercase text-glow-sm">DISPATCH SLA COMPLIANCE</span>
          <p className="font-headline-lg text-3xl font-black text-secondary-container text-glow-md">{stats.SLA}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-4 shadow-md">
          <h3 className="font-headline-md text-sm font-black text-white uppercase text-glow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container">bar_chart</span>
            Monthly Resolution Velocity (2026)
          </h3>
          <div className="h-40 flex items-end justify-between gap-3 pt-4 border-b border-white/30 px-2 font-mono text-xs text-white font-bold">
            {[
              { m: 'JAN', val: 65 },
              { m: 'FEB', val: 78 },
              { m: 'MAR', val: 92 },
              { m: 'APR', val: 85 },
              { m: 'MAY', val: 96 }
            ].map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div 
                  className="w-full bg-secondary-container rounded-t transition-all duration-700 shadow"
                  style={{ height: `${item.val}%` }}
                ></div>
                <span className="text-glow-sm font-black">{item.m}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/40 space-y-4 shadow-md">
          <h3 className="font-headline-md text-sm font-black text-white uppercase text-glow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary-container">map</span>
            Ward-wise Grievance Density Heatmap
          </h3>
          <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs text-slate-900 font-black">
            {[
              { ward: 'Ward 1 - Central', count: '14 Active', status: 'bg-emerald-300' },
              { ward: 'Ward 2 - Metro', count: '29 High', status: 'bg-amber-300' },
              { ward: 'Ward 3 - East', count: '08 Low', status: 'bg-emerald-300' },
              { ward: 'Ward 4 - North', count: '42 Urgent', status: 'bg-red-400 text-white' },
              { ward: 'Ward 5 - South', count: '19 Active', status: 'bg-amber-300' },
              { ward: 'Ward 6 - West', count: '04 Low', status: 'bg-emerald-300' }
            ].map((w, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${w.status} shadow flex flex-col justify-between`}>
                <span className="block text-[11px] font-black">{w.ward}</span>
                <span className="block text-[10px] font-bold opacity-90 mt-1">{w.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-8 accent-glow border border-white/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-white/30 pb-4">
          <h2 className="font-headline-md text-xl font-black text-white text-glow-sm">MUNICIPAL GRIEVANCE AUDIT QUEUE</h2>

          <div className="flex gap-2">
            {['ALL', 'Pending', 'Resolved', 'Escalated'].map(st => (
              <button 
                key={st}
                onClick={() => setSelectedFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-label-bold font-black transition-all ${selectedFilter === st ? 'bg-secondary-container text-on-secondary-container shadow' : 'bg-white/30 text-white hover:bg-white/50 border border-white/40 text-glow-sm'}`}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/30 text-xs font-label-bold text-white uppercase text-glow-sm font-black">
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Grievance Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 text-sm font-body-md">
              {filteredComplaints.map(c => {
                const trackingRef = c.tracking_hash || `CMP-${c.id}`;
                const isItemUpdating = updatingId === c.id || updatingId === c.tracking_hash;

                return (
                  <tr key={c.id} className="hover:bg-white/20 transition-colors">
                    <td className="py-4 px-4 font-mono font-black text-white text-glow-sm">#{trackingRef}</td>
                    <td className="py-4 px-4 font-black text-white text-glow-sm">{c.title}</td>
                    <td className="py-4 px-4 font-bold text-slate-100 text-glow-sm">{c.category}</td>
                    <td className="py-4 px-4 font-bold text-slate-100 text-glow-sm">{c.location_descriptor || c.location_name}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-mono font-black ${c.status === 'Resolved' ? 'bg-emerald-300 text-emerald-950' : c.status === 'Escalated' ? 'bg-error text-white' : 'bg-amber-300 text-slate-950'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          disabled={isItemUpdating}
                          onClick={() => handleUpdateStatus(c.id, 'Resolved', trackingRef)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-black hover:bg-emerald-700 shadow disabled:opacity-50"
                        >
                          {isItemUpdating ? 'Updating...' : 'Resolve'}
                        </button>
                        <button 
                          disabled={isItemUpdating}
                          onClick={() => handleUpdateStatus(c.id, 'Escalated', trackingRef)}
                          className="px-3 py-1 bg-error text-white rounded text-xs font-black hover:bg-red-700 shadow disabled:opacity-50"
                        >
                          {isItemUpdating ? 'Updating...' : 'Escalate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
