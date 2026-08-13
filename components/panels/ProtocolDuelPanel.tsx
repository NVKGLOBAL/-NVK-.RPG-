
import React, { useState, useEffect } from 'react';
import type { SeekerProfile, DuelCard, MarketItem, CardDuelState } from '../../types';
import { ArtifactRarity, BattlePhase, AgentName } from '../../types';
import { Button } from '../ui/Button';
import { globalSoundEngine } from '../../lib/SoundEngine';

interface ProtocolDuelPanelProps {
  activeProfile: SeekerProfile | null;
  onUpdateProfile: (profile: SeekerProfile) => void;
  addEchoMessage: (source: string, text: string, colorClass?: string) => void;
  width?: number | string;
  height?: number | string;
}

// --- Battle Card Component (Local Definition) ---
const BattleCard: React.FC<{ 
    card: DuelCard, 
    isEnemy?: boolean, 
    isRevealed?: boolean,
    isSelected?: boolean,
    isWinner?: boolean,
    onClick?: () => void 
}> = ({ card, isEnemy = false, isRevealed = true, isSelected = false, isWinner = false, onClick }) => {
    const rarityColors = {
        [ArtifactRarity.Common]: 'border-slate-500 bg-slate-900',
        [ArtifactRarity.Uncommon]: 'border-emerald-500 bg-emerald-950',
        [ArtifactRarity.Rare]: 'border-blue-500 bg-blue-950',
        [ArtifactRarity.Legendary]: 'border-amber-500 bg-amber-950',
        [ArtifactRarity.Mythic]: 'border-fuchsia-500 bg-fuchsia-950',
        [ArtifactRarity.Anomalous]: 'border-rose-600 bg-rose-950',
    };
    
    if (isEnemy && !isRevealed) {
         return (
            <div className="w-24 h-36 rounded-xl border-2 border-slate-700 bg-slate-800 flex items-center justify-center shadow-lg relative overflow-hidden transform transition-transform hover:scale-105">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,rgba(255,255,255,0.05)_5px,rgba(255,255,255,0.05)_10px)]"></div>
                <div className="w-12 h-12 rounded-full border-2 border-slate-600 flex items-center justify-center">
                     <i className="ri-eye-off-line text-xl text-slate-500"></i>
                </div>
            </div>
        );
    }

    const borderColor = rarityColors[card.rarity] || rarityColors[ArtifactRarity.Common];
    const glowClass = isWinner ? 'ring-4 ring-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]' : (isSelected ? 'ring-2 ring-white scale-105 z-10' : 'hover:scale-105 hover:ring-1 hover:ring-slate-400');

    return (
        <div 
            onClick={onClick}
            className={`w-24 h-36 rounded-xl border-2 flex flex-col overflow-hidden shadow-xl transition-all duration-300 relative group cursor-pointer
                ${borderColor} 
                ${glowClass}
            `}
        >
            <div className="h-[55%] bg-black relative overflow-hidden">
                {card.image ? (
                    <img src={card.image} alt={card.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-black">
                        <i className={`${card.type === 'Glitch' ? 'ri-bug-line text-rose-500' : 'ri-sword-line text-slate-500'} text-3xl opacity-50`}></i>
                    </div>
                )}
            </div>
            
            <div className="bg-slate-950/90 border-t border-b border-white/10 py-0.5 px-1 relative z-10">
                <div className="text-[9px] text-center text-slate-100 font-bold truncate uppercase tracking-tight">{card.name}</div>
            </div>

            <div className="flex-1 bg-slate-900/90 p-1 flex flex-col justify-center gap-1">
                <div className="flex justify-between items-center text-[9px] font-mono px-1">
                    <span className="text-rose-400 font-bold">ATK</span>
                    <span className="bg-rose-950 text-rose-200 px-1 rounded border border-rose-800">{card.stats.atk}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono px-1">
                    <span className="text-blue-400 font-bold">DEF</span>
                    <span className="bg-blue-950 text-blue-200 px-1 rounded border border-blue-800">{card.stats.def}</span>
                </div>
                 <div className="flex justify-between items-center text-[9px] font-mono px-1">
                    <span className="text-purple-400 font-bold">RES</span>
                    <span className="bg-purple-950 text-purple-200 px-1 rounded border border-purple-800">{card.stats.res}</span>
                </div>
            </div>
        </div>
    );
};

const ProtocolDuelPanel: React.FC<ProtocolDuelPanelProps> = ({
  activeProfile,
  onUpdateProfile,
  addEchoMessage,
  width,
  height
}) => {
  const [duelState, setDuelState] = useState<CardDuelState | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<DuelCard[]>([]);

  // -- Helpers --
  const convertMarketItemToDuelCard = (item: MarketItem): DuelCard => {
      const stats = item.combatStats || {
          atk: Math.floor(item.cost / 20) + 5,
          def: Math.floor(item.cost / 25) + 5,
          res: Math.floor(item.cost / 30) + 5
      };
      return {
          id: item.id,
          name: item.name,
          type: item.type,
          rarity: item.rarity,
          stats,
          image: null 
      };
  };

  const generateDuelCard = (level: number, type: 'player' | 'enemy'): DuelCard => {
      const isEnemy = type === 'enemy';
      const rarityRoll = Math.random();
      let rarity = ArtifactRarity.Common;
      if (rarityRoll > 0.95) rarity = ArtifactRarity.Legendary;
      else if (rarityRoll > 0.8) rarity = ArtifactRarity.Rare;
      else if (rarityRoll > 0.6) rarity = ArtifactRarity.Uncommon;
      
      const multiplier = (isEnemy ? 0.9 : 1.0) + (level * 0.1);
      const names = isEnemy 
        ? ["Void Shade", "Entropy Beast", "Data Glitch", "Null Sentinel", "Chaos Spark"] 
        : ["System Kernel", "Logic Gate", "Firewall", "Trace Router", "Code Weaver"];
        
      return {
          id: `card-${type}-${Date.now()}-${Math.random()}`,
          name: names[Math.floor(Math.random() * names.length)],
          type: 'Construct',
          rarity,
          stats: {
              atk: Math.floor((Math.random() * 10 + 5) * multiplier),
              def: Math.floor((Math.random() * 10 + 5) * multiplier),
              res: Math.floor((Math.random() * 10 + 5) * multiplier)
          },
          image: null 
      };
  };

  const handleDeckSelection = (item: MarketItem) => {
      const card = convertMarketItemToDuelCard(item);
      if (selectedDeck.find(c => c.id === card.id)) {
          setSelectedDeck(prev => prev.filter(c => c.id !== card.id));
      } else {
          if (selectedDeck.length < 3) {
              setSelectedDeck(prev => [...prev, card]);
          }
      }
  };

  const startDuel = () => {
      let playerHand = [...selectedDeck];
      // Fill with Glitch cards if not enough
      while (playerHand.length < 3) {
          playerHand.push({
              id: `glitch-${Date.now()}-${Math.random()}`,
              name: "Glitch Fragment",
              type: "Glitch",
              rarity: ArtifactRarity.Common,
              stats: { atk: 5, def: 5, res: 5 },
              image: null
          });
      }

      const enemyLevel = activeProfile ? activeProfile.level : 1;
      const enemyHand = [
          generateDuelCard(enemyLevel, 'enemy'),
          generateDuelCard(enemyLevel, 'enemy'),
          generateDuelCard(enemyLevel, 'enemy')
      ];

      setDuelState({
          isActive: true,
          phase: BattlePhase.PLAYER_TURN,
          round: 1,
          playerHand,
          enemyHand,
          playedCardPlayer: null,
          playedCardEnemy: null,
          playerScore: 0,
          enemyScore: 0,
          logs: ["Duel Initialized. Waiting for input..."],
          enemyName: `Construct Level ${enemyLevel}`,
          rewards: { flux: 50 + enemyLevel * 25 }
      });
      globalSoundEngine.playSFX('pulse');
  };

  const handleCardPlay = (card: DuelCard) => {
      if (!duelState || duelState.phase !== BattlePhase.PLAYER_TURN) return;

      setDuelState(prev => {
          if (!prev) return null;
          const enemyCard = prev.enemyHand[prev.round - 1]; 
          return {
              ...prev,
              playedCardPlayer: card,
              playedCardEnemy: enemyCard,
              phase: BattlePhase.ENEMY_REVEAL,
              logs: [`You played ${card.name}. Enemy reveals ${enemyCard.name}...`, ...prev.logs],
              playerHand: prev.playerHand.filter(c => c.id !== card.id) // Remove from hand immediately for visual clarity
          };
      });

      setTimeout(() => resolveRound(), 1500);
  };

  const resolveRound = () => {
      setDuelState(prev => {
          if (!prev || !prev.playedCardPlayer || !prev.playedCardEnemy) return prev;
          
          const pCard = prev.playedCardPlayer;
          const eCard = prev.playedCardEnemy;
          
          let pScore = prev.playerScore;
          let eScore = prev.enemyScore;
          const roundLogs = [];

          // Logic
          const pDmg = Math.max(0, pCard.stats.atk - eCard.stats.def);
          const eDmg = Math.max(0, eCard.stats.atk - pCard.stats.def);
          pScore += pDmg;
          eScore += eDmg;
          roundLogs.push(`Clash: You dealt ${pDmg}, took ${eDmg}.`);

          if (pCard.stats.res > eCard.stats.res) {
              const heal = Math.floor((pCard.stats.res - eCard.stats.res) * 1.5);
              pScore += heal;
              roundLogs.push(`Resonance Bonus: +${heal} Score.`);
          } else if (eCard.stats.res > pCard.stats.res) {
               const heal = Math.floor((eCard.stats.res - pCard.stats.res) * 1.5);
               eScore += heal;
               roundLogs.push(`Enemy Resonance Bonus: +${heal} Score.`);
          }

          let nextPhase = BattlePhase.PLAYER_TURN;
          let nextRound = prev.round + 1;
          
          if (prev.round >= 3) {
              const playerWon = pScore > eScore;
              nextPhase = playerWon ? BattlePhase.VICTORY : BattlePhase.DEFEAT;
              roundLogs.push(playerWon ? "PROTOCOL STABILIZED. VICTORY." : "CONNECTION SEVERED. DEFEAT.");
              if (playerWon) globalSoundEngine.playSFX('success');
              else globalSoundEngine.playSFX('fail');
          }

          return {
              ...prev,
              playerScore: pScore,
              enemyScore: eScore,
              phase: nextPhase,
              round: nextRound,
              logs: [...roundLogs, ...prev.logs],
              playedCardPlayer: null, // Clear board for next round or end
              playedCardEnemy: null
          };
      });
  };

  const handleClaimReward = () => {
      if (!duelState || !activeProfile) return;
      if (duelState.phase === BattlePhase.VICTORY) {
          const fluxReward = duelState.rewards?.flux || 0;
          const xpReward = 50; 
          onUpdateProfile({
              ...activeProfile,
              flux: activeProfile.flux + fluxReward,
              experience: activeProfile.experience + xpReward
          });
          addEchoMessage(AgentName.System, `Duel Victory! +${fluxReward} Flux, +${xpReward} XP.`, 'text-emerald-300');
      }
      setDuelState(null);
      setSelectedDeck([]);
  };

  return (
    <div className="protocol-duel-panel bg-slate-950/95 border border-rose-500/50 rounded-xl shadow-2xl p-4 flex flex-col relative overflow-hidden" style={{ width: width || '100%', height: height || '600px' }}>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b border-rose-800/50 pb-2 z-10 relative">
            <h3 className="text-xl font-cinzel font-bold text-rose-400 flex items-center">
                <i className="ri-sword-fill mr-2"></i>PROTOCOL DUEL
            </h3>
            <div className="text-xs font-mono text-slate-400">
                {duelState ? `Round ${Math.min(3, duelState.round)}/3` : 'Lobby'}
            </div>
        </div>

        {/* Background Animation */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-4 border-rose-900/30 rounded-full animate-spin-slow"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border-2 border-rose-800/20 rounded-full animate-reverse-spin"></div>
        </div>

        {/* --- LOBBY: Deck Selection --- */}
        {!duelState && (
            <div className="flex flex-col flex-grow z-10">
                <div className="text-center mb-4">
                    <h4 className="text-sm font-cinzel text-slate-300">Select 3 Constructs from Inventory</h4>
                    <p className="text-xs text-slate-500">Empty slots will be filled with Glitch Fragments.</p>
                </div>
                
                {/* Selected Deck Preview */}
                <div className="flex justify-center gap-4 mb-6 min-h-[150px] items-center bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    {Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="w-24 h-36 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center relative">
                            {selectedDeck[i] ? (
                                <BattleCard card={selectedDeck[i]} onClick={() => handleDeckSelection({id: selectedDeck[i].id} as MarketItem)} />
                            ) : (
                                <span className="text-slate-600 text-xs">Slot {i+1}</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Inventory Grid */}
                <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-900/30 p-2 rounded-lg border border-slate-800">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {activeProfile?.inventory.filter(item => ['Weapon','Relic','Companion','Augmentation'].includes(item.type)).map(item => (
                             <div key={item.id} className={`transform transition-all ${selectedDeck.find(c=>c.id===item.id) ? 'opacity-50 scale-95' : 'hover:scale-105'}`}>
                                 <BattleCard card={convertMarketItemToDuelCard(item)} onClick={() => handleDeckSelection(item)} />
                             </div>
                        ))}
                         {(!activeProfile || activeProfile.inventory.length === 0) && (
                            <div className="col-span-full text-center text-slate-500 italic py-10">Inventory Empty.</div>
                        )}
                    </div>
                </div>

                <Button onClick={startDuel} className="w-full mt-4 bg-rose-700 hover:bg-rose-600 font-bold py-3">
                    INITIATE DUEL
                </Button>
            </div>
        )}

        {/* --- ACTIVE DUEL --- */}
        {duelState && (
            <div className="flex flex-col flex-grow z-10 relative">
                {/* Scoreboard */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-600 px-6 py-2 rounded-b-xl flex gap-8 font-mono text-sm shadow-xl z-20">
                    <div className="text-center">
                        <div className="text-rose-400 font-bold">{duelState.enemyScore}</div>
                        <div className="text-[10px] text-slate-500">ENEMY</div>
                    </div>
                    <div className="text-slate-600 font-bold text-lg">VS</div>
                    <div className="text-center">
                        <div className="text-cyan-400 font-bold">{duelState.playerScore}</div>
                        <div className="text-[10px] text-slate-500">YOU</div>
                    </div>
                </div>

                {/* Enemy Hand Area */}
                <div className="h-1/3 flex items-center justify-center gap-4 relative">
                    {duelState.enemyHand.map((card, i) => (
                        <div key={card.id} className={`transition-all duration-500 ${duelState.playedCardEnemy?.id === card.id ? 'translate-y-24 scale-110 z-20' : ''}`}>
                             <BattleCard 
                                card={card} 
                                isEnemy={true} 
                                isRevealed={duelState.playedCardEnemy?.id === card.id || duelState.phase === BattlePhase.VICTORY || duelState.phase === BattlePhase.DEFEAT} 
                            />
                        </div>
                    ))}
                    <div className="absolute top-2 left-2 text-xs text-rose-500 font-bold uppercase">{duelState.enemyName}</div>
                </div>

                {/* Center / Log Area */}
                <div className="h-1/3 flex items-center justify-center relative">
                     {duelState.phase === BattlePhase.VICTORY && (
                         <div className="text-center animate-fade-in-up z-30 bg-black/80 p-6 rounded-xl border-2 border-emerald-500">
                             <h2 className="text-4xl font-cinzel font-bold text-emerald-400 mb-2">VICTORY</h2>
                             <p className="text-slate-300 text-sm mb-4">Protocol Stabilized.</p>
                             <Button onClick={handleClaimReward} className="bg-emerald-600 hover:bg-emerald-500 w-full">CLAIM REWARD</Button>
                         </div>
                     )}
                     {duelState.phase === BattlePhase.DEFEAT && (
                         <div className="text-center animate-fade-in-up z-30 bg-black/80 p-6 rounded-xl border-2 border-rose-500">
                             <h2 className="text-4xl font-cinzel font-bold text-rose-500 mb-2">DEFEAT</h2>
                             <p className="text-slate-300 text-sm mb-4">Connection Severed.</p>
                             <Button onClick={handleClaimReward} className="bg-slate-600 hover:bg-slate-500 w-full">RETURN</Button>
                         </div>
                     )}
                     
                     {/* Combat Log Text */}
                     {duelState.phase !== BattlePhase.VICTORY && duelState.phase !== BattlePhase.DEFEAT && (
                         <div className="text-center w-full max-w-md">
                             <div className="bg-slate-900/80 border border-slate-700 p-3 rounded-lg text-sm font-cormorant italic text-slate-200 shadow-lg min-h-[60px] flex items-center justify-center">
                                 {duelState.logs[0]}
                             </div>
                         </div>
                     )}
                </div>

                {/* Player Hand Area */}
                <div className="h-1/3 flex items-end justify-center gap-4 pb-4 relative">
                     {duelState.playerHand.map((card) => (
                        <div key={card.id} className="transform hover:-translate-y-4 transition-transform duration-200">
                            <BattleCard 
                                card={card} 
                                onClick={() => handleCardPlay(card)}
                            />
                        </div>
                    ))}
                    {duelState.playedCardPlayer && (
                        <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 scale-110 z-20">
                             <BattleCard card={duelState.playedCardPlayer} isRevealed={true} />
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default ProtocolDuelPanel;
