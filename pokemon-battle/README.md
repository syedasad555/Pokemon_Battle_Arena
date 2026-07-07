# Pokémon Battle Arena

A minimalist, responsive client-only Pokémon Battle application built using React.js, querying PokéAPI directly.

## Tech Stack
* **Frontend**: React.js (Vite, Functional Components, Hooks, Axios, CSS)
* **API**: PokéAPI (Direct client-side integration)

---

## Folder Structure
```text
pokemon-battle/
│
├── README.md
├── index.html
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── components/
    │   ├── BattleLog.jsx
    │   └── PokemonCard.jsx
    ├── App.css
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

---

## Setup & Running Instructions

### 1. Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Running the App
1. Open your terminal and navigate to the project folder:
   ```bash
   cd pokemon-battle
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```
   The React application will be accessible at the address output in the terminal (usually `http://localhost:5173`).

---

## How it Works
1. Click **Generate Competitors** to fetch two random Pokémon (from IDs 1 to 151) and 4 random moves for each from the PokéAPI.
2. Click **Start Battle** to begin the real-time turn-based simulation. Moves are selected randomly each turn and deal damage dynamically based on their power level until one Pokémon's HP drops to 0.
