
import React from 'react';
import type { SeekerProfile, MarketItem } from '../../types';
import { ArtifactRarity, AgentName } from '../../types';
import { Button } from '../ui/Button';
import html2canvas from 'html2canvas';

const TCGCard: React.FC<{ 
    profile: SeekerProfile,
    id?: string 
}> = ({ profile, id }) => {
    return (
        <div id={id} className="relative rounded-xl border-[8px] border-amber-500 bg-slate-950 flex flex-col overflow-hidden shadow-2xl" style={{ aspectRatio: '2.5/3.5' }}>
            <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-30 mix-blend-overlay" />
            <div className="bg-black/40 backdrop-blur-sm p-4 flex justify-between items-center border-b border-white/10 z-10 relative overflow-visible">
                <span className="font-cinzel font-bold text-white text-xl md:text-2xl leading-[1.6] pb-2 drop-shadow-md block">
                  {profile?.name || "Anonymous Seeker"}
                </span>
                <div className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24] shrink-0"></div>
            </div>
            <div className="absolute inset-0 z-0 bg-black">
                {profile?.avatarImageUrl && <img src={profile.avatarImageUrl} alt={profile.name} className="w-full h-full object-cover" />}
                <div className="absolute inset-3 border border-white/20 rounded-lg opacity-40 pointer-events-none"></div>
            </div>
            <div className="flex-1 z-10"></div>
            <div className="bg-slate-900/40 backdrop-blur-md p-2 flex justify-between items-center border-t border-b border-white/10 z-10 relative">
                <span className="text-[10px] uppercase tracking-wider text-slate-100 font-bold">{profile?.race || 'Unknown'} {profile?.class || 'Seeker'}</span>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-900/60 border border-amber-500/30 text-amber-100">LEGENDARY</span>
            </div>
            <div className="h-[28%] bg-slate-950/80 backdrop-blur-md p-4 text-sm text-slate-100 font-cormorant italic leading-relaxed overflow-hidden relative z-10 border-t border-white/10">
                {profile?.bio || "Memory record stabilized."}
            </div>
        </div>
    );
};

const SeekerProfileDashboardPanel: React.FC<{ 
    profile: SeekerProfile, 
    onReset: () => void,
    onOpenCardBook: () => void,
    addEchoMessage: (s: string, t: string, c: string) => void 
}> = ({ profile, onReset, onOpenCardBook, addEchoMessage }) => {

    const handleDownload = () => {
        const el = document.getElementById('dashboard-seeker-card');
        if (el) {
            html2canvas(el, { scale: 2, backgroundColor: null, useCORS: true }).then(canvas => {
                const link = document.createElement('a');
                link.download = `Seeker_${profile.name}.png`;
                link.href = canvas.toDataURL();
                link.click();
                addEchoMessage(AgentName.System, "Identity Card saved.", "text-emerald-400");
            });
        }
    };

    const handleExportShard = () => {
        const dataStr = JSON.stringify(profile, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `Seeker_Shard_${profile.name}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        addEchoMessage(AgentName.System, "Character Shard saved.", "text-indigo-400");
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-xl shadow-2xl p-6 my-4">
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start">
                <div className="w-full max-w-[320px] flex-shrink-0 overflow-visible">
                    <TCGCard id="dashboard-seeker-card" profile={profile} />
                </div>
                <div className="flex-grow space-y-6">
                    <div>
                        <h3 className="text-2xl font-cinzel font-bold text-indigo-300 border-b border-indigo-500/30 pb-2 mb-4">Established Resonance</h3>
                        <p className="text-slate-300 font-cormorant italic text-lg leading-relaxed">{profile?.bio || 'Initializing existence...'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Seeker Level</div>
                            <div className="text-3xl font-mono text-emerald-400">{profile?.level || 1}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Aether Flux</div>
                            <div className="text-3xl font-mono text-amber-400">{profile?.flux || 0}</div>
                        </div>
                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Alignment</div>
                            <div className="text-sm font-mono text-sky-400 uppercase">{profile?.energyAlignment || 'Balanced'}</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button onClick={onOpenCardBook} className="bg-emerald-700 hover:bg-emerald-600">
                            <i className="ri-book-open-line mr-2"></i>Card Book
                        </Button>
                        <Button onClick={handleDownload} className="bg-indigo-700 hover:bg-indigo-600">
                            <i className="ri-download-cloud-line mr-2"></i>Save Card
                        </Button>
                        <Button onClick={handleExportShard} className="bg-purple-700 hover:bg-purple-600">
                            <i className="ri-share-forward-line mr-2"></i>Save Character
                        </Button>
                        <Button onClick={onReset} className="bg-slate-800 hover:bg-rose-900/50 border border-slate-700 text-slate-400">
                            <i className="ri-restart-line mr-2"></i>Sever Identity
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeekerProfileDashboardPanel;
