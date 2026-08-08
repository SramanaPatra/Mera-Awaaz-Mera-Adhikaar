import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = useCallback((languageCode = 'en-IN', onResultCallback) => {
    setSpeechError(null);
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser environment.');
      return;
    }

    try {
      recognitionRef.current.lang = languageCode;

      recognitionRef.current.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (onResultCallback) onResultCallback(text);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        let msg = 'Microphone speech recognition error.';
        if (event.error === 'not-allowed') {
          msg = 'Microphone access permission was denied by user.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please speak into the microphone.';
        }
        setSpeechError(msg);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      setIsListening(true);
      recognitionRef.current.start();
    } catch (err) {
      setSpeechError('Could not initialize microphone input.');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const speak = useCallback((text, languageCode = 'en-IN') => {
    if (!('speechSynthesis' in window)) {
      setSpeechError('Text-to-speech voice synthesis is not supported.');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode;

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
    isListening,
    speechError,
    isSpeaking,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    clearError: () => setSpeechError(null)
  };
}
