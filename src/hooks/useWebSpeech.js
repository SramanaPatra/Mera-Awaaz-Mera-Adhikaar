import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSpeech() {
  const [speechState, setSpeechState] = useState('idle');
  const [speechError, setSpeechError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    }
  }, []);

  const fallbackServerTranscription = async (localeCode, callback) => {
    try {
      setSpeechState('processing');
      const res = await fetch('/api/speech/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ localeCode })
      });
      const data = await res.json();
      if (data.success && data.text) {
        if (callback) callback(data.text);
        setSpeechState('success');
        setTimeout(() => setSpeechState('idle'), 1500);
      } else {
        setSpeechState('idle');
      }
    } catch (err) {
      setSpeechState('idle');
    }
  };

  const startListeningWithMediaRecorder = async (localeCode, onResultCallback) => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setSpeechError('Microphone audio access is not supported in this browser.');
      setSpeechState('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        fallbackServerTranscription(localeCode, onResultCallback);
      };

      setSpeechState('listening');
      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 4000);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setSpeechError('Microphone access permission was denied by user.');
        setSpeechState('error');
      } else {
        fallbackServerTranscription(localeCode, onResultCallback);
      }
    }
  };

  const startListening = useCallback((localeCode = 'en-IN', onResultCallback) => {
    setSpeechError(null);
    setSpeechState('idle');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = localeCode;

        recognitionRef.current.onstart = () => {
          setSpeechState('listening');
        };

        recognitionRef.current.onresult = (event) => {
          setSpeechState('processing');
          const transcriptText = event.results[0][0].transcript;
          if (onResultCallback) onResultCallback(transcriptText);
          setSpeechState('success');
          setTimeout(() => setSpeechState('idle'), 1500);
        };

        recognitionRef.current.onerror = (event) => {
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone access permission was denied by user.');
            setSpeechState('error');
          } else {
            startListeningWithMediaRecorder(localeCode, onResultCallback);
          }
        };

        recognitionRef.current.onend = () => {
          setSpeechState(prev => prev === 'listening' ? 'idle' : prev);
        };

        recognitionRef.current.start();
        return;
      } catch (e) {}
    }

    startListeningWithMediaRecorder(localeCode, onResultCallback);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setSpeechState('idle');
  }, []);

  const speak = useCallback((text, localeCode = 'en-IN') => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeCode;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speechState,
    speechError,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearError: () => {
      setSpeechError(null);
      setSpeechState('idle');
    }
  };
}
