import React from 'react';

export default function CssCharts({ metrics }) {
  if (!metrics) return null;

  const total = metrics.totalComplaints || 1;
  const pendingPct = Math.round((metrics.pendingCount / total) * 100);
  const resolvedPct = Math.round((metrics.resolvedCount / total) * 100);
  const escalatedPct = Math.round((metrics.escalatedCount / total) * 100);

  const uptakeData = metrics.schemeUptake || [];
  const maxApps = Math.max(...uptakeData.map(u => u.applications), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', color: '#FFFFFF' }}>
          GRIEVANCE STATUS BREAKDOWN (PURE CSS)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Real-time ratio of unresolved pending, official resolved, and SLA escalated cases.
        </p>

        <div className="css-bar-track" style={{ height: '24px', display: 'flex', borderRadius: '8px' }}>
          <div style={{ width: `${resolvedPct}%`, background: 'var(--neon-green)', height: '100%', boxShadow: 'var(--glow-green)' }} title={`Resolved: ${resolvedPct}%`}></div>
          <div style={{ width: `${pendingPct}%`, background: 'var(--neon-yellow)', height: '100%', boxShadow: 'var(--glow-yellow)' }} title={`Pending: ${pendingPct}%`}></div>
          <div style={{ width: `${escalatedPct}%`, background: 'var(--neon-red)', height: '100%', boxShadow: 'var(--glow-red)' }} title={`Escalated: ${escalatedPct}%`}></div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--neon-green)', borderRadius: '2px', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>RESOLVED ({metrics.resolvedCount} - {resolvedPct}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--neon-yellow)', borderRadius: '2px', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>PENDING ({metrics.pendingCount} - {pendingPct}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '12px', height: '12px', background: 'var(--neon-red)', borderRadius: '2px', display: 'inline-block' }}></span>
            <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>ESCALATED ({metrics.escalatedCount} - {escalatedPct}%)</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px', color: '#FFFFFF' }}>
          REGIONAL SCHEME UPTAKE TRENDS
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Comparative volume of citizen enrollments across active welfare programs.
        </p>

        <div className="css-bar-container">
          {uptakeData.map((item, idx) => {
            const barWidth = Math.round((item.applications / maxApps) * 100);
            return (
              <div key={idx} className="css-bar-row">
                <div className="css-bar-header">
                  <span style={{ color: '#FFFFFF' }}>{item.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>{item.applications} APPLICANTS</span>
                </div>
                <div className="css-bar-track">
                  <div 
                    className="css-bar-fill fill-cyan"
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
