import React, { useState } from 'react';
import { useWebSpeech } from '../hooks/useWebSpeech';

export default function SpeechChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [forcedLanguage, setForcedLanguage] = useState('AUTO');
  const [lastDetectedLang, setLastDetectedLang] = useState('AUTO DETECTED');

  const {
    isListening,
    speechError,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearError
  } = useWebSpeech();

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Civic Pulse Assistant active. Speak or type your prompt to receive instant guidance on welfare schemes, emergency SOS, or civic issue reports.',
      langCode: 'en-IN',
      langName: 'English'
    }
  ]);

  const handleMicClick = () => {
    clearError();
    if (isListening) {
      stopListening();
    } else {
      const activeLang = forcedLanguage === 'AUTO' ? 'hi-IN' : forcedLanguage;
      startListening(activeLang, (recognizedText) => {
        setInputText(recognizedText);
      });
    }
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    clearError();
    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          forcedLanguage: forcedLanguage === 'AUTO' ? undefined : forcedLanguage
        })
      });

      const data = await res.json();
      if (data.success) {
        setLastDetectedLang(`${data.languageName.toUpperCase()} (${data.languageCode})`);
        const botMsg = {
          sender: 'bot',
          text: data.reply,
          langCode: data.languageCode,
          langName: data.languageName
        };
        setMessages(prev => [...prev, botMsg]);
        speak(data.reply, data.languageCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: isListening ? 'var(--neon-cyan)' : 'var(--neon-cyan)' }}
      >
        {isOpen ? 'CLOSE ASSISTANT' : 'CONVERSATIONAL AI ASSISTANT'}
      </button>

      {isOpen && (
        <div className="chatbot-panel" style={{ border: isListening ? '2px solid var(--neon-cyan)' : '2px solid var(--neon-cyan)' }}>
          <div className="chat-header">
            <div>
              <span style={{ fontWeight: '800', color: '#FFFFFF', fontSize: '0.85rem' }}>CIVIC PULSE CONVERSATIONAL AI</span>
              <span className="badge badge-cyan" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>
                {lastDetectedLang}
              </span>
            </div>

            <button 
              style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--color-text-muted)', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
              onClick={() => setShowOverride(!showOverride)}
            >
              {showOverride ? 'HIDE OVERRIDE' : 'MANUAL OVERRIDE'}
            </button>
          </div>

          {showOverride && (
            <div style={{ background: 'var(--bg-dark)', padding: '8px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>MANUAL LANGUAGE LOCK:</span>
              <select 
                className="form-select"
                style={{ width: 'auto', padding: '2px 8px', fontSize: '0.75rem' }}
                value={forcedLanguage}
                onChange={(e) => setForcedLanguage(e.target.value)}
              >
                <option value="AUTO">Automatic Detection</option>
                <option value="hi-IN">Hindi (हिन्दी)</option>
                <option value="bn-IN">Bengali (বাংলা)</option>
                <option value="ta-IN">Tamil (தமிழ்)</option>
                <option value="te-IN">Telugu (తెలుగు)</option>
                <option value="mr-IN">Marathi (मराठी)</option>
                <option value="en-IN">English</option>
              </select>
            </div>
          )}

          {speechError && (
            <div style={{ background: 'rgba(255, 0, 85, 0.15)', borderBottom: '1px solid var(--neon-red)', color: 'var(--neon-red)', padding: '8px 16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              {speechError}
            </div>
          )}

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div className={msg.sender === 'user' ? 'msg-user' : 'msg-bot'}>
                  {msg.text}
                </div>
                {msg.sender === 'bot' && (
                  <div style={{ marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      style={{ background: 'none', border: 'none', color: 'var(--neon-green)', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '700', fontFamily: 'var(--font-mono)' }}
                      onClick={() => speak(msg.text, msg.langCode || 'en-IN')}
                    >
                      READ ALOUD ({msg.langName || 'AUDIO'})
                    </button>
                    {isSpeaking && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--neon-green)', fontFamily: 'var(--font-mono)' }}>
                        PLAYING AUDIO...
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="msg-bot" style={{ color: 'var(--neon-yellow)', border: '1px solid var(--neon-yellow)', background: 'rgba(255, 184, 0, 0.1)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                PROCESSING AI TELEMETRY &amp; DETECTING SCRIPT...
              </div>
            )}
          </div>

          <div className="chat-controls" style={{ borderTop: isListening ? '1px solid var(--neon-cyan)' : '1px solid var(--border-color)' }}>
            <button 
              className={isListening ? 'btn-danger' : 'btn-primary'}
              style={{
                fontSize: '0.75rem',
                padding: '8px 12px',
                borderColor: isListening ? 'var(--neon-cyan)' : 'var(--neon-cyan)',
                boxShadow: isListening ? 'var(--glow-cyan)' : 'none'
              }}
              onClick={handleMicClick}
            >
              {isListening ? 'LISTENING (STOP)' : 'MIC STT INPUT'}
            </button>

            <input 
              type="text" 
              className="form-input"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem', borderColor: isListening ? 'var(--neon-cyan)' : 'var(--border-color)' }}
              placeholder={isListening ? 'Speak into microphone...' : 'Type message in any language...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />

            <button 
              className="btn-success"
              style={{ fontSize: '0.75rem', padding: '8px 12px' }}
              onClick={() => handleSend()}
              disabled={isProcessing}
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </>
  );
}
