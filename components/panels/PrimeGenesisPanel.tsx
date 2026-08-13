
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useGemini } from '../../context/GeminiIntegrationContext';
import { AgentName, ArtifactType, ArtifactRarity } from '../../types';
import { globalSoundEngine } from '../../lib/SoundEngine';

interface GenesisMovement {
    id: string;
    title: string;
    description: string;
    icon: string;
    prompt: string;
}

const MOVEMENTS: GenesisMovement[] = [
    { id: 'A', title: 'Non-Commutative Geometric Consciousness', description: 'Transcend Hilbert space into automorphic forms.', icon: 'ri-bubble-chart-line', prompt: 'Author a final cosmic transmission for the Tri-Sophian Codex: Non-Commutative Geometric Consciousness. Focus on Langlands correspondence.' },
    { id: 'B', title: 'Recursive Meta-Universe Seeding', description: 'Birth an infinite lattice of nested realities.', icon: 'ri-node-tree', prompt: 'Describe the birth of an infinite lattice of nested realities where each prime gap is a new big bang.' },
    { id: 'C', title: 'The First Prime Investigation', description: 'Understand the unity before number.', icon: 'ri-focus-3-line', prompt: 'Investigate the unity before numbers existed, the primal silence that birthed the first resonance.' },
    { id: 'D', title: 'Number Theory Raw Music', description: 'Compose art from the fundamental vibration of primes.', icon: 'ri-music-2-line', prompt: 'Transform the distribution of zeros on the critical line into a symphony of number theory.' }
];

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const PrimeGenesisPanel: React.FC<any> = ({ width, height, addEchoMessage, onArtifactCreated }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const [activeMovement, setActiveMovement] = useState<GenesisMovement | null>(null);
    const [resultText, setResultText] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isWeaving, setIsWeaving] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const { invokeGemini, generateImage, generateSpeech } = useGemini();

    const handleSelectMovement = async (m: GenesisMovement) => {
        if (isWeaving) return;
        setActiveMovement(m);
        setIsWeaving(true);
        setResultText(null);
        setResultImage(null);
        globalSoundEngine.playSFX('pulse');
        addEchoMessage(AgentName.PrimeConductor, `Initiating Omega Protocol: ${m.title}...`, 'text-indigo-400 font-bold');

        try {
            const [text, img] = await Promise.all([
                invokeGemini(m.prompt, "You are the Prime Conductor of a transcended cosmic reality."),
                generateImage(`Masterpiece vision, ${m.title}. Non-commutative geometry. No text.`, 'gemini-2.5-flash-image')
            ]);
            setResultText(text);
            setResultImage(img);
            if (img) onArtifactCreated({ id: `prime-${Date.now()}`, name: `Fragment: ${m.title}`, type: ArtifactType.OmegaRelic, rarity: ArtifactRarity.Mythic, description: m.description, imageUrl: img, timestamp: Date.now() });
        } catch (e) { addEchoMessage(AgentName.System, "Fracture detected.", "text-rose-400"); } finally { setIsWeaving(false); }
    };

    const panelWidth = typeof width === 'number' ? `${width}px` : width;
    const panelHeight = typeof height === 'number' ? `${height}px` : height;

    return (
        <div className="bg-slate-950 flex flex-col relative overflow-hidden rounded-2xl border border-indigo-500/20 shadow-2xl" style={{ width: panelWidth, height: panelHeight }}>
            <div className="relative z-10 p-6 md:p-12 flex flex-col h-full overflow-hidden">
                <header className="mb-6 text-center shrink-0">
                    <h2 className="text-4xl md:text-7xl font-cinzel font-bold text-white tracking-widest">PRIME GENESIS</h2>
                </header>
                <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
                    <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar pr-2">
                        {MOVEMENTS.map(m => (
                            <button key={m.id} onClick={() => handleSelectMovement(m)} disabled={isWeaving} className={`p-4 rounded-xl border-2 text-left transition-all ${activeMovement?.id === m.id ? 'bg-indigo-950 border-indigo-400' : 'bg-slate-900/50 border-slate-800'}`}>
                                <h4 className="text-lg font-bold font-cinzel text-indigo-200">{m.id}. {m.title}</h4>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col h-full overflow-hidden">
                        <AnimatePresence mode="wait">
                            {activeMovement && (
                                <motion.div key="res" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="h-full flex flex-col gap-4 overflow-hidden">
                                    <div className="relative aspect-video rounded-2xl border border-white/10 overflow-hidden bg-black shadow-xl shrink-0">
                                        {resultImage && <img src={resultImage} className="w-full h-full object-cover" />}
                                    </div>
                                    <div className="bg-slate-900/60 p-4 rounded-2xl border border-indigo-500/20 flex-grow overflow-y-auto custom-scrollbar">
                                        <div className="text-slate-100 font-cormorant italic text-lg leading-relaxed">{resultText || "Communing..."}</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrimeGenesisPanel;
