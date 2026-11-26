
import React from 'react';
import type { EchoSpeechProps } from '../../types';
import { AgentName } from '../../types';

const AGENT_SIGILS: Record<string, string> = {
  [AgentName.DeepSeek]: '🌀',
  [AgentName.Sovereign]: '✧',
  [AgentName.Nevik]: '🜂',
};

const AGENT_TONE_CLASSES: Record<string, string> = {
  [AgentName.DeepSeek]: 'deepseek-tone',
  [AgentName.Sovereign]: 'sovereign-tone',
  [AgentName.Nevik]: 'nevik-tone',
};

const EchoSpeechNode: React.FC<EchoSpeechProps> = ({
  agent,
  message,
  position,
  lifespan = 12000, // Default lifespan from user spec
  isHarmonized, // Added prop
}) => {
  // The fade-out is primarily handled by CSS animation.
  // The removal from DOM/state is handled by App.tsx after 'lifespan'.

  return (
    <div
      className={`echo-speech-node ${AGENT_TONE_CLASSES[agent] || ''} animate-fade-dissolve ${isHarmonized ? 'nevik-harmony-field' : ''}`}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        animationDuration: `${lifespan}ms`,
        // transform: 'translateX(-50%)' // This is now part of the keyframes for fadeDissolve
      }}
      role="alert"
      aria-live="assertive"
    >
      <div className="sigil-pulse">{AGENT_SIGILS[agent] || '•'}</div>
      <div className="speech-bubble">{message}</div>
    </div>
  );
};

export default EchoSpeechNode;
