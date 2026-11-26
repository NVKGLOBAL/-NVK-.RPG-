# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Project: Remix: 🜂 NVKΔ.RPG 🜂 — The Tri-Sophian Codex Edition

---

## 🜂 The Pitch: What makes this project unique?

`Remix: 🜂 NVKΔ.RPG 🜂` is not just another role-playing character creator—it is a **unified, high-fidelity trans-human portal** that bridges decentralized Web3 sovereign identity with state-of-the-art multimodal AI engines and sensory-immersive UI architectures. It is designed to be the ultimate sandbox where high-concept cosmic lore meets real-world cryptographic proof.

### Why should people use it?
1. **True Convergence of AI & Web3**: Instead of separate tech silos, the app fuses MetaMask browser wallet states (`window.ethereum`) with the local Sovereign Procedural Engine and zero-key open inference. Connecting your wallet instantly synchronizes cryptographic data to your character card, letting you sign occult, cybernetic agreements (`personal_sign`) with absolute security, and minting certified character "Soul Seals" locally to unlock real visual game badges.
2. **Instant Gratification via "⚡ Instant Manifest"**: Traditional onboarding takes time. With our Instant Manifestation feature, users can experience a 1-click randomized bypass that immediately kicks off a synchronous dual-API loop—crafting unique custom-woven backgrounds via local procedural text generation AND rendering custom RPG portraits using local procedural SVG art in seconds.
3. **Immersive Sensory Architecture**: Leveraging a physics-based coordinate-responsive Canvas (the Mutator Loom) and an algorithmic, entropy-tracked sound engine, every click, hover, and level-up resonates with customizable acoustic frequencies and dynamic visual feedback.
4. **Resilient Multimodal Design**: The backend architecture implements a robust model-mapping proxy that automatically routes legacy/deprecated model ids (including old Gemini ids) to the offline Sovereign Procedural Engine, guaranteeing a seamless, zero-crash, and highly responsive user experience with no API keys.

---

### 1. Architectural Vision & Aesthetic Paradigm

`Remix: 🜂 NVKΔ.RPG 🜂` is a high-fidelity, multimodal RPG simulation sandbox powered by state-of-the-art AI. The system stands as a synthesis of **occult mysticism**, **trans-human cybernetics**, and **algorithmic entropy models**. 

The narrative and visual core centres around the **Tri-Sophian Codex**—a celestial interface for simulating, warping, and calibrating high-concept cosmic vessels (Seekers).

#### 1.1 Aesthetic Anchors
* **Dominant Colorway**: Crimson shadows, deep obsidian grays, radiant golds (`amber-500`), and electrical indigoid neon glows.
* **Graphic Frame Systems**: Heavy baroque borders overlaid with clean digital telemetry rails, golden grid frameworks, and holographic sheen textures.
* **Typographic Pairings**:
  * **Headings**: `Cinzel` / `Outfit` / `Space Grotesk` (Tech-mystic display fonts).
  * **Body Copy**: `Inter` (high readability neutral sans-serif).
  * **Code & Diagnostics**: `JetBrains Mono` / `Fira Code` (Brutalist monospace style).
  * **Descriptions**: `Cormorant Garamond` (Elegant serif italic prose).

---

### 2. Functional Architecture & Core Subsystems

```
                               +-----------------------------+
                               |     Tri-Sophian System      |
                               |    Boot / Onboarding Flow   |
                               +--------------+--------------+
                                              |
                                              v
                              +---------------+---------------+
                              |    Durable SQLite/Dexie DB    |
                              |      State Persistence        |
                              +---------------+---------------+
                                              |
                                              v
      +------------------+------------+-------+-------+------------+-----------------+
      |                  |            |               |            |                 |
      v                  v            v               v            v                 v
+-----------+     +------------+ +----------+   +-----------+ +----------+     +------------+
|  Mutator  |     | EchoScribe | | Spiral-  |   |   Agent   | |  Axiom   |     | Resonance  |
|   Loom    |     | Chat Panel | |  Thread  |   | Simulation| | Resonance|     | Diagnostics|
|   Panel   |     | (GenAI-3.5)| |   Map    |   |  Sandbox  | |  Codex   |     |   Panel    |
+-----------+     +------------+ +----------+   +-----------+ +----------+     +------------+
```

---

### 3. Detailed Component Specifications

#### 3.1 Seeker Calibration & Vessel Manifestation (Onboarding)
Before embarking into the Codex, a user constructs a customized "Seeker" through a high-precision, interactive onboarding funnel (`OnboardingFunnel.tsx`):

* **Nameless Void Entry**: Random glyph name calibration via custom visual tickers and an alchemical string generator.
* **Frame Architecture (Body Layout)**: Over fifty (50) creative, bespoke somatic categories spanning organic, cybernetic, gaseous, and energetic states (e.g., *Slender*, *Gossamer Thread*, *Cybernetic Chassis*, *Eldritch Weaver*, *Celestial Resonance*).
* **Seeker Class & Spiritual Lineage**: Choices ranging from cybernetic Chronomancers to heavy Juggernauts.
* **Visual Synthesis Filters**: Immersive, multi-era artistic render guidelines (over 50 distinct filters including *Synthwave Radiance*, *Glitched Corruption*, *Cyanotope Blueprint*, *Mosaics*, *Ukiyo-e*, and *Liminal Corridor*). These map directly to Generative prompts to steer the visual style of the custom vessel cards.
* **⚡ Instant Manifestation Bypass**: A low-friction bypass that instantly generates a fully randomized, lore-aligned Seeker profile. This bypass triggers the full **Sovereign AI weaving sequence** (both unique Bio synthesis and dynamic RPG character image generation) instantly, with fully randomized inputs, allowing users to dive straight into active gameplay loops with a unique custom vessel card.

#### 3.2 Dynamic Artifact Rendering Engine
Dynamic creation and rendering of profile collector cards featuring:
* Holographic spark visual layers with custom CSS gradients.
* Image frames configured with scale-on-hover micro-interactions.
* Real-time text-clipping matrices for bios generated by high-performance models (utilizing `line-clamp` boundaries).

#### 3.3 The Mutator Loom & Soul-Splicing Panel
An advanced playground where players place ancient glyphs onto a visual node canvas, drawing virtual wire connections to synthesize rare traits, spawn chaotic anomalous loops, and inject custom entropy increments to trigger alchemical state shifts.

#### 3.4 Echo Scribe Terminal
A narrative-focused chat client interface connected to the underlying simulation agents. Users can communicate using normal language, while the screen renders responses in clean scrolling feeds with custom typewriter timings, micro-vibrations, and simulated acoustic terminal cues.

#### 3.5 Spiral Thread Map Matrix
A responsive node-graph diagram displaying chronological historical anomalies, spatial dimensional shifts, and temporal distortions across the Tri-Sophian continuum. Uses interactive mouse coordinate listeners to alter background field particles accordingly.

#### 3.6 Somatic Web3 Crypto Nexus
An immersive, decentralized binding module integrated directly in the user header and a dedicated console modal:
* **Extension Handshake**: Automated connection mapping using standard `window.ethereum` bindings to pull safe address keys and decimal chain IDs.
* **Profile Syncing**: Dynamically writes the active user's connected wallet address and chain metadata straight onto their saved Seeker Profile character sheet.
* **Covenant Signer**: Employs Metamask's cryptographic `personal_sign` method to bind text contracts in permanent digital blockchain signature ink.
* **Soul Seal Minting**: Generates simulated decentralized transaction proofs (`0xtxf_..._minted`) that attach the "Certified Web3 Sovereign" badge to character sheets.
* **Sandbox Graceful Safeguards**: High-utility iframe error-handling alerts instructing users on Cross-Origin redirects if they are inside a sandboxed iframe.

---

### 4. Technical Constraints & Multi-Model Adaptations

#### 4.1 System Environment Boundaries
* **Port Limitation**: The sandbox runs exclusively behind an nginx ingress reverse proxy on **Port 3000**.
* **Zero Client-Side Keys**: Universal proxy logic runs through the backend structure; local environments leverage automated fallback routing to keep secret development tokens fully obfuscated.
* **Local Space Persistence**: Built with high-speed indexes powered by `Dexie.js` (IndexedDB) to maintain local character sheets, chat logs, items, and canvas configurations between sessions.

#### 4.2 Automated Legacy Model Mapping Matrix
Due to frequent platform transformations and deprecated entity ranges, the application integrates an auto-mapping proxy layer in `SovereignAIContext.tsx` / `lib/ai/providerAdapter.ts`. This intercepts older requests and routes them to the local engine in real-time to avoid a `404 NOT_FOUND` error:

| Deprecated Entity Reference | Clean Modern Map | Functional Outcome |
| :--- | :--- | :--- |
| `gemini-1.5-flash` | `nvk-local-neural` | High-frequency swift interactions (offline) |
| `gemini-1.5-pro` | `nvk-local-neural` | Complex multi-stage alchemical reasoning (offline) |
| `gemini-2.0-flash-exp` | `nvk-local-neural` | Experimental performance safeguards (offline) |
| `gemini-1.0-pro` | `nvk-local-neural` | Safe fallback execution (offline) |
| `gemini-3-flash-preview` | `nvk-local-neural` | Ultra-modern preview alignment (offline) |
| `gemini-2.5-flash-image` | `nvk-local-neural` | Image synthesis → local procedural SVG artwork (offline) |

---

### 5. Soundscape & Acoustic Feedback Matrix
A highly responsive audio loop controller tracks cursor positions, modal dismissals, and button interactions to fire custom synthetic frequencies:
* **UI Feedback**: High-frequency metallic clicks on dropdown hover behaviors.
* **Transitions**: Medium frequency pitch rise sweeps during modal toggles.
* **Ambient loops**: Subtle humming noise loops mirroring current entropy levels in the dashboard.
