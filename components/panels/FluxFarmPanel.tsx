
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { SeekerProfile, MarketItem } from '../../types';
import { AgentName, ArtifactRarity, MarketItemType } from '../../types';
import { AGENT_PROFILES } from '../../constants';
import { Button } from '../ui/Button';

interface FluxFarmPanelProps {
  width: number;
  height: number;
  activeProfile: SeekerProfile | null;
  onUpdateProfile: (profile: SeekerProfile) => void;
  currentEntropy: number;
  addEchoMessage: (source: string, text: string, colorClass?: string) => void;
}

type CropStage = 'empty' | 'seeded' | 'growing' | 'mature' | 'withered' | 'mutated';

interface CropType {
  id: string;
  name: string;
  icon: string;
  seedCost: number;
  baseValue: number;
  growthTimeMs: number;
  rotChance: number;
  mutationChance: number;
  color: string;
  description: string;
}

const CROP_CATALOG: CropType[] = [
  { 
    id: 'neon_tuber', 
    name: 'Neon Tuber', 
    icon: 'ri-seedling-line', 
    seedCost: 20, 
    baseValue: 45, 
    growthTimeMs: 4000, 
    rotChance: 0.05, 
    mutationChance: 0.01,
    color: 'text-emerald-400',
    description: 'Reliable, glowing root vegetable. Low risk.'
  },
  { 
    id: 'star_berry', 
    name: 'Star Berry', 
    icon: 'ri-sun-line', 
    seedCost: 100, 
    baseValue: 280, 
    growthTimeMs: 8000, 
    rotChance: 0.20, 
    mutationChance: 0.10,
    color: 'text-amber-400',
    description: 'Sweet but volatile. Loves high entropy.'
  },
  { 
    id: 'void_orchid', 
    name: 'Void Orchid', 
    icon: 'ri-magic-line', 
    seedCost: 500, 
    baseValue: 1800, 
    growthTimeMs: 15000, 
    rotChance: 0.45, 
    mutationChance: 0.25,
    color: 'text-fuchsia-400',
    description: 'Beautiful, expensive, and prone to vanishing.'
  },
  {
    id: 'chrono_lotus',
    name: 'Chrono Lotus',
    icon: 'ri-time-line',
    seedCost: 1200,
    baseValue: 4000,
    growthTimeMs: 25000,
    rotChance: 0.3,
    mutationChance: 0.4,
    color: 'text-cyan-400',
    description: 'Blooms in reverse time. High mutation potential.'
  }
];

interface Plot {
  id: number;
  stage: CropStage;
  cropTypeId: string | null;
  progress: number; // 0 to 100
  plantedAt: number;
}

const FluxFarmPanel: React.FC<FluxFarmPanelProps> = ({
  width,
  height,
  activeProfile,
  onUpdateProfile,
  currentEntropy,
  addEchoMessage
}) => {
  const [activeTab, setActiveTab] = useState<'farm' | 'bazaar'>('farm');
  const [plots, setPlots] = useState<Plot[]>(Array.from({ length: 9 }).map((_, i) => ({
    id: i,
    stage: 'empty',
    cropTypeId: null,
    progress: 0,
    plantedAt: 0
  })));
  
  const [selectedSeedId, setSelectedSeedId] = useState<string>('neon_tuber');
  const [wagerAmount, setWagerAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState(false);

  // --- FARM ENGINE ---
  useEffect(() => {
    const tickRate = 200; // Update every 200ms
    const interval = setInterval(() => {
      setPlots(currentPlots => {
        return currentPlots.map(plot => {
          if (plot.stage !== 'growing') return plot;

          const crop = CROP_CATALOG.find(c => c.id === plot.cropTypeId);
          if (!crop) return plot;

          // Entropy modifies growth speed. High entropy = faster growth.
          const entropySpeedMod = 1 + (currentEntropy * 2); 
          const growthIncrement = (100 / (crop.growthTimeMs / tickRate)) * entropySpeedMod;
          
          let newProgress = plot.progress + growthIncrement;
          let newStage = plot.stage;

          // Random Events based on Entropy
          const roll = Math.random();
          // High entropy increases rot chance AND mutation chance
          const currentRotChance = crop.rotChance * (1 + currentEntropy);
          const currentMutChance = crop.mutationChance * (1 + currentEntropy * 3);

          if (roll < 0.005) { // Small chance per tick to trigger event
             if (Math.random() < currentRotChance) {
                 newStage = 'withered';
             } else if (Math.random() < currentMutChance) {
                 newStage = 'mutated'; // Instant maturity + bonus
                 newProgress = 100;
             }
          }

          if (newProgress >= 100 && newStage === 'growing') {
            newProgress = 100;
            newStage = 'mature';
          }

          return { ...plot, progress: newProgress, stage: newStage };
        });
      });
    }, tickRate);

    return () => clearInterval(interval);
  }, [currentEntropy]);

  // --- ACTIONS ---

  const handleBuySeed = (crop: CropType) => {
    if (!activeProfile) return;
    if (activeProfile.flux < crop.seedCost) {
        addEchoMessage(AgentName.System, `Insufficient Flux to buy ${crop.name} seeds.`, 'text-rose-400');
        return;
    }

    const seedItem: MarketItem = {
        id: `seed_${crop.id}_${Date.now()}`,
        name: `${crop.name} Seed`,
        type: 'Material' as any,
        rarity: ArtifactRarity.Common,
        description: `Plant in a Hydro-Plot to grow ${crop.name}.`,
        visualPromptMod: 'seed packet',
        cost: crop.seedCost,
        icon: 'ri-seedling-fill'
    };

    const updatedProfile = {
        ...activeProfile,
        flux: activeProfile.flux - crop.seedCost,
        inventory: [...activeProfile.inventory, seedItem]
    };
    onUpdateProfile(updatedProfile);
    addEchoMessage(AgentName.RPGNexusAgent, `Purchased ${crop.name} Seed.`, 'text-emerald-300');
  };

  const handleSellCrop = (item: MarketItem) => {
    if (!activeProfile) return;
    
    // Determine value based on name (simple mapping for now)
    let value = 0;
    const baseName = item.name.replace('Mutated ', '');
    const crop = CROP_CATALOG.find(c => c.name === baseName);
    
    if (crop) {
        value = item.name.includes('Mutated') ? Math.floor(crop.baseValue * 3.5) : crop.baseValue;
    } else {
        value = 10; // Fallback
    }

    const updatedInventory = activeProfile.inventory.filter(i => i.id !== item.id);
    const updatedProfile = {
        ...activeProfile,
        flux: activeProfile.flux + value,
        inventory: updatedInventory
    };
    onUpdateProfile(updatedProfile);
    addEchoMessage(AgentName.RPGNexusAgent, `Sold ${item.name} for ${value} Flux.`, 'text-amber-300');
  };

  const handlePlant = (plotId: number) => {
    if (!activeProfile) return;
    const crop = CROP_CATALOG.find(c => c.id === selectedSeedId);
    if (!crop) return;

    // Check for seed in inventory
    const seedIndex = activeProfile.inventory.findIndex(i => i.name === `${crop.name} Seed`);
    
    let updatedProfile = { ...activeProfile };

    if (seedIndex >= 0) {
        // Use seed
        const newInv = [...activeProfile.inventory];
        newInv.splice(seedIndex, 1);
        updatedProfile.inventory = newInv;
        addEchoMessage(AgentName.RPGNexusAgent, `Planted ${crop.name} from inventory.`, 'text-emerald-300');
    } else {
        // Auto-buy if flux allows
        if (activeProfile.flux >= crop.seedCost) {
            updatedProfile.flux -= crop.seedCost;
            addEchoMessage(AgentName.RPGNexusAgent, `Auto-purchased & planted ${crop.name} (-${crop.seedCost} Flux).`, 'text-yellow-300');
        } else {
            addEchoMessage(AgentName.System, "No seeds and insufficient Flux to auto-buy.", 'text-rose-400');
            return;
        }
    }

    onUpdateProfile(updatedProfile);
    setPlots(prev => prev.map(p => p.id === plotId ? {
        ...p,
        stage: 'growing',
        cropTypeId: crop.id,
        progress: 0,
        plantedAt: Date.now()
    } : p));
  };

  const handleHarvest = (plotId: number) => {
    if (!activeProfile) return;
    const plot = plots.find(p => p.id === plotId);
    if (!plot || !plot.cropTypeId) return;
    
    const crop = CROP_CATALOG.find(c => c.id === plot.cropTypeId);
    if (!crop) return;

    if (plot.stage === 'withered') {
        addEchoMessage(AgentName.RPGNexusAgent, `Cleared withered ${crop.name}. Zero yield.`, 'text-slate-400');
    } else {
        const isMutated = plot.stage === 'mutated';
        const cropItem: MarketItem = {
            id: `crop_${crop.id}_${Date.now()}`,
            name: isMutated ? `Mutated ${crop.name}` : crop.name,
            type: 'Material' as any,
            rarity: isMutated ? ArtifactRarity.Rare : ArtifactRarity.Common,
            description: isMutated ? `A glitch-infused ${crop.name}. Highly unstable.` : `Freshly harvested ${crop.name}.`,
            visualPromptMod: 'harvested crop',
            cost: 0, // Not used for selling logic directly here
            icon: crop.icon
        };

        const updatedProfile = { 
            ...activeProfile, 
            inventory: [...activeProfile.inventory, cropItem] 
        };
        onUpdateProfile(updatedProfile);
        
        const message = isMutated 
            ? `⚠️ GLITCH HARVEST! Acquired Mutated ${crop.name}!` 
            : `Harvested ${crop.name}. Added to Storage.`;
        const color = isMutated ? 'text-fuchsia-300 font-bold animate-pulse' : 'text-emerald-300';
        
        addEchoMessage(AgentName.RPGNexusAgent, message, color);
    }

    // Reset Plot
    setPlots(prev => prev.map(p => p.id === plotId ? { ...p, stage: 'empty', cropTypeId: null, progress: 0 } : p));
  };

  // --- GAMBLE ENGINE ---
  const handleQuantumGamble = () => {
      if (!activeProfile || isSpinning) return;
      if (activeProfile.flux < wagerAmount) {
          addEchoMessage(AgentName.System, "Insufficient Flux for wager.", 'text-rose-400');
          return;
      }

      setIsSpinning(true);
      const updatedProfile = { ...activeProfile, flux: activeProfile.flux - wagerAmount };
      onUpdateProfile(updatedProfile);

      setTimeout(() => {
          const win = Math.random() > 0.55; // House edge
          let multiplier = 0;
          let msg = "";
          
          if (win) {
              // Chance for high multiplier based on entropy
              if (Math.random() < currentEntropy * 0.2) {
                  multiplier = 5;
                  msg = `JACKPOT! QUANTUM RESONANCE! x5`;
              } else {
                  multiplier = 2;
                  msg = `WIN! x2`;
              }
              const winnings = wagerAmount * multiplier;
              const winProfile = { ...updatedProfile, flux: updatedProfile.flux + winnings };
              onUpdateProfile(winProfile);
              addEchoMessage(AgentName.RPGNexusAgent, `${msg} (+${winnings} Flux)`, 'text-amber-300 font-bold');
          } else {
              addEchoMessage(AgentName.RPGNexusAgent, "LOSS. The Void consumes.", 'text-rose-400');
          }
          setIsSpinning(false);
      }, 1000);
  };

  if (!activeProfile) return <div className="p-4 text-center text-slate-400">Initialize Seeker Profile to access Flux Farm.</div>;

  const inventoryCounts = activeProfile.inventory.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flux-farm-panel bg-slate-950/95 backdrop-blur-xl border border-emerald-500/50 rounded-xl shadow-2xl p-4 text-slate-100 flex flex-col my-4" style={{ width: `${width}px`, height: `${height}px` }}>
      
      <header className="flex justify-between items-center mb-2 border-b border-emerald-800/50 pb-2">
            <div className="flex items-center gap-4">
                <h3 className="text-xl font-cinzel font-bold text-emerald-300 flex items-center">
                    <i className="ri-plant-line mr-2"></i>Flux Garden
                </h3>
                <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('farm')} 
                        className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'farm' ? 'bg-emerald-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Hydro-Plots
                    </button>
                    <button 
                        onClick={() => setActiveTab('bazaar')} 
                        className={`px-3 py-1 text-xs rounded transition-colors ${activeTab === 'bazaar' ? 'bg-amber-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Seed Bazaar
                    </button>
                </div>
            </div>
            <div className="text-amber-400 font-mono text-sm border border-amber-500/30 px-3 py-1 rounded bg-amber-900/20">
                <i className="ri-copper-coin-line mr-1"></i>{activeProfile.flux}
            </div>
      </header>

      <div className="flex flex-grow gap-4 min-h-0">
        
        {/* LEFT COLUMN: Main Interaction Area */}
        <div className="flex-grow flex flex-col">
            
            {activeTab === 'farm' && (
                <div className="grid grid-cols-3 gap-3 flex-grow content-start overflow-y-auto custom-scrollbar p-1">
                    {plots.map(plot => {
                        const crop = CROP_CATALOG.find(c => c.id === plot.cropTypeId);
                        const isHarvestable = plot.stage === 'mature' || plot.stage === 'mutated' || plot.stage === 'withered';
                        const selectedSeedCount = inventoryCounts[`${CROP_CATALOG.find(c=>c.id===selectedSeedId)?.name} Seed`] || 0;
                        
                        return (
                            <div 
                                key={plot.id}
                                onClick={() => {
                                    if (plot.stage === 'empty') handlePlant(plot.id);
                                    else if (isHarvestable) handleHarvest(plot.id);
                                }}
                                className={`
                                    relative rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden group
                                    ${plot.stage === 'empty' ? 'border-slate-700 bg-slate-800/40 hover:border-emerald-500/50 hover:bg-slate-800/60' : ''}
                                    ${plot.stage === 'growing' ? 'border-emerald-600/50 bg-emerald-900/10' : ''}
                                    ${plot.stage === 'mature' ? 'border-amber-400/80 bg-amber-900/20 shadow-lg shadow-amber-500/10' : ''}
                                    ${plot.stage === 'mutated' ? 'border-fuchsia-500 bg-fuchsia-900/20 animate-pulse' : ''}
                                    ${plot.stage === 'withered' ? 'border-rose-800/50 bg-rose-950/30' : ''}
                                `}
                                style={{ minHeight: '110px' }}
                            >
                                {plot.stage === 'empty' && (
                                    <div className="text-slate-600 text-3xl"><i className="ri-spade-line"></i></div>
                                )}
                                
                                {(plot.stage === 'growing' || isHarvestable) && crop && (
                                    <>
                                        <div className={`text-4xl mb-1 ${plot.stage === 'withered' ? 'text-slate-600' : crop.color} ${plot.stage === 'mutated' ? 'animate-bounce' : ''}`}>
                                            <i className={
                                                plot.stage === 'withered' ? 'ri-cactus-line' :
                                                plot.stage === 'mutated' ? 'ri-alien-line' :
                                                plot.stage === 'mature' ? 'ri-flower-line' : crop.icon
                                            }></i>
                                        </div>
                                        
                                        {plot.stage === 'growing' && (
                                            <div className="w-3/4 h-1.5 bg-slate-700 rounded-full overflow-hidden mt-2">
                                                <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${plot.progress}%` }}></div>
                                            </div>
                                        )}
                                        
                                        <div className="text-[9px] uppercase font-bold tracking-wider mt-1 text-slate-400">
                                            {plot.stage}
                                        </div>
                                    </>
                                )}
                                
                                {/* Hover Overlay for Planting */}
                                {plot.stage === 'empty' && (
                                    <div className="absolute inset-0 bg-slate-900/90 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs text-slate-200 backdrop-blur-sm transition-opacity p-2 text-center">
                                        <div className="font-bold text-emerald-300">Plant {CROP_CATALOG.find(c => c.id === selectedSeedId)?.name}</div>
                                        {selectedSeedCount > 0 ? (
                                            <div className="text-[9px] text-slate-400 mt-1">Using Inventory ({selectedSeedCount})</div>
                                        ) : (
                                            <div className="text-[9px] text-amber-400 mt-1">Auto-Buy: {CROP_CATALOG.find(c => c.id === selectedSeedId)?.seedCost} Ф</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {activeTab === 'bazaar' && (
                <div className="flex flex-col h-full gap-3 overflow-hidden">
                    {/* Buy Section */}
                    <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700 flex-1 overflow-y-auto custom-scrollbar">
                        <h4 className="text-xs font-cinzel text-amber-300 mb-2 uppercase tracking-wider flex items-center">
                            <i className="ri-store-2-line mr-2"></i>Seed Merchant
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {CROP_CATALOG.map(crop => (
                                <div key={crop.id} className="p-2 bg-slate-700/30 rounded border border-slate-600/50 flex justify-between items-center group hover:bg-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded bg-slate-800 ${crop.color}`}><i className={crop.icon}></i></div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-200">{crop.name}</div>
                                            <div className="text-[9px] text-slate-500">Stock: {inventoryCounts[`${crop.name} Seed`] || 0}</div>
                                        </div>
                                    </div>
                                    <Button onClick={() => handleBuySeed(crop)} className="text-[10px] py-1 px-2 bg-slate-600 hover:bg-emerald-600 transition-colors">
                                        {crop.seedCost} Ф
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sell Section */}
                    <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700 flex-1 overflow-y-auto custom-scrollbar">
                        <h4 className="text-xs font-cinzel text-emerald-300 mb-2 uppercase tracking-wider flex items-center">
                            <i className="ri-exchange-dollar-line mr-2"></i>Commodities Exchange
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {activeProfile.inventory.filter(i => i.name.includes('Tuber') || i.name.includes('Berry') || i.name.includes('Orchid') || i.name.includes('Lotus')).map((item, idx) => {
                                // Calculate approximate value for display
                                const baseName = item.name.replace('Mutated ', '');
                                const crop = CROP_CATALOG.find(c => c.name === baseName);
                                const val = crop ? (item.name.includes('Mutated') ? Math.floor(crop.baseValue * 3.5) : crop.baseValue) : 0;
                                
                                return (
                                    <div key={`${item.id}-${idx}`} className="p-2 bg-slate-700/30 rounded border border-slate-600/50 flex justify-between items-center">
                                         <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="text-amber-200"><i className={item.icon}></i></div>
                                            <span className="text-xs text-slate-300 truncate">{item.name}</span>
                                        </div>
                                        <Button onClick={() => handleSellCrop(item)} className="text-[10px] py-1 px-2 bg-amber-700/60 hover:bg-amber-600 transition-colors">
                                            Sell {val}
                                        </Button>
                                    </div>
                                );
                            })}
                            {activeProfile.inventory.filter(i => i.name.includes('Tuber') || i.name.includes('Berry') || i.name.includes('Orchid') || i.name.includes('Lotus')).length === 0 && (
                                <p className="col-span-2 text-center text-xs text-slate-500 italic py-4">Storage empty. Harvest crops to sell.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: Tools & Gamble */}
        <div className="w-full md:w-56 flex flex-col gap-4 border-l border-slate-700/50 pl-4 bg-slate-900/30 rounded-r-xl shrink-0">
            
            {/* Quick Seed Selector (For Farm Tab) */}
            <div className={`bg-slate-800/60 p-3 rounded-lg border border-slate-700 transition-opacity ${activeTab === 'bazaar' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <h4 className="text-xs font-cinzel text-slate-300 mb-2 uppercase tracking-wider">Quick Select</h4>
                <div className="space-y-1.5">
                    {CROP_CATALOG.map(crop => {
                        const count = inventoryCounts[`${crop.name} Seed`] || 0;
                        return (
                            <div 
                                key={crop.id}
                                onClick={() => setSelectedSeedId(crop.id)}
                                className={`p-2 rounded border cursor-pointer transition-all flex justify-between items-center ${selectedSeedId === crop.id ? `bg-slate-700 ${crop.color.replace('text-', 'border-')}` : 'border-transparent hover:bg-slate-700/50'}`}
                            >
                                <div>
                                    <div className={`text-xs font-bold ${crop.color}`}>{crop.name}</div>
                                    <div className="text-[9px] text-slate-500">Risk: {(crop.rotChance * 100).toFixed(0)}%</div>
                                </div>
                                <div className={`text-xs font-mono px-1.5 py-0.5 rounded ${count > 0 ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                                    {count}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mini Game: Quantum Gamble */}
            <div className="bg-slate-800/60 p-3 rounded-lg border border-purple-500/30 flex-grow flex flex-col">
                <h4 className="text-xs font-cinzel text-purple-300 mb-2 uppercase tracking-wider text-center">Quantum Gamble</h4>
                <div className="flex-grow flex flex-col items-center justify-center">
                    <div className={`text-5xl mb-4 ${isSpinning ? 'animate-spin' : 'text-purple-400'}`}>
                        <i className="ri-compass-3-line"></i>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => setWagerAmount(Math.max(10, wagerAmount - 10))} className="p-1 text-slate-400 hover:text-white"><i className="ri-subtract-line"></i></button>
                        <span className="text-xl font-mono text-white w-16 text-center">{wagerAmount}</span>
                        <button onClick={() => setWagerAmount(Math.min(activeProfile.flux, wagerAmount + 10))} className="p-1 text-slate-400 hover:text-white"><i className="ri-add-line"></i></button>
                    </div>
                    <Button 
                        onClick={handleQuantumGamble}
                        disabled={isSpinning || activeProfile.flux < wagerAmount}
                        className="w-full bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-500/20 text-xs"
                    >
                        {isSpinning ? 'Observing...' : 'Collapse Wave'}
                    </Button>
                    <p className="text-[9px] text-slate-500 mt-2 text-center">50% Win Rate. Entropy boosts Jackpots.</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default FluxFarmPanel;
