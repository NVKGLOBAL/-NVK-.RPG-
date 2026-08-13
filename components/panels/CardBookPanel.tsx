
import React, { useState } from 'react';
import type { SeekerProfile } from '../../types';
import { ArtifactRarity, AgentName } from '../../types';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const MiniCard: React.FC<{ 
    profile: SeekerProfile, 
    isActive: boolean, 
    isParty: boolean,
    onSetMain: () => void,
    onToggleParty: () => void
}> = ({ profile, isActive, isParty, onSetMain, onToggleParty }) => {
    return (
        <motion.div 
            layout
            className={`relative rounded-xl border-2 p-1 bg-slate-900 overflow-hidden shadow-xl transition-all duration-300 ${isActive ? 'border-amber-500 shadow-amber-500/20 ring-2 ring-amber-500/50' : 'border-slate-700'}`}
        >
            <div className="aspect-[2.5/3.5] bg-black rounded-lg overflow-hidden relative group">
                {profile.avatarImageUrl ? (
                    <img src={profile.avatarImageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={profile.name} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl"><i className="ri-user-6-fill"></i></div>
                )}
                
                {isActive && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest z-20">Prime</div>
                )}
                {isParty && !isActive && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest z-20">Party</div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <button onClick={onSetMain} className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded uppercase">Set Prime</button>
                    <button onClick={onToggleParty} className={`w-full py-1.5 ${isParty ? 'bg-rose-700 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'} text-white text-[10px] font-bold rounded uppercase`}>
                        {isParty ? 'Leave Party' : 'Join Party'}
                    </button>
                </div>
            </div>
            <div className="p-2">
                <div className="font-cinzel text-xs font-bold text-white truncate">{profile.name}</div>
                <div className="text-[9px] text-slate-500 font-mono uppercase truncate">{profile.race} {profile.class}</div>
                <div className="flex justify-between items-center mt-2 text-[10px]">
                    <span className="text-emerald-400 font-mono">LVL {profile.level}</span>
                    <span className="text-slate-500 font-mono">{profile.experience} XP</span>
                </div>
            </div>
        </motion.div>
    );
};

const CardBookPanel: React.FC<{
    profiles: SeekerProfile[],
    activeProfileId: string | null,
    partyIds: string[],
    onSetMain: (id: string) => void,
    onToggleParty: (id: string) => void,
    onManifestNew: () => void,
    addEchoMessage: (s: string, t: string, c: string) => void
}> = ({ profiles, activeProfileId, partyIds, onSetMain, onToggleParty, onManifestNew, addEchoMessage }) => {
    const [filter, setFilter] = useState<'all' | 'party'>('all');

    const visibleProfiles = filter === 'party' 
        ? profiles.filter(p => partyIds.includes(p.id) || p.id === activeProfileId)
        : profiles;

    return (
        <div className="w-full flex flex-col h-full bg-slate-950/40 p-6 gap-6">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-2xl text-indigo-400 shadow-lg">
                        <i className="ri-book-2-line"></i>
                    </div>
                    <div>
                        <h2 className="text-3xl font-cinzel font-bold text-white tracking-widest uppercase">The Card Book</h2>
                        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Digital Collection // {profiles.length} Seekers Bound</p>
                    </div>
                </div>

                <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setFilter('all')} 
                        className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        COLLECTION
                    </button>
                    <button 
                        onClick={() => setFilter('party')} 
                        className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${filter === 'party' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        ACTIVE PARTY ({partyIds.length + (activeProfileId ? 1 : 0)})
                    </button>
                </div>

                <Button onClick={onManifestNew} className="bg-emerald-600 hover:bg-emerald-500 py-3 px-8 font-cinzel font-bold text-sm tracking-widest rounded-xl shadow-xl">
                    MANIFEST NEW SHARD
                </Button>
            </header>

            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 min-h-0">
                <AnimatePresence mode="popLayout">
                    <motion.div 
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
                        layout
                    >
                        {visibleProfiles.map(profile => (
                            <MiniCard 
                                key={profile.id}
                                profile={profile}
                                isActive={profile.id === activeProfileId}
                                isParty={partyIds.includes(profile.id) || profile.id === activeProfileId}
                                onSetMain={() => onSetMain(profile.id)}
                                onToggleParty={() => onToggleParty(profile.id)}
                            />
                        ))}
                        {visibleProfiles.length === 0 && (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center text-slate-600 italic">
                                <i className="ri-ghost-line text-6xl mb-4 opacity-20"></i>
                                <p>No records found in this frequency.</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <footer className="bg-slate-900/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 text-xs font-mono text-slate-400">
                <i className="ri-information-line text-lg text-indigo-400"></i>
                <span>Your **Prime Seeker** determines the app's global state and primary resonance. Party members provide trait bonuses in the RPG Nexus.</span>
            </footer>
        </div>
    );
};

export default CardBookPanel;
