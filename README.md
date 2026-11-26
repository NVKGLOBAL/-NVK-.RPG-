# Remix: 🜂 NVKΔ.RPG 🜂 — Tri-Sophian Codex

Welcome to the **Tri-Sophian Codex**, a retro-futuristic, high-fidelity RPG simulation sandbox where technology and mysticism collide. Build your own Seeker, warp reality via entropic canvas nodes, and interact with simulated neural entities.

## 🜂 Key Features

* **Advanced Onboarding Funnel**: Choose from **50+ custom Frame architectures (Body Types)** and **50+ visual filter configurations** to generate bespoke avatar artifact collector cards. Features a rapid **⚡ INSTANT MANIFEST** one-click random generation path to bypass manual onboarding.
* **Web3 MetaMask Integration**: A dedicated **Somatic Crypto Nexus** to bind browser extension wallets with Seeker profiles, query blockchain gas metric balances, sign cryptographic contracts with personal signatures, and mint certified local NFTs.
* **Algorithmic Sound Engine**: Dynamic acoustic feedback tracks interactive hover triggers, screen transitions, and current dashboard entropy.
* **Mutator Loom**: Forge rare spatial nodes, form alchemical thread combinations, and trigger visual structural changes on an interactive element canvas.
* **Model-Mapping Proxy**: Local model map that routes legacy model ids (including old Gemini ids) to the offline Sovereign Procedural Engine, so saved selections never crash.
* **Persistent Codex Storage**: Powered by `Dexie.js` (IndexedDB) for robust, local save-slots and profile configuration recovery.

---

## 🗂 Project Documentation

For a detailed breakdown of specifications, user flows, architecture maps, and technical guidelines, explore:

* **[PRD.md](./PRD.md)**: Product Requirement Document detailing the aesthetic philosophy, functional panels, system requirements, and API translation matrices.

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v18+)
* npm

### Installation & Run

1. Clone or access the workspace directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Set up environment variables — no API key needed:
   ```bash
   cp .env.example .env
   ```
   The default engine is the local Sovereign Procedural Engine (`nvk-local-neural`), fully offline. No key is required.
4. Boot the development server:
   ```bash
   npm run dev
   ```

---

## 🤖 Swapping AI Models & Provider Configuration

The application is built to be **100% portable for GitHub and local execution**. You can easily swap AI models in two ways:

### 1. In-App AI Settings UI (Runtime)
* Click the **Oracle dropdown** in the header or the **AI Settings** button.
* Choose from preset models:
  * **NVK Sovereign Procedural Engine** (Offline default)
  * **Pollinations Open Inference** (Zero-key open inference)
  * **Pollinations DeepSeek** (Zero-key open inference)
  * **Ollama Local** (Local Ollama node at http://localhost:11434)
  * **Custom Model ID** (Enter a custom model id, e.g. `ollama:llama3.1`)
* No API key is needed for any preset. Legacy Gemini model ids saved from older versions are automatically routed to the local engine.
* Use the **"Test Connection"** diagnostic ping to verify your model setup in real-time.

### 2. Environment Variables (`.env`)
You can configure the default model in your `.env` file (no keys):
```env
# Default Model Selection
VITE_AI_MODEL=nvk-local-neural

# Optional: local Ollama node (only used with ollama-local)
VITE_OLLAMA_URL=http://localhost:11434
```

---

### 🎛 Scripts

* `npm run dev`: Boots the local Vite server (accessible directly through port 3000 inside the sandbox framework).
* `npm run build`: Bundles the client compiler to optimal static file paths.
* `npm run lint`: Triggers the strict TypeScript compiler check (`tsc`) to verify type safety.
