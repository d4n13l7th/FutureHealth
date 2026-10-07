# 🌟 FutureHealth

FutureHealth is an interactive health journey simulation platform designed to help users explore how lifestyle choices and commitment levels influence their long-term well-being. By predicting the time required to achieve specific health goals based on daily habits, FutureHealth empowers users to make informed, healthier choices.

This project is built to promote healthy habits and directly supports **Sustainable Development Goal (SDG) 3: Good Health and Well-being**.

---

## ✨ Key Features

* **🔮 Interactive Health Simulation:** Input current lifestyle habits (sleep, exercise frequency, stress levels) to generate a projected "Future Health Score" and narrative report.
* **🎛️ "What-If" Scenario Engine:** Dynamically adjust variables (e.g., increasing sleep by 2 hours) on the results page to instantly see how small lifestyle tweaks impact future outcomes.
* **⚖️ Compare Futures:** Perform A/B testing on different lifestyle scenarios side-by-side to understand the trade-offs of various habits.
* **🤖 Local AI Health Assistant:** A built-in, context-aware chatbot that provides personalized advice based on the user's latest simulation results (runs entirely client-side).
* **📊 History Tracking:** Securely save and review past simulations to track progress and shifting health trajectories over time.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React 19
* **Build Tool:** Vite 5
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Charts:** Recharts
* **Animation:** Framer Motion
* **Backend & Authentication:** Cloudflare Workers + D1 (SQLite)
* **Routing:** React Router DOM
* **Linting:** ESLint 10 (flat config)

---

## 🚀 Getting Started (Local Development)

Follow these steps to run FutureHealth locally on your machine.

### Prerequisites

* [Node.js](https://nodejs.org/) (v18 LTS or higher recommended)
* npm (comes with Node.js)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/d4n13l7th/FutureHealth.git
   cd FutureHealth
   ```

2. **Install dependencies:**

   ```bash
   npm install --legacy-peer-deps
   ```

   > Note: The `--legacy-peer-deps` flag avoids peer dependency conflicts with React 19 / Vite.

3. **Set up environment variables:**

   Copy the example file and point it to your Cloudflare Worker API:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_API_URL=https://futurehealth-api.solvox-worker.workers.dev
   ```

4. **Set up the backend (optional — for local development):**

   The API runs as a Cloudflare Worker (`worker/`) backed by Cloudflare D1. To deploy or apply database migrations:

   ```bash
   cd worker
   npm install
   npx wrangler d1 migrations apply futurehealth-db --remote
   npx wrangler deploy
   ```

   The D1 schema (tables `users`, `sessions`, `profiles`, `simulations`) lives in `worker/migrations/0001_init.sql`. See `docs/RENCANA_PENGEMBANGAN.md` for the full architecture and roadmap.

5. **Run the development server:**

   ```bash
   npm run dev
   ```

6. **Open the app:**

   Visit [http://localhost:5173](http://localhost:5173) in your browser to see the app in action!

### Other Scripts

```bash
npm run lint     # run ESLint over the project
npm run build    # production build to dist/
npm run preview  # preview the production build
```

---

## 📂 Architecture Overview

FutureHealth follows a modular component architecture:

* `/src/components` — Reusable UI elements (divided into domains like `/chatbot`, `/compare`, `/results`, plus shared primitives in `/ui`).
* `/src/hooks` — Custom React hooks for state and data fetching (`useSimulation`, `useChatbot`, `useSimulationHistory`).
* `/src/pages` — Main pages routed by the application.
* `/src/services` — Core business logic engines (`simulationEngine.js`, `chatbotEngine.js`) and the Cloudflare API client (`api.js`, `backend.js`, `profileService.js`, `achievementService.js`).
* `/src/context` — Global state management (`AuthContext`, `SimulationContext`, `ToastContext`).
* `/src/router` / `/src/layouts` — Route definitions (with lazy-loaded page chunks) and the protected app shell.
* `/worker` — Cloudflare Worker API (`src/index.js`) and D1 migrations (`migrations/0001_init.sql`).
* `/docs` — Development plan & roadmap (`RENCANA_PENGEMBANGAN.md`).

---

## 🎯 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/d4n13l7th/FutureHealth/issues) if you want to contribute.

## 📄 License

This project is licensed under the MIT License.
