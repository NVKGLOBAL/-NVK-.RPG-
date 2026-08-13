# Remix: 🜂 NVKΔ.RPG 🜂 — Tri-Sophian Codex

Welcome to the **Tri-Sophian Codex**, a retro-futuristic, high-fidelity RPG simulation sandbox where technology and mysticism collide. Build your own Seeker, warp reality via entropic canvas nodes, and interact with simulated neural entities.

## 🜂 Key Features

* **Advanced Onboarding Funnel**: Choose from **50+ custom Frame architectures (Body Types)** and **50+ visual filter configurations** to generate bespoke avatar artifact collector cards. Features a rapid **⚡ INSTANT MANIFEST** one-click random generation path to bypass manual onboarding.
* **Web3 MetaMask Integration**: A dedicated **Somatic Crypto Nexus** to bind browser extension wallets with Seeker profiles, query blockchain gas metric balances, sign cryptographic contracts with personal signatures, and mint certified local NFTs.
* **Algorithmic Sound Engine**: Dynamic acoustic feedback tracks interactive hover triggers, screen transitions, and current dashboard entropy.
* **Mutator Loom**: Forge rare spatial nodes, form alchemical thread combinations, and trigger visual structural changes on an interactive element canvas.
* **Model-Mapping Proxy**: Modernized backend integration map that filters deprecated models to prevent `404 NOT_FOUND` errors, leveraging `gemini-3.5-flash` and `gemini-3.1-pro-preview` under the hood.
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
3. Set up your environment variables (optional for live AI):
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API Key in `.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
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
  * **Gemini 3.5 Flash** (High-speed default)
  * **Gemini 3.1 Pro (Preview)** (Complex reasoning & coding)
  * **Gemini Flash Latest** (Ultra-low latency)
  * **Gemini 3.1 Flash Lite** (Lightweight & efficient)
  * **Custom Model ID** (Enter fine-tuned `tunedModels/...` or custom model tags)
* You can also enter a custom API Key directly in the UI (saved locally in browser storage).
* Use the **"Test Connection"** diagnostic ping to verify your API key and model setup in real-time.

### 2. Environment Variables (`.env`)
You can configure default model choices and API keys in your `.env` file:
```env
# API Key (Detected automatically across multiple standard variable names)
API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# Default Model Selection
VITE_AI_MODEL=gemini-3.5-flash
```

---

### 🎛 Scripts

* `npm run dev`: Boots the local Vite server (accessible directly through port 3000 inside the sandbox framework).
* `npm run build`: Bundles the client compiler to optimal static file paths.
* `npm run lint`: Triggers the strict TypeScript compiler check (`tsc`) to verify type safety.
