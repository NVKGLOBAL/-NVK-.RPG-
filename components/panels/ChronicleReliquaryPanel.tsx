import React, { useState, useEffect } from 'react';
import type { ChronicleReliquaryPanelProps, CodexArtifact } from '../../types';
import { AgentName, ArtifactRarity, ArtifactType } from '../../types';
import { useGemini } from '../../context/GeminiIntegrationContext';

const RARITY_COLORS: Record<ArtifactRarity, string> = {
  [ArtifactRarity.Common]: 'border-slate-600 text-slate-400 bg-slate-800/50',
  [ArtifactRarity.Uncommon]: 'border-emerald-600 text-emerald-400 bg-emerald-900/40',
  [ArtifactRarity.Rare]: 'border-blue-500 text-blue-300 bg-blue-900/40',
  [ArtifactRarity.Epic]: 'border-violet-600 text-violet-400 bg-violet-900/40',
  [ArtifactRarity.Legendary]: 'border-amber-500 text-amber-300 bg-amber-900/40',
  [ArtifactRarity.Mythic]: 'border-fuchsia-500 text-fuchsia-300 bg-fuchsia-900/40',
  [ArtifactRarity.Anomalous]: 'border-rose-600 text-rose-400 bg-rose-900/40 animate-pulse-slow',
};

const ChronicleReliquaryPanel: React.FC<ChronicleReliquaryPanelProps> = ({
  width,
  height,
  artifacts,
  addEchoMessage
}) => {
  const [selectedArtifact, setSelectedArtifact] = useState<CodexArtifact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArtifacts, setFilteredArtifacts] = useState<CodexArtifact[]>(artifacts);
  const [isSearching, setIsSearching] = useState(false);
  const { semanticSearch, generateEmbedding } = useGemini();

  useEffect(() => {
    setFilteredArtifacts(artifacts);
  }, [artifacts]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredArtifacts(artifacts);
      return;
    }

    setIsSearching(true);
    addEchoMessage(AgentName.ChronicleReliquaryAgent, `Initiating semantic search for: "${searchQuery}"`, 'text-indigo-300');

    try {
      // Prepare artifacts for semantic search by creating a text representation
      // In a real app, embeddings would be pre-calculated and stored in Dexie
      const entriesToSearch = await Promise.all(artifacts.map(async (a) => {
        const textToEmbed = `${a.name}. ${a.description}. ${a.type}. ${a.rarity}.`;
        const embedding = await generateEmbedding(textToEmbed);
        return { ...a, embedding, text: textToEmbed };
      }));

      const validEntries = entriesToSearch.filter(e => e.embedding !== null);
      
      if (validEntries.length > 0) {
        const results = await semanticSearch(searchQuery, validEntries as any[], 10);
        setFilteredArtifacts(results as unknown as CodexArtifact[]);
        addEchoMessage(AgentName.ChronicleReliquaryAgent, `Found ${results.length} resonant artifacts.`, 'text-emerald-400');
      } else {
        // Fallback to text search if embeddings fail
        const lowerQuery = searchQuery.toLowerCase();
        setFilteredArtifacts(artifacts.filter(a => 
          a.name.toLowerCase().includes(lowerQuery) || 
          a.description.toLowerCase().includes(lowerQuery)
        ));
      }
    } catch (e) {
      console.error("Search error:", e);
      // Fallback to text search
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredArtifacts(artifacts.filter(a => 
        a.name.toLowerCase().includes(lowerQuery) || 
        a.description.toLowerCase().includes(lowerQuery)
      ));
    } finally {
      setIsSearching(false);
    }
  };

  const handleArtifactClick = (artifact: CodexArtifact) => {
    setSelectedArtifact(artifact);
    addEchoMessage(
        AgentName.ChronicleReliquaryAgent, 
        `Inspecting Artifact: ${artifact.name} (${artifact.type}).`, 
        'text-indigo-300'
    );
  };

  const handleDownload = () => {
    if (!selectedArtifact?.imageUrl) return;
    const link = document.createElement('a');
    link.href = selectedArtifact.imageUrl;
    link.download = `Codex_Artifact_${selectedArtifact.name.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addEchoMessage(AgentName.System, "Artifact download initiated.", "text-emerald-400");
  };

  return (
    <div className="chronicle-reliquary-panel bg-slate-950/95 backdrop-blur-xl border border-indigo-500/50 rounded-xl shadow-2xl p-4 text-slate-100 flex flex-col my-4" style={{ width: `${width}px`, height: `${height}px` }}>
      <header className="flex flex-col mb-4 border-b border-indigo-800/50 pb-2 gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-cinzel font-bold text-indigo-300 tracking-wider flex items-center">
            <i className="ri-treasure-map-line mr-2 text-2xl"></i>
            Chronicle Reliquary
          </h3>
          <span className="text-xs font-mono text-slate-500">
            Capacity: {artifacts.length}/∞
          </span>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Semantic search artifacts..." 
            className="flex-grow bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-indigo-500"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-3 py-1 rounded text-sm transition-colors flex items-center"
          >
            {isSearching ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-search-line"></i>}
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-grow gap-4 min-h-0">
        {/* Artifact Grid */}
        <div className="w-full md:w-1/2 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-3 gap-2 content-start h-full">
          {filteredArtifacts.length === 0 && (
            <div className="col-span-3 text-center text-slate-500 italic py-10 text-xs">
              {artifacts.length === 0 ? "The Reliquary is empty.\nForge a Seeker ID or conjure a Dream to populate." : "No artifacts match your resonance query."}
            </div>
          )}
          {filteredArtifacts.map(artifact => (
            <button 
              key={artifact.id}
              onClick={() => handleArtifactClick(artifact)}
              className={`aspect-square rounded-lg border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${RARITY_COLORS[artifact.rarity]} ${selectedArtifact?.id === artifact.id ? 'ring-2 ring-white shadow-lg scale-105' : ''}`}
              aria-label={`Select ${artifact.name}, ${artifact.rarity} rarity`}
              aria-pressed={selectedArtifact?.id === artifact.id}
            >
              {artifact.imageUrl ? (
                <img src={artifact.imageUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                    {artifact.type === ArtifactType.SeekerID ? '🪪' : '💎'}
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] p-1 truncate text-center backdrop-blur-sm font-bold">
                {artifact.name}
              </div>
            </button>
          ))}
        </div>

        {/* Inspection Pane */}
        <div className="w-full md:w-1/2 bg-slate-900/50 border border-slate-700/50 rounded-lg p-3 flex flex-col h-full">
          {selectedArtifact ? (
            <>
              <div className="aspect-square w-full rounded-md border border-slate-600 bg-black overflow-hidden mb-3 relative group shadow-inner">
                {selectedArtifact.imageUrl ? (
                    <img src={selectedArtifact.imageUrl} alt={`Preview of ${selectedArtifact.name}`} className="w-full h-full object-contain" />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-600 italic">No Visual Data</div>
                )}
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-grow mb-3">
                <h4 className={`text-lg font-bold font-cinzel ${RARITY_COLORS[selectedArtifact.rarity].split(' ')[1]}`}>{selectedArtifact.name}</h4>
                <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wider mb-2">
                    <span className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">{selectedArtifact.type}</span>
                    <span className={`${RARITY_COLORS[selectedArtifact.rarity].split(' ')[1]} border border-current px-1.5 py-0.5 rounded`}>{selectedArtifact.rarity}</span>
                </div>
                
                <p className="text-sm text-slate-300 italic font-cormorant mb-3 border-l-2 border-slate-600 pl-3 leading-relaxed">
                    "{selectedArtifact.description}"
                </p>

                <div className="text-xs space-y-1.5 font-mono text-slate-400 bg-slate-800/30 p-2 rounded">
                    <div className="flex justify-between border-b border-slate-700 pb-1">
                        <span>Acquired:</span>
                        <span className="text-slate-200">{new Date(selectedArtifact.timestamp).toLocaleDateString()}</span>
                    </div>
                    {selectedArtifact.energySignature && (
                        <div className="flex justify-between border-b border-slate-700 pb-1">
                            <span>Resonance:</span>
                            <span className="text-slate-200">{selectedArtifact.energySignature}</span>
                        </div>
                    )}
                    {selectedArtifact.metaData && Object.entries(selectedArtifact.metaData).map(([key, val]) => (
                         <div key={key} className="flex justify-between border-b border-slate-700 pb-1">
                            <span className="capitalize">{key}:</span>
                            <span className="text-slate-200 truncate max-w-[120px]" title={String(val)}>{String(val)}</span>
                        </div>
                    ))}
                </div>
              </div>

              {selectedArtifact.imageUrl && (
                <button 
                    onClick={handleDownload}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 focus:outline-none"
                    title={`Download ${selectedArtifact.name}`}
                    aria-label={`Download image for ${selectedArtifact.name}`}
                >
                    <i className="ri-download-line text-lg"></i>
                    <span>DOWNLOAD ARTIFACT</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 italic text-sm text-center px-4">
              <div className="flex flex-col items-center gap-2">
                <i className="ri-hand-coin-line text-3xl opacity-50"></i>
                <p>Select an artifact from the grid to inspect its resonance and download.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChronicleReliquaryPanel;