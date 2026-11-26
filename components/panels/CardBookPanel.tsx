import React, { useMemo, useRef, useState } from 'react';
import type { SeekerProfile } from '../../types';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { seekerToKnowledgeCard } from '../../lib/nvk/contracts';
import { useNotifications } from '../../context/NotificationContext';

const MiniCard: React.FC<{
  profile: SeekerProfile;
  isActive: boolean;
  isParty: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onSetMain: () => void;
  onToggleParty: () => void;
  onEdit: () => void;
}> = ({ profile, isActive, isParty, isSelected, onSelect, onSetMain, onToggleParty, onEdit }) => {
  return (
    <motion.div
      layout
      onClick={onSelect}
      className={`relative rounded-xl border-2 p-1 bg-slate-900 overflow-hidden shadow-xl transition-all duration-300 cursor-pointer ${
        isActive
          ? 'border-amber-500 shadow-amber-500/20 ring-2 ring-amber-500/50'
          : isSelected
          ? 'border-cyan-400 ring-1 ring-cyan-400/50'
          : 'border-slate-700 hover:border-slate-500'
      }`}
    >
      <div className="aspect-[2.5/3.5] bg-black rounded-lg overflow-hidden relative group">
        {profile.avatarImageUrl ? (
          <img
            src={profile.avatarImageUrl}
            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
            alt={profile.name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600 text-4xl">
            <i className="ri-user-6-fill"></i>
          </div>
        )}

        {isActive && (
          <div className="absolute top-2 left-2 bg-amber-500 text-black text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest z-20">
            Prime
          </div>
        )}
        {isParty && !isActive && (
          <div className="absolute top-2 right-2 bg-indigo-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest z-20">
            Party
          </div>
        )}

        <div
          className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onSetMain}
            className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded uppercase"
          >
            Set Prime
          </button>
          <button
            onClick={onToggleParty}
            className={`w-full py-1.5 ${
              isParty ? 'bg-rose-700 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-500'
            } text-white text-[10px] font-bold rounded uppercase`}
          >
            {isParty ? 'Leave Party' : 'Join Party'}
          </button>
          <button
            onClick={onEdit}
            className="w-full py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white text-[10px] font-bold rounded uppercase"
          >
            Edit Shard
          </button>
        </div>
      </div>
      <div className="p-2">
        <div className="font-cinzel text-xs font-bold text-white truncate">{profile.name}</div>
        <div className="text-[9px] text-slate-400 font-mono uppercase truncate">
          {profile.race} • {profile.class}
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px]">
          <span className="text-emerald-400 font-mono">LVL {profile.level}</span>
          <span className="text-slate-500 font-mono">{profile.experience} XP</span>
        </div>
      </div>
    </motion.div>
  );
};

interface CardBookPanelProps {
  profiles: SeekerProfile[];
  activeProfileId: string | null;
  partyIds: string[];
  onSetMain: (id: string) => void;
  onToggleParty: (id: string) => void;
  onManifestNew: () => void;
  onEditProfile?: (profile: SeekerProfile) => void;
  onDeleteProfile?: (id: string) => void;
  onImportShard?: (file: File) => Promise<void>;
  addEchoMessage: (s: string, t: string, c?: string) => void;
}

const CardBookPanel: React.FC<CardBookPanelProps> = ({
  profiles,
  activeProfileId,
  partyIds,
  onSetMain,
  onToggleParty,
  onManifestNew,
  onEditProfile,
  onDeleteProfile,
  onImportShard,
  addEchoMessage,
}) => {
  const [filter, setFilter] = useState<'all' | 'party'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [inspectedId, setInspectedId] = useState<string | null>(activeProfileId || profiles[0]?.id || null);
  const shardInputRef = useRef<HTMLInputElement>(null);
  const { confirmDialog, notify } = useNotifications();

  const availableClasses = useMemo(() => {
    const classes = Array.from(new Set(profiles.map((p) => p.class).filter(Boolean)));
    return classes.sort();
  }, [profiles]);

  const visibleProfiles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return profiles.filter((p) => {
      if (filter === 'party' && !partyIds.includes(p.id) && p.id !== activeProfileId) {
        return false;
      }
      if (selectedClass !== 'ALL' && p.class !== selectedClass) {
        return false;
      }
      if (!q) return true;
      const searchable = [
        p.name,
        p.race,
        p.class,
        p.energyAlignment,
        p.faction || '',
        ...(p.selfTraits || []),
        ...(p.codexTraits || []),
      ]
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    });
  }, [profiles, filter, partyIds, activeProfileId, selectedClass, searchQuery]);

  const inspectedProfile = useMemo(
    () => profiles.find((p) => p.id === inspectedId) || visibleProfiles[0] || null,
    [profiles, inspectedId, visibleProfiles]
  );

  const inspectedKnowledgeCard = useMemo(
    () => (inspectedProfile ? seekerToKnowledgeCard(inspectedProfile, profiles, partyIds) : null),
    [inspectedProfile, profiles, partyIds]
  );

  const handleExportShard = (profile: SeekerProfile) => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `Seeker_Shard_${profile.name.replace(/\s+/g, '_')}.json`);
    link.click();
    addEchoMessage('System', `Exported Seeker Shard: ${profile.name}`, 'text-indigo-300');
    notify(`Exported Seeker Shard for ${profile.name}.`, 'success');
  };

  const handleDelete = async (profile: SeekerProfile) => {
    if (!onDeleteProfile) return;
    const ok = await confirmDialog({
      title: 'Archive Seeker Shard',
      message: `Remove "${profile.name}" from your Card Book collection? Export a JSON shard first if you want a backup.`,
      confirmLabel: 'Remove Shard',
      destructive: true,
    });
    if (ok) {
      onDeleteProfile(profile.id);
      notify(`Removed ${profile.name} from Card Book.`, 'info');
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-slate-950/40 p-4 md:p-6 gap-5">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-2xl text-indigo-400 shadow-lg">
            <i className="ri-book-2-line"></i>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-white tracking-widest uppercase">
              The Card Book
            </h2>
            <p className="text-xs font-mono text-slate-400 uppercase tracking-widest">
              NVK Seeker Knowledge Archive // {profiles.length} Shards Bound
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filter === 'all' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              COLLECTION ({profiles.length})
            </button>
            <button
              onClick={() => setFilter('party')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filter === 'party' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              PARTY ({Array.from(new Set([...partyIds, ...(activeProfileId ? [activeProfileId] : [])])).length})
            </button>
          </div>

          {onImportShard && (
            <>
              <Button
                onClick={() => shardInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-600 py-2.5 px-4 text-xs font-mono tracking-wider rounded-xl"
              >
                <i className="ri-upload-2-line mr-1.5"></i>IMPORT SHARD
              </Button>
              <input
                ref={shardInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await onImportShard(file);
                  }
                  if (shardInputRef.current) shardInputRef.current.value = '';
                }}
              />
            </>
          )}

          <Button
            onClick={onManifestNew}
            className="bg-emerald-600 hover:bg-emerald-500 py-2.5 px-5 font-cinzel font-bold text-xs tracking-widest rounded-xl shadow-xl"
          >
            + MANIFEST SHARD
          </Button>
        </div>
      </header>

      {/* Search & Class Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-grow">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search seekers by name, race, class, trait, or faction..."
            className="w-full bg-slate-900/70 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          aria-label="Filter by Seeker Class"
          className="bg-slate-900/70 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Archetypes</option>
          {availableClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Main Split: Card Grid + Selected Knowledge Card Inspector */}
      <div className="flex-grow min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-5 overflow-hidden">
        <div className="xl:col-span-8 overflow-y-auto custom-scrollbar pr-2 min-h-0">
          <AnimatePresence mode="popLayout">
            <motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" layout>
              {visibleProfiles.map((profile) => (
                <MiniCard
                  key={profile.id}
                  profile={profile}
                  isActive={profile.id === activeProfileId}
                  isParty={partyIds.includes(profile.id) || profile.id === activeProfileId}
                  isSelected={inspectedProfile?.id === profile.id}
                  onSelect={() => setInspectedId(profile.id)}
                  onSetMain={() => onSetMain(profile.id)}
                  onToggleParty={() => onToggleParty(profile.id)}
                  onEdit={() => onEditProfile?.(profile)}
                />
              ))}
              {visibleProfiles.length === 0 && (
                <div className="col-span-full h-56 flex flex-col items-center justify-center text-slate-500 italic">
                  <i className="ri-ghost-line text-5xl mb-3 opacity-30"></i>
                  <p className="text-sm">No Seeker Shards match this filter.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Selected Knowledge Card Inspector */}
        <aside className="xl:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {inspectedProfile && inspectedKnowledgeCard ? (
            <>
              <div className="flex justify-between items-start gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-cinzel font-bold text-lg text-white">{inspectedKnowledgeCard.title}</h3>
                  <p className="text-[11px] font-mono text-indigo-300 uppercase">{inspectedKnowledgeCard.subtitle}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-200">
                  LVL {inspectedKnowledgeCard.metrics.level}
                </span>
              </div>

              <p className="text-xs font-cormorant italic text-slate-300 leading-relaxed">
                {inspectedKnowledgeCard.summary}
              </p>

              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
                  <div className="text-rose-400 font-bold">{inspectedKnowledgeCard.metrics.atk}</div>
                  <div className="text-[9px] text-slate-500">ATK</div>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
                  <div className="text-sky-400 font-bold">{inspectedKnowledgeCard.metrics.def}</div>
                  <div className="text-[9px] text-slate-500">DEF</div>
                </div>
                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-2">
                  <div className="text-purple-400 font-bold">{inspectedKnowledgeCard.metrics.res}</div>
                  <div className="text-[9px] text-slate-500">RES</div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Knowledge Tags ({inspectedKnowledgeCard.tags.length})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {inspectedKnowledgeCard.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Linked Records ({inspectedKnowledgeCard.relationships.length})
                </h4>
                {inspectedKnowledgeCard.relationships.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No party, faction, or equipped artifact links yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {inspectedKnowledgeCard.relationships.map((rel) => (
                      <div
                        key={`${rel.relationType}-${rel.targetId}`}
                        className="flex justify-between items-center text-[11px] bg-slate-950/60 border border-slate-800 rounded-lg px-2.5 py-1.5"
                      >
                        <span className="text-slate-200 truncate">{rel.targetName}</span>
                        <span className="text-[9px] font-mono text-cyan-400 uppercase shrink-0 ml-2">
                          {rel.relationType}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800 mt-auto">
                {onEditProfile && (
                  <button
                    onClick={() => onEditProfile(inspectedProfile)}
                    className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    <i className="ri-edit-line mr-1"></i>Edit in Loom
                  </button>
                )}
                <button
                  onClick={() => handleExportShard(inspectedProfile)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  <i className="ri-download-line mr-1"></i>Export JSON
                </button>
                {onDeleteProfile && profiles.length > 1 && (
                  <button
                    onClick={() => handleDelete(inspectedProfile)}
                    className="py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold border border-rose-500/30"
                    title="Remove Seeker Shard"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
              Select a Seeker Card to inspect its knowledge metadata and linked records.
            </div>
          )}
        </aside>
      </div>

      <footer className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 flex items-center gap-3 text-xs font-mono text-slate-400">
        <i className="ri-information-line text-lg text-indigo-400 shrink-0"></i>
        <span>
          Your Prime Seeker sets global resonance; Party shards and equipped relics form linked NVK knowledge records.
        </span>
      </footer>
    </div>
  );
};

export default CardBookPanel;
