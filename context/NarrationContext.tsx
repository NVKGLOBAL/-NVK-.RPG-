import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { globalPCMPlayer } from '../lib/narration/PCMPlayer';

interface NarrationContextType {
  isNarrationEnabled: boolean;
  toggleNarration: () => void;
  speak: (text: string, voiceName?: string) => Promise<void>;
}

const NarrationContext = createContext<NarrationContextType | undefined>(undefined);

export const NarrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(true);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const speak = useCallback(async (text: string, voiceName: string = 'Kore') => {
    if (!isNarrationEnabled || !text || !text.trim()) return;

    // Clean markdown/symbols for clean pronunciation
    const cleanText = text
      .replace(/[#*`_~[\]()<>]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Add to serial queue to prevent overlapping speech
    queueRef.current = queueRef.current.then(async () => {
      // Browser Web Speech API (local, no cloud key, no external AI service)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        return new Promise<void>((resolve) => {
          try {
            window.speechSynthesis.cancel(); // Clear any hung utterances
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.rate = 1.0;
            utterance.pitch = 0.98; // Slightly deeper, mystical cadence
            
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => 
              v.lang.startsWith('en') && 
              (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
            );
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
          } catch (speechErr) {
            resolve();
          }
        });
      }
    });

    return queueRef.current;
  }, [isNarrationEnabled]);

  const toggleNarration = () => {
    const newState = !isNarrationEnabled;
    setIsNarrationEnabled(newState);
    if (!newState) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      globalPCMPlayer.stopAll();
    } else {
      speak("Narration protocol active.");
    }
  };

  return (
    <NarrationContext.Provider value={{ isNarrationEnabled, toggleNarration, speak }}>
      {children}
    </NarrationContext.Provider>
  );
};

export const useNarration = () => {
  const context = useContext(NarrationContext);
  if (!context) throw new Error("useNarration must be used within NarrationProvider");
  return context;
};
