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

* **Frontend Framework:** React 18
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Backend & Authentication:** Supabase
* **Routing:** React Router DOM

---

## 🚀 Getting Started (Local Development)

Follow these steps to run FutureHealth locally on your machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 LTS or higher recommended)
* npm (comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/FutureHealth.git](https://github.com/your-username/FutureHealth.git)
   cd FutureHealth
Install dependencies:
(Note: If you encounter peer dependency conflicts with React/Vite, use the legacy flag as shown below)

Bash
npm install --legacy-peer-deps
Set up Environment Variables:
Create a .env file in the root directory and add your Supabase credentials:

Code snippet
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the development server:

Bash
npm run dev
Open the app:
Visit http://localhost:5173 in your browser to see the app in action!

📂 Architecture Overview
FutureHealth follows a modular component architecture:

/src/components - Reusable UI elements (divided into domains like /chatbot, /compare, /results).

/src/hooks - Custom React hooks for state and data fetching (useSimulation, useChatbot).

/src/pages - Main layout pages routing the application.

/src/services - Core business logic engines (simulationEngine.js, chatbotEngine.js) and Supabase connection.

/src/context - Global state management (AuthContext, SimulationContext).

🎯 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

📄 License
This project is licensed under the MIT License.