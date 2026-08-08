import React from 'react';

export default function Navbar({ activeTab, setActiveTab }) {
  return (
    <header className="nav-header">
      <div className="nav-brand">
        <span>CIVIC PULSE</span>
        <span className="brand-tag">v2.0 INR</span>
      </div>
      
      <nav className="nav-tabs">
        <button 
          className={`tab-btn ${activeTab === 'welfare' ? 'active' : ''}`}
          onClick={() => setActiveTab('welfare')}
        >
          Welfare Engine
        </button>
        <button 
          className={`tab-btn ${activeTab === 'emergency' ? 'active' : ''}`}
          onClick={() => setActiveTab('emergency')}
          style={{ color: activeTab === 'emergency' ? '#000000' : 'var(--neon-red)' }}
        >
          Emergency SOS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reporter' ? 'active' : ''}`}
          onClick={() => setActiveTab('reporter')}
        >
          Report Issue
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          Public Tracker
        </button>
        <button 
          className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          Admin Portal
        </button>
      </nav>
    </header>
  );
}
