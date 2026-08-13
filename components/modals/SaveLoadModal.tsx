import React, { useEffect, useState } from 'react';
import type { GameSaveSummary } from '../../types';
import { Button } from '../ui/Button';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotId: string) => Promise<void>;
  onLoad: (slotId: string) => Promise<void>;
  fetchSlots: () => Promise<GameSaveSummary[]>;
}

const SLOTS = ['slot_1', 'slot_2', 'slot_3'];

const SaveLoadModal: React.FC<SaveLoadModalProps> = ({ isOpen, onClose, onSave, onLoad, fetchSlots }) => {
  const [saves, setSaves] = useState<Record<string, GameSaveSummary>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [autoSave, setAutoSave] = useState<GameSaveSummary | null>(null);

  const refreshSlots = async () => {
    setIsLoading(true);
    const data = await fetchSlots();
    const map: Record<string, GameSaveSummary> = {};
    let auto: GameSaveSummary | null = null;
    
    data.forEach(s => {
        if (s.slotId === 'autosave') auto = s;
        else map[s.slotId] = s;
    });
    setSaves(map);
    setAutoSave(auto);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) refreshSlots();
  }, [isOpen]);

  if (!isOpen) return null;

  const SlotCard: React.FC<{ slotId: string; label: string; isAuto?: boolean }> = ({ slotId, label, isAuto = false }) => {
    const save = isAuto ? autoSave : saves[slotId];
    const isEmpty = !save;

    return (
      <div className={`p-4 rounded-lg border ${isAuto ? 'border-amber-500/50 bg-amber-900/10' : 'border-indigo-500/50 bg-indigo-900/10'} flex flex-col gap-2 relative overflow-hidden group`}>
         <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-1">
             <span className={`font-cinzel font-bold ${isAuto ? 'text-amber-400' : 'text-indigo-300'}`}>{label}</span>
             {save && <span className="text-[10px] text-slate-400 font-mono">{new Date(save.timestamp).toLocaleString()}</span>}
         </div>
         
         <div className="flex-grow min-h-[60px] flex flex-col justify-center">
            {isEmpty ? (
                <span className="text-slate-500 italic text-center text-sm">-- Empty Void --</span>
            ) : (
                <div className="text-xs text-slate-300 space-y-1">
                    <div className="font-bold text-white">{save.previewData.seekerName}</div>
                    <div className="flex justify-between">
                        <span>Level {save.previewData.level}</span>
                        <span>{save.previewData.location}</span>
                    </div>
                </div>
            )}
         </div>

         <div className="flex gap-2 mt-2">
            {!isAuto && (
                <button 
                    onClick={async () => { await onSave(slotId); refreshSlots(); }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-xs py-1.5 rounded transition-colors border border-slate-500"
                >
                    <i className="ri-save-line mr-1"></i>Save
                </button>
            )}
            <button 
                onClick={async () => { 
                    if(!isEmpty) {
                        if(confirm("Load this reality? Unsaved progress will be lost.")) {
                            await onLoad(slotId); 
                            onClose();
                        }
                    }
                }}
                disabled={isEmpty}
                className={`flex-1 text-xs py-1.5 rounded transition-colors border ${isEmpty ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' : 'bg-emerald-700 hover:bg-emerald-600 text-white border-emerald-500'}`}
            >
                <i className="ri-download-line mr-1"></i>Load
            </button>
         </div>
         
         {/* Holographic scanline effect */}
         <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-[length:100%_4px]" style={{backgroundSize: '100% 4px'}}></div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in-up">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-indigo-500/60 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-indigo-500/50 flex justify-between items-center">
            <h2 className="text-xl font-cinzel font-bold text-indigo-300 flex items-center gap-2">
                <i className="ri-archive-drawer-line"></i> Chronicle Vault
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <i className="ri-close-line text-2xl"></i>
            </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-900/80">
            {isLoading ? (
                <div className="text-center py-20 text-indigo-400 animate-pulse">Syncing Timeline Archives...</div>
            ) : (
                <div className="space-y-6">
                    {/* Auto Save Section */}
                    <div className="mb-6">
                         <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">System Auto-Archive</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <SlotCard slotId="autosave" label="Auto-Save (Latest)" isAuto={true} />
                         </div>
                    </div>

                    {/* Manual Slots */}
                    <div>
                        <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Manual Stasis Pods</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {SLOTS.map((slotId, i) => (
                                <SlotCard key={slotId} slotId={slotId} label={`Stasis Pod ${i+1}`} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
        
        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500 italic">
            "Memory is the anchor of the soul." — Tablet of the Phoenix
        </div>
      </div>
    </div>
  );
};

export default SaveLoadModal;