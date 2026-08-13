import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentWhisper } from '../../lib/whisper/WhisperRegistry'; // Corrected path
import { AudioPlayer } from './AudioPlayer'; 
import type { VoiceProfile } from '../../lib/whisper/WhisperRegistry'; // Corrected path
import type { VoiceEngine } from '../../lib/whisper/VoiceEngine'; // Corrected path

interface WhisperOverlayProps {
  activeWhispers: AgentWhisper[];
  onDismiss: (id: string) => void;
  voiceEngine: VoiceEngine; 
  voiceProfiles: VoiceProfile[]; 
}

export const WhisperOverlay: React.FC<WhisperOverlayProps> = ({ 
  activeWhispers, 
  onDismiss,
  voiceEngine, 
  voiceProfiles, 
}) => {
  return (
    <div className="fixed bottom-20 right-6 z-[1500] space-y-3 w-80 sm:w-96" aria-live="polite">
      <AnimatePresence>
        {activeWhispers.map((whisper, index) => (
          <motion.div
            key={whisper.id}
            layout 
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: index * 0.1 }}
            className="p-3.5 rounded-lg border-l-4 shadow-xl backdrop-blur-lg"
            style={{ 
              borderLeftColor: whisper.color,
              backgroundColor: `${whisper.color}20` 
            }}
            role="alert"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold flex items-center text-sm text-slate-100 font-['Cinzel']">
                  <span 
                    className="w-2.5 h-2.5 rounded-full mr-2.5 shrink-0" 
                    style={{ backgroundColor: whisper.color }}
                  />
                  {whisper.agent}
                </div>
                <p className="mt-1.5 text-slate-200 text-xs leading-relaxed font-['Cormorant']">{whisper.message}</p>
              </div>
              <button 
                onClick={() => onDismiss(whisper.id)}
                className="ml-2 text-slate-400 hover:text-slate-100 transition-colors p-1 -mr-1 -mt-1"
                aria-label={`Dismiss whisper from ${whisper.agent}`}
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            
            {/* Updated Button Logic for TTS */}
            <button 
              className="mt-2.5 text-xs flex items-center text-slate-400 hover:text-slate-200 transition-colors group"
              onClick={async () => {
                const profile = voiceProfiles.find(p => p.agent === whisper.agent) || 
                                voiceProfiles.find(p => p.agent === 'SystemDebug'); 

                if (profile) {
                  try {
                    await voiceEngine.speak(whisper.message, profile);
                  } catch (error) {
                    console.error(`Error speaking whisper for ${whisper.agent}:`, error);
                    
                    if (typeof window !== 'undefined' && window.speechSynthesis && (error as Error).message?.toLowerCase().includes("speech synthesis not supported") === false) {
                      console.warn('Falling back to basic browser TTS due to VoiceEngine error.');
                      const utterance = new SpeechSynthesisUtterance(whisper.message); 
                      window.speechSynthesis.speak(utterance);
                    } else if (typeof window === 'undefined' || !window.speechSynthesis) {
                      alert('Text-to-speech not supported by your browser.');
                    }
                  }
                } else {
                  console.warn(`No voice profile found for agent: ${whisper.agent}. Using basic TTS.`);
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(whisper.message);
                    window.speechSynthesis.speak(utterance);
                  } else {
                    alert('Text-to-speech not supported by your browser.');
                  }
                }
              }}
            >
              <i className="ri-volume-up-line mr-1.5 group-hover:text-slate-100"></i> Play Audio (TTS)
            </button>
            {/* Optional: AudioPlayer for pre-recorded files if whisper.audioUrl is present */}
            {/* {whisper.audioUrl && <AudioPlayer url={whisper.audioUrl} />} */}

          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};