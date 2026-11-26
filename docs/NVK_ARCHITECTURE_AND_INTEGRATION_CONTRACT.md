# NVK Legacy System Recovery — Architecture & Ecosystem Integration Contract

**Canonical Identity:** `NVK = Network • Visualize • Knowledge`  
**Operating Principle:** *Preserve what works. Recover what was abandoned. Modernize what is outdated. Never fake capabilities.*  
**Application Scope:** `Remix: 🜂 NVKΔ.RPG 🜂` (Tri-Sophian Codex)  

---

## 1. Executive Summary & Ecosystem Positioning

This document defines the recovered architecture and formal integration boundaries of the **Tri-Sophian Codex** client application inside the **NVK Global** ecosystem.

The application is structured as a **local-first, modular React 19 + TypeScript SPA** backed by IndexedDB (`CodexDriftDatabase` / `driftDB` via Dexie v5). Its core workflows combine:
1. **Network (`N`)** — Multi-agent simulation matrices, Faction/Community resonance views, optional EIP-1193 browser wallet sign-in + EIP-191 off-chain Soul Seal attestations, and replaceable AI inference providers (Open Pollinations, Local Ollama node, Offline Sovereign Procedural Engine, or user-supplied BYOK Gemini).
2. **Visualize (`V`)** — Three.js + SVG/Canvas procedural visualizers, the interactive SVG Ritual Activation Loom, Seeker Aura telemetry, Crystal & Sacred Geometry explorers, and procedural geometric SVG emblem rendering.
3. **Knowledge (`K`)** — **Seeker Cards** (full character/identity knowledge shards with equipment, traits, faction/party relationship graphs, search/filter, import/export, and Grimoire editing), VectorMemory IndexedDB table, Chronicle Save Slots, and Echo Logs.

---

## 2. Capability & Status Taxonomy

Every subsystem in this repository is explicitly classified into one of four honest tiers:

| Status | Meaning |
| :--- | :--- |
| **`implemented`** | Real, end-to-end executable functionality working inside the running browser application. |
| **`simulated-local`** | Interactive deterministic/local sandbox logic or procedural visual/numeric modeling executing client-side (labeled cleanly as local/sandbox). |
| **`external-optional`** | Real integration that activates when the user supplies an external dependency (local Ollama server on `:11434`, EIP-1193 browser wallet like MetaMask, WebSpeech API, or BYOK Gemini API key). |
| **`planned`** | Documented TypeScript integration interfaces (`lib/nvk/contracts.ts`) prepared for future NVK Global Nexus, CODEXA, NVK SSO, or EVM smart-contract indexing. |

### Subsystem Recovery Inventory

| Subsystem | Prior State | Recovered / Modernized State | Classification |
| :--- | :--- | :--- | :--- |
| **Chronicle Persistence (`useCodexPersistence.ts`, `db.ts`)** | `AllProfiles` and `PartyIds` dropped silently during snapshot save (`switch` omitted cases); `importSave` relied on fragile unvalidated casts and forced reloads; `alert()` used on export. | Fixed `buildSnapshotForTargets` to persist `AllProfiles` and `PartyIds`; added schema validation + XSS sanitization (`validateGameSave`, `validateSeekerShard`); non-blocking UI restoration & structured `{ ok, message }` results. | `implemented` |
| **Seeker Cards (`CardBookPanel.tsx`, `SeekerProfileWeaverPanel.tsx`)** | Partial read-only grid; missing `activeTab === 'grimoire'` UI; no search, relationship graph, delete, shard import, or edit workflow wired from Card Book. | Recovered into first-class **NVK Knowledge Cards** (`seekerToKnowledgeCard`): search + archetype filter, relationship inspector (`party-ally`, `faction-kin`, `equipped-relic`), completed Grimoire equipment & trait editor, Edit-in-Loom wiring, JSON shard export/import, and delete confirmation. | `implemented` |
| **System Modules & Modals (`App.tsx`, `SystemModulesPanel.tsx`)** | Only 3 of 33 `SystemModulesPanel` IDs were rendered; `OracleSanctumModal`, `RitualAlchemyResultsModal`, `RitualRewriteSuggestionsModal`, and `SeekerProfileWeaverPanel` were orphaned. | All 33 `SystemModulesPanel` module IDs plus `card_book`, `seeker_weaver`, `agent_chat`, and all 3 orphaned modals wired in `App.tsx` inside `<ErrorBoundary>`. | `implemented` |
| **AI Orchestration (`lib/ai/providerAdapter.ts`, `GeminiIntegrationContext.tsx`, `SovereignKernel.ts`)** | `vite.config.ts` leaked `GEMINI_API_KEY` into client bundle; deprecated `gemini-3*` strings; `ollama-local` had dead execution falling straight through to mock; `SovereignKernel` threw `"Oracle Link Offline"` offline; Unsplash links broke in sandboxes. | Removed `vite.config.ts` secret injection; centralized provider routing into `lib/ai/providerAdapter.ts` with real Ollama `POST /api/chat`, Pollinations zero-key inference, deterministic offline procedural reasoning + inline SVG artwork (`generateProceduralSvgArtwork`), and BYOK Gemini (`gemini-2.5-flash` / `gemini-2.5-pro`). | `implemented` / `external-optional` |
| **Sovereign Workspace (`ChatNVKPanel.tsx`, `SovereignKernel.ts`)** | Falsely claimed an ephemeral `"Firecracker VM"` and booted simulated terminal strings as VM infrastructure. | Accurately identifies and mounts an isolated IndexedDB Virtual Workspace (`driftDB`) with full offline research/planning/fusion support. | `implemented` (Virtual Workspace) / `simulated-local` |
| **Web3 Portal (`CryptoNexusPanel.tsx`, `Web3Context.tsx`)** | Fabricated random ETH/FLUX balances (`Math.random()`); labeled `personal_sign` as `"MINT GENESIS SOUL NFT"`. | Real EIP-1193 wallet connection + honest `"RPC Unavailable"` when provider/RPC read is absent; Soul Seal honestly scoped and labeled as **EIP-191 off-chain `personal_sign` attestation (no gas)**. | `external-optional` |
| **Community Resonance (`CommunityResonancePanel.tsx`)** | Displayed `10000 + Math.random()` fake online seekers and `● LIVE` ticker. | Explicitly marked `LOCAL SANDBOX SIM` / `SIM FEED:` representing local sandbox resonance streams. | `simulated-local` |
| **UX Safety & Dialogs (`NotificationContext.tsx`, `DialogHost.tsx`, `ErrorBoundary.tsx`)** | 11 blocking `window.alert`/`confirm`/`prompt` calls breaking iFrame constraints; missing `/index.css`. | Replaced all native browser dialogs with non-blocking toast notifications and async Confirm/Prompt modal dialogs; added `/index.css` keyframes and global `<ErrorBoundary>`. | `implemented` |

---

## 3. NVK Ecosystem Integration Contracts (`lib/nvk/contracts.ts`)

All cross-system boundaries are defined as strict TypeScript interfaces inside `/lib/nvk/contracts.ts`.

### A. NVK Global Nexus Event Bus (`NvkNexusEvent`)
- **Purpose:** Standardized event envelope for emitting domain telemetry (`seeker.updated`, `seeker.manifested`, `ritual.activated`, `artifact.created`, `attestation.signed`) from local panels to an external NVK Global Nexus host or postMessage bridge.
- **Status Today:** Typed contract (`NvkNexusEvent`) + local Echo Log recording (`implemented`); remote Nexus WebSocket/HTTP transport (`planned`).

### B. CODEXA AI Execution Architecture (`CodexaInferenceRequest`, `CodexaInferenceResponse`, `CodexaExecutionReceipt`)
- **Purpose:** Decouples UI workflows from specific LLM/image/speech vendors (`Gemini`, `Ollama`, `Pollinations`, `nvk-local-neural`, or future CODEXA gateways).
- **Execution Chain (`lib/ai/providerAdapter.ts`):**
  1. **Explicit Local Procedural (`nvk-local-neural`)**: Runs `SovereignProceduralAI.ts` deterministically offline.
  2. **Google Gemini BYOK**: Used when user supplies an API key in AI Settings (with `normalizeModelId()` mapping legacy `gemini-3*` identifiers to `gemini-2.5-*`).
  3. **Local Ollama Node (`http://localhost:11434/api/chat`)**: Direct client-to-localhost REST integration (`ollama-local` or custom model tags).
  4. **Pollinations Open Inference**: Zero-key fallback (`pollinations-openai`, `pollinations-deepseek`, `pollinations-mistral`, `pollinations-qwen`) when online.
  5. **Guaranteed Offline Fallback**: Automatically drops to `executeProceduralReasoning()` + `generateProceduralSvgArtwork()` so workflows never deadlock without keys or network access.

### C. NVK Identity & Authorization (`NvkIdentityProfile`, `toNvkIdentityProfile`)
- **Current Auth Modes:**
  - `local-shard`: Sovereign client-side Seeker identity stored in IndexedDB (`driftDB`).
  - `eip1193-wallet`: Optional connected EVM address + chainId bound via `Web3Context`.
  - `nvk-sso-planned`: Reserved interface field for federated NVK Global authentication.
- **Security Rules:** Zero API keys or private credentials bundled into Vite build outputs (`vite.config.ts`); imported JSON payloads run through `validateSeekerShard` and `validateGameSave` with prototype-pollution key stripping (`__proto__`, `constructor`, `prototype`) and image URL protocol sanitization (`sanitizeImageUrl`, rejecting `javascript:`, `vbscript:`, and `<script`/`onload=`/`onerror=` inside SVG data URIs).

### D. Knowledge & Memory Integration (`NvkKnowledgeCard`, `NvkCardRelationship`, `seekerToKnowledgeCard`)
- Converts any legacy `SeekerProfile` into an interoperable **NVK Knowledge Card** containing:
  - Normalized combat/conceptual metrics (`level`, `experience`, `flux`, `atk`, `def`, `res`).
  - Tag index synthesized from `race`, `class`, `energyAlignment`, `faction`, `selfTraits`, and `codexTraits`.
  - Typed relationship edges (`party-ally`, `faction-kin`, `equipped-relic`, `authored-artifact`) consumed by `CardBookPanel`'s inspector and ready for external graph/RAG synchronization.

### E. Tri-Sophian Codex Blockchain Infrastructure (`NvkChainAttestationReceipt`)
- **Current Reality (`external-optional`):** Uses EIP-1193 `personal_sign` (EIP-191) via the user's connected wallet to produce a verifiable cryptographic off-chain attestation statement (`mode: 'offchain-personal-sign'`) stored on the local `SeekerProfile` (`inventory` relic + wallet metadata) without fabricating gas transactions or claiming on-chain ERC-721 minting.
- **Future Extension (`planned`):** Receipt structure (`signerAddress`, `chainId`, `subjectId`, `statement`, `signature`, `timestamp`) is structured for optional submission to an on-chain NVK Attestation Registry or indexing relayer once deployed.

---

## 4. Local Development & Verification Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server on port 3000
npm test             # Run Vitest unit, persistence, security, and adapter tests
npm run lint         # Run TypeScript type checking (tsc)
npm run build        # Build production bundle to dist/
```
