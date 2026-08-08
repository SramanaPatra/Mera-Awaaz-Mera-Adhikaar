import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import WelfareEngine from './components/WelfareEngine';
import EmergencyTracker from './components/EmergencyTracker';
import IssueReporter from './components/IssueReporter';
import PublicTracker from './components/PublicTracker';
import AdminPortal from './components/AdminPortal';
import SpeechChatbot from './components/SpeechChatbot';

export default function App() {
  const [activeTab, setActiveTab] = useState('welfare');
  const [citizenProfile, setCitizenProfile] = useState({
    income: '350000',
    location: 'Urban',
    occupation: 'Artisan',
    customOccupation: ''
  });

  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <>
      <video 
        ref={videoRef}
        autoPlay 
        loop 
        muted 
        playsInline 
        className="bg-video"
      >
        <source src="/assets/pink-fluid-bg.mp4" type="video/mp4" />
      </video>
      <div className="bg-video-overlay" />

      <div className="app-container">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ minHeight: '600px' }}>
          {activeTab === 'welfare' && <WelfareEngine citizenProfile={citizenProfile} setCitizenProfile={setCitizenProfile} />}
          {activeTab === 'emergency' && <EmergencyTracker />}
          {activeTab === 'reporter' && <IssueReporter onReportSubmitted={() => setActiveTab('tracker')} />}
          {activeTab === 'tracker' && <PublicTracker />}
          {activeTab === 'admin' && <AdminPortal />}
        </main>

        <footer style={{ marginTop: '60px', padding: '24px 0', borderTop: '1px solid rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-subtext)', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontWeight: '600' }}>
            MERA AWAAZ MERA ADHIKAR - OPEN ACCESS CIVIC WELFARE &amp; INCIDENT INFRASTRUCTURE (INR STANDARD)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', color: '#000000', fontWeight: '900', background: 'var(--yellow-primary)', padding: '2px 8px', borderRadius: '4px' }}>
            SECURE PROTOCOL v2.2.0
          </div>
        </footer>

        <SpeechChatbot citizenProfile={citizenProfile} />
      </div>
    </>
  );
}
