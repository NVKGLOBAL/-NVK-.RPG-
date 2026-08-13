
import React from 'react';
import type { SavedRitual } from '../../types';
import { Button } from '../ui/Button';

interface RitualGrimoireModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedRituals: SavedRitual[];
  onLoadRitual: (ritual: SavedRitual) => void;
  onDeleteRitual: (id: string) => void;
}

const RitualGrimoireModal: React.FC<RitualGrimoireModalProps> = ({
  isOpen,
  onClose,
  savedRituals,
  onLoadRitual,
  onDeleteRitual,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-xl font-cinzel text-amber-200 flex items-center">
            <i className="ri-book-mark-line mr-2"></i>Ritual Grimoire
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        
        <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
          {savedRituals.length === 0 ? (
            <div className="text-center py-10 text-slate-500 italic">
              <i className="ri-quill-pen-line text-4xl mb-2 block opacity-50"></i>
              No rituals inscribed in the Grimoire yet.
            </div>
          ) : (
            <div className="space-y-3">
              {savedRituals.map((ritual) => (
                <div key={ritual.id} className="bg-slate-800/40 border border-slate-700 rounded-lg p-3 flex justify-between items-center group hover:bg-slate-800/60 transition-colors">
                  <div>
                    <h4 className="font-cinzel text-slate-200 font-bold">{ritual.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-1">
                      {new Date(ritual.timestamp).toLocaleDateString()} • {ritual.placedGlyphs.length} Glyphs • {ritual.connections.length} Threads
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onLoadRitual(ritual)}
                      className="text-xs py-1 px-3 bg-indigo-600 hover:bg-indigo-500"
                    >
                      Load
                    </Button>
                    <button 
                      onClick={() => onDeleteRitual(ritual.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete Ritual"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-slate-700 bg-slate-800/30 text-center">
          <p className="text-xs text-slate-500 italic">
            "Patterns preserved in the Grimoire echo across sessions."
          </p>
        </div>
      </div>
    </div>
  );
};

export default RitualGrimoireModal;
