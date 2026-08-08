import React, { useState, useEffect, useRef } from 'react';
import { useWebSpeech } from '../hooks/useWebSpeech';

export default function SpeechChatbot({ citizenProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedLocale, setSelectedLocale] = useState('AUTO');
  const [activeLocaleTag, setActiveLocaleTag] = useState('AUTO DETECT');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);

  const {
    speechState,
    speechError,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    clearError
  } = useWebSpeech();

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Mera Awaaz Mera Adhikar Conversational AI active. I am connected to your citizen profile and welfare database. Ask any questions about schemes, INR grants, emergency SOS, or civic complaints.',
      localeCode: 'en-IN',
      langName: 'English'
    }
  ]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleMicClick = () => {
    clearError();
    if (speechState === 'listening') {
      stopListening();
    } else {
      const targetLocale = selectedLocale === 'AUTO' ? 'en-IN' : selectedLocale;
      startListening(targetLocale, (recognizedText) => {
        setInputText(recognizedText);
      });
    }
  };

  const executeSendPipeline = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    clearError();
    setLastFailedMessage(null);

    const userMsg = { sender: 'user', text: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputText('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          conversationHistory: updatedHistory,
          citizenProfile: citizenProfile || { income: 350000, location: 'Urban', occupation: 'Artisan' },
          localeCode: selectedLocale === 'AUTO' ? undefined : selectedLocale
        })
      });

      const data = await res.json();
      if (data.success) {
        setActiveLocaleTag(`${data.languageName.toUpperCase()} (${data.localeCode})`);
        const botMsg = {
          sender: 'bot',
          text: data.reply,
          localeCode: data.localeCode,
          langName: data.languageName
        };
        setMessages(prev => [...prev, botMsg]);
        speak(data.reply, data.localeCode);
      } else {
        throw new Error(data.message || 'API processing error');
      }
    } catch (err) {
      setLastFailedMessage(query);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button 
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'CLOSE ASSISTANT' : 'MERA AWAAZ MERA ADHIKAR AI'}
      </button>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chat-header">
            <div>
              <span style={{ fontWeight: '900', color: '#111111', fontSize: '0.8rem' }}>MERA AWAAZ MERA ADHIKAR AI</span>
              <span className="badge badge-yellow" style={{ marginLeft: '6px', fontSize: '0.6rem' }}>
                {activeLocaleTag}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: '#4a4a4a', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>LANG:</span>
              <select 
                className="form-select"
                style={{ width: 'auto', padding: '2px 6px', fontSize: '0.75rem' }}
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
              >
                <option value="AUTO">Auto Detect</option>
                <option value="en-IN">English (en-IN)</option>
                <option value="bn-IN">Bengali (bn-IN)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
                <option value="ta-IN">Tamil (ta-IN)</option>
                <option value="te-IN">Telugu (te-IN)</option>
                <option value="mr-IN">Marathi (mr-IN)</option>
              </select>
            </div>
          </div>

          {speechError && (
            <div style={{ background: 'rgba(255, 0, 85, 0.15)', borderBottom: '1px solid #ff0055', color: '#cc0033', padding: '8px 16px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
              MICROPHONE ALERT: {speechError}
            </div>
          )}

          {lastFailedMessage && (
            <div style={{ background: 'rgba(255, 0, 85, 0.15)', padding: '8px 16px', borderBottom: '1px solid #ff0055', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#cc0033', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>COMMUNICATION TIMEOUT</span>
              <button 
                className="btn-danger"
                style={{ fontSize: '0.7rem', padding: '4px 8px' }}
                onClick={() => executeSendPipeline(lastFailedMessage)}
              >
                RETRY MESSAGE
              </button>
            </div>
          )}

          {speechState === 'listening' && (
            <div style={{ background: 'rgba(255, 225, 105, 0.5)', borderBottom: '1px solid #ffb703', color: '#000000', padding: '6px 16px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>
              LISTENING IN {selectedLocale === 'AUTO' ? 'EN-IN / AUTO' : selectedLocale.toUpperCase()}... SPEAK NOW
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
                      style={{ background: 'none', border: 'none', color: '#006633', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '800', fontFamily: 'var(--font-mono)' }}
                      onClick={() => speak(msg.text, msg.localeCode || 'en-IN')}
                    >
                      READ ALOUD ({msg.langName || 'NATIVE VOICE'})
                    </button>
                    {isSpeaking && (
                      <span style={{ fontSize: '0.65rem', color: '#006633', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                        PLAYING AUDIO...
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {(isProcessing || speechState === 'processing') && (
              <div className="msg-bot" style={{ color: '#000000', border: '1px solid #ffb703', background: 'rgba(255, 235, 133, 0.6)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: '700' }}>
                ANALYZING CITIZEN PROFILE &amp; SCHEME DATABASE...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-controls">
            <button 
              className={speechState === 'listening' ? 'btn-danger' : 'btn-primary'}
              style={{
                fontSize: '0.75rem',
                padding: '8px 12px'
              }}
              onClick={handleMicClick}
            >
              {speechState === 'listening' ? 'STOP MIC' : 'MIC STT INPUT'}
            </button>

            <input 
              type="text" 
              className="form-input"
              style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
              placeholder={speechState === 'listening' ? 'Listening into microphone...' : 'Type or record prompt in native script...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && executeSendPipeline()}
            />

            <button 
              className="btn-success"
              style={{ fontSize: '0.75rem', padding: '8px 12px' }}
              onClick={() => executeSendPipeline()}
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
