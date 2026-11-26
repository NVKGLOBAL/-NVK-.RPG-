import {
  ArtifactRarity,
  SeekerAvatarType,
  SeekerClass,
  SeekerEnergyAlignment,
  SeekerGender,
  SeekerVisualFilter,
  SeekerAuraColor,
  type CodexArtifact,
  type CodexStateSnapshot,
  type GameSaveData,
  type SeekerProfile,
} from "../../types";

/**
 * NVK Global Integration Contract
 * Canonical identity: NVK = Network • Visualize • Knowledge
 */

export type NvkCapabilityStatus =
  | "implemented"
  | "simulated-local"
  | "external-optional"
  | "planned";

export interface NvkModuleDescriptor {
  id: string;
  label: string;
  domain: "network" | "visualize" | "knowledge" | "ai-orchestration" | "attestation";
  status: NvkCapabilityStatus;
  offlineCapable: boolean;
}

export interface NvkIdentityProfile {
  nvkSubjectId: string;
  displayName: string;
  authMode: "local-shard" | "eip1193-wallet" | "nvk-sso-planned";
  walletAddress?: string;
  chainId?: number;
  faction?: string;
}

export interface NvkCardRelationship {
  targetId: string;
  targetName: string;
  relationType: "party-ally" | "faction-kin" | "equipped-relic" | "authored-artifact";
  strength: number;
}

export interface NvkKnowledgeCard {
  id: string;
  kind: "seeker-card";
  title: string;
  subtitle: string;
  summary: string;
  tags: string[];
  rarity: ArtifactRarity;
  metrics: {
    level: number;
    experience: number;
    flux: number;
    atk: number;
    def: number;
    res: number;
  };
  relationships: NvkCardRelationship[];
  updatedAt: number;
}

export interface CodexaInferenceRequest {
  requestId: string;
  capability: "text" | "image" | "embedding" | "speech" | "workflow";
  prompt: string;
  systemInstruction?: string;
  preferredModelId?: string;
  responseFormat?: "text/plain" | "application/json";
  seekerContextId?: string;
}

export interface CodexaExecutionReceipt {
  requestId: string;
  providerUsed: string;
  modelUsed: string;
  fallbackUsed: boolean;
  offline: boolean;
  timestamp: number;
}

export interface CodexaInferenceResponse {
  receipt: CodexaExecutionReceipt;
  outputText?: string;
  outputUrl?: string;
  embedding?: number[];
}

export interface NvkNexusEvent {
  eventId: string;
  sourceModule: string;
  topic: "seeker.updated" | "seeker.manifested" | "ritual.activated" | "artifact.created" | "attestation.signed";
  timestamp: number;
  payloadSummary: string;
  metadata?: Record<string, unknown>;
}

export interface NvkChainAttestationReceipt {
  mode: "offchain-personal-sign";
  signerAddress: string;
  chainId: number | null;
  subjectId: string;
  statement: string;
  signature: string;
  timestamp: number;
}

export function sanitizeImageUrl(url: unknown): string {
  if (typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("data:image/")) {
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith("data:image/png;") ||
      lower.startsWith("data:image/jpeg;") ||
      lower.startsWith("data:image/jpg;") ||
      lower.startsWith("data:image/webp;") ||
      lower.startsWith("data:image/gif;") ||
      lower.startsWith("data:image/svg+xml;")
    ) {
      // Disallow embedded script tags inside SVG data URIs
      if (lower.includes("<script") || lower.includes("onload=") || lower.includes("onerror=")) {
        return "";
      }
      return trimmed;
    }
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    return "";
  }
  return "";
}

function stripDangerousKeys<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => stripDangerousKeys(item)) as unknown as T;
  }
  if (input && typeof input === "object") {
    const clean: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      clean[key] = stripDangerousKeys(val);
    }
    return clean as T;
  }
  return input;
}

export function validateSeekerShard(
  raw: unknown
): { valid: true; profile: SeekerProfile } | { valid: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, error: "Seeker shard must be a valid JSON object." };
  }

  const obj = stripDangerousKeys(raw as Record<string, unknown>);
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  if (!name) {
    return { valid: false, error: "Seeker shard requires a non-empty 'name' field." };
  }

  // Reject if a full save bundle was mistakenly passed to shard validator
  if (obj.fullState && obj.slotId) {
    return { valid: false, error: "Object appears to be a full Chronicle Save rather than a single Seeker Shard." };
  }

  const safeNumber = (v: unknown, fallback: number, min = 0) =>
    typeof v === "number" && Number.isFinite(v) ? Math.max(min, v) : fallback;

  const safeStringArray = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).slice(0, 64) : [];

  const profile: SeekerProfile = {
    id: typeof obj.id === "string" && obj.id.trim() ? obj.id.trim() : `seeker-import-${Date.now()}`,
    generatedAt: safeNumber(obj.generatedAt, Date.now(), 0),
    level: safeNumber(obj.level, 1, 1),
    experience: safeNumber(obj.experience, 0, 0),
    flux: safeNumber(obj.flux, 100, 0),
    inventory: Array.isArray(obj.inventory) ? (obj.inventory.filter((i) => i && typeof i === "object") as SeekerProfile["inventory"]) : [],
    selfTraits: safeStringArray(obj.selfTraits),
    codexTraits: safeStringArray(obj.codexTraits),
    name: name.slice(0, 80),
    race: (typeof obj.race === "string" ? obj.race : SeekerAvatarType.Human) as SeekerAvatarType,
    class: (typeof obj.class === "string" ? obj.class : SeekerClass.Gatewalker) as SeekerClass,
    gender: (typeof obj.gender === "string" ? obj.gender : SeekerGender.NonBinary) as SeekerGender,
    age: typeof obj.age === "number" && Number.isFinite(obj.age) ? obj.age : undefined,
    bodyType: typeof obj.bodyType === "string" ? (obj.bodyType as SeekerProfile["bodyType"]) : undefined,
    eyeColor: typeof obj.eyeColor === "string" ? obj.eyeColor.slice(0, 32) : undefined,
    hairColor: typeof obj.hairColor === "string" ? obj.hairColor.slice(0, 32) : undefined,
    skinTone: typeof obj.skinTone === "string" ? obj.skinTone.slice(0, 32) : undefined,
    energyAlignment: (typeof obj.energyAlignment === "string"
      ? obj.energyAlignment
      : SeekerEnergyAlignment.Balanced) as SeekerEnergyAlignment,
    auraColor: (typeof obj.auraColor === "string" ? obj.auraColor : SeekerAuraColor.Azure) as SeekerAuraColor,
    auraSecondaryColor: (typeof obj.auraSecondaryColor === "string"
      ? obj.auraSecondaryColor
      : SeekerAuraColor.Violet) as SeekerAuraColor,
    visualFilter: (typeof obj.visualFilter === "string"
      ? obj.visualFilter
      : SeekerVisualFilter.Standard) as SeekerVisualFilter,
    avatarImageUrl: sanitizeImageUrl(obj.avatarImageUrl),
    bio: typeof obj.bio === "string" ? obj.bio.slice(0, 2000) : "An imported Seeker Shard.",
    equippedWeapon: obj.equippedWeapon && typeof obj.equippedWeapon === "object" ? (obj.equippedWeapon as SeekerProfile["equippedWeapon"]) : undefined,
    equippedCompanion: obj.equippedCompanion && typeof obj.equippedCompanion === "object" ? (obj.equippedCompanion as SeekerProfile["equippedCompanion"]) : undefined,
    equippedRelic: obj.equippedRelic && typeof obj.equippedRelic === "object" ? (obj.equippedRelic as SeekerProfile["equippedRelic"]) : undefined,
    equippedOutfit: obj.equippedOutfit && typeof obj.equippedOutfit === "object" ? (obj.equippedOutfit as SeekerProfile["equippedOutfit"]) : undefined,
    faction: typeof obj.faction === "string" ? (obj.faction as SeekerProfile["faction"]) : undefined,
    walletAddress: typeof obj.walletAddress === "string" ? obj.walletAddress.slice(0, 64) : undefined,
    chainId: typeof obj.chainId === "number" && Number.isFinite(obj.chainId) ? obj.chainId : undefined,
  };

  return { valid: true, profile };
}

export function validateGameSave(
  raw: unknown
): { valid: true; save: GameSaveData } | { valid: false; error: string } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { valid: false, error: "Chronicle save must be a JSON object." };
  }

  const obj = stripDangerousKeys(raw as Record<string, unknown>);
  if (!obj.fullState || typeof obj.fullState !== "object" || Array.isArray(obj.fullState)) {
    return { valid: false, error: "Save file is missing a valid 'fullState' payload." };
  }

  const fs = obj.fullState as Record<string, unknown>;
  const sanitizedProfiles: SeekerProfile[] = [];
  if (Array.isArray(fs.allProfiles)) {
    for (const p of fs.allProfiles) {
      const checked = validateSeekerShard(p);
      if (checked.valid) sanitizedProfiles.push(checked.profile);
    }
  }

  let sanitizedActive: SeekerProfile | null = null;
  if (fs.activeProfile) {
    const checked = validateSeekerShard(fs.activeProfile);
    if (checked.valid) sanitizedActive = checked.profile;
  }

  const sanitizedArtifacts: CodexArtifact[] = Array.isArray(fs.artifacts)
    ? (fs.artifacts.filter((a) => a && typeof a === "object") as CodexArtifact[]).map((a) => ({
        ...a,
        imageUrl: sanitizeImageUrl(a.imageUrl),
      }))
    : [];

  const fullState: CodexStateSnapshot = {
    echoLog: Array.isArray(fs.echoLog) ? (fs.echoLog.slice(0, 200) as CodexStateSnapshot["echoLog"]) : [],
    systemEntropy:
      typeof fs.systemEntropy === "number" && Number.isFinite(fs.systemEntropy)
        ? Math.max(0, Math.min(1, fs.systemEntropy))
        : 0.1,
    ritualState: fs.ritualState && typeof fs.ritualState === "object" ? fs.ritualState : undefined,
    artifacts: sanitizedArtifacts,
    activeProfile: sanitizedActive,
    allProfiles: sanitizedProfiles,
    partyIds: Array.isArray(fs.partyIds)
      ? fs.partyIds.filter((id): id is string => typeof id === "string")
      : [],
    rpgState: fs.rpgState && typeof fs.rpgState === "object" ? (fs.rpgState as CodexStateSnapshot["rpgState"]) : undefined,
  };

  const previewRaw = (obj.previewData && typeof obj.previewData === "object"
    ? obj.previewData
    : {}) as Record<string, unknown>;

  const save: GameSaveData = {
    slotId: typeof obj.slotId === "string" && obj.slotId.trim() ? obj.slotId : "imported_save",
    timestamp: typeof obj.timestamp === "number" && Number.isFinite(obj.timestamp) ? obj.timestamp : Date.now(),
    previewData: {
      seekerName:
        typeof previewRaw.seekerName === "string" && previewRaw.seekerName.trim()
          ? previewRaw.seekerName
          : sanitizedActive?.name || sanitizedProfiles[0]?.name || "Imported Seeker",
      level: typeof previewRaw.level === "number" ? previewRaw.level : sanitizedActive?.level || 1,
      location: typeof previewRaw.location === "string" ? previewRaw.location : "The Void",
      playtime: typeof previewRaw.playtime === "string" ? previewRaw.playtime : new Date().toLocaleTimeString(),
    },
    fullState,
  };

  return { valid: true, save };
}

export function toNvkIdentityProfile(profile: SeekerProfile): NvkIdentityProfile {
  return {
    nvkSubjectId: profile.id,
    displayName: profile.name,
    authMode: profile.walletAddress ? "eip1193-wallet" : "local-shard",
    walletAddress: profile.walletAddress,
    chainId: profile.chainId,
    faction: profile.faction,
  };
}

export function seekerToKnowledgeCard(
  profile: SeekerProfile,
  allProfiles: SeekerProfile[] = [],
  partyIds: string[] = []
): NvkKnowledgeCard {
  const relationships: NvkCardRelationship[] = [];

  for (const allyId of partyIds) {
    if (allyId === profile.id) continue;
    const ally = allProfiles.find((p) => p.id === allyId);
    if (ally) {
      relationships.push({
        targetId: ally.id,
        targetName: ally.name,
        relationType: "party-ally",
        strength: 0.9,
      });
    }
  }

  if (profile.faction) {
    for (const peer of allProfiles) {
      if (peer.id !== profile.id && peer.faction === profile.faction && !partyIds.includes(peer.id)) {
        relationships.push({
          targetId: peer.id,
          targetName: peer.name,
          relationType: "faction-kin",
          strength: 0.6,
        });
      }
    }
  }

  const equipped = [
    profile.equippedWeapon,
    profile.equippedOutfit,
    profile.equippedRelic,
    profile.equippedCompanion,
  ];
  for (const item of equipped) {
    if (item) {
      relationships.push({
        targetId: item.id,
        targetName: item.name,
        relationType: "equipped-relic",
        strength: 0.75,
      });
    }
  }

  const tags = Array.from(
    new Set([
      profile.race,
      profile.class,
      profile.energyAlignment,
      ...(profile.faction ? [profile.faction] : []),
      ...(profile.selfTraits || []),
      ...(profile.codexTraits || []),
    ])
  );

  return {
    id: profile.id,
    kind: "seeker-card",
    title: profile.name,
    subtitle: `${profile.race} • ${profile.class}`,
    summary: profile.bio || `A ${profile.energyAlignment} ${profile.race} wandering the Codex.`,
    tags,
    rarity: ArtifactRarity.Legendary,
    metrics: {
      level: profile.level,
      experience: profile.experience,
      flux: profile.flux,
      atk: Math.floor(profile.level * 10 + profile.flux / 100),
      def: Math.floor(profile.level * 8 + profile.inventory.length * 2),
      res: Math.floor(profile.level * 12 + 5),
    },
    relationships,
    updatedAt: profile.generatedAt,
  };
}
