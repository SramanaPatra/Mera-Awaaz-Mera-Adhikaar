import React, { useState } from 'react';
import Navbar from './components/Navbar';
import WelfareEngine from './components/WelfareEngine';
import EmergencyTracker from './components/EmergencyTracker';
import IssueReporter from './components/IssueReporter';
import PublicTracker from './components/PublicTracker';
import AdminPortal from './components/AdminPortal';
import SpeechChatbot from './components/SpeechChatbot';

export default function App() {
  const [activeTab, setActiveTab] = useState('welfare');

  return (
    <div className="app-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ minHeight: '600px' }}>
        {activeTab === 'welfare' && <WelfareEngine />}
        {activeTab === 'emergency' && <EmergencyTracker />}
        {activeTab === 'reporter' && <IssueReporter onReportSubmitted={() => setActiveTab('tracker')} />}
        {activeTab === 'tracker' && <PublicTracker />}
        {activeTab === 'admin' && <AdminPortal />}
      </main>

      <footer style={{ marginTop: '60px', padding: '24px 0', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-text-muted)', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          CIVIC PULSE PLATFORM - OPEN ACCESS CIVIC WELFARE &amp; INCIDENT INFRASTRUCTURE (INR STANDARD)
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
          SECURE PROTOCOL v2.0.0
        </div>
      </footer>

      <SpeechChatbot />
    </div>
  );
}
