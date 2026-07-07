import React, { useState } from 'react';
import axios from 'axios';
import PokemonCard from './components/PokemonCard';
import BattleLog from './components/BattleLog';
import './App.css';

function App() {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  
  // Battle state
  const [hp1, setHp1] = useState(100);
  const [hp2, setHp2] = useState(100);
  const [battleLogs, setBattleLogs] = useState([]);
  const [isBattleRunning, setIsBattleRunning] = useState(false);
  const [hasBattleFinished, setHasBattleFinished] = useState(false);
  const [activeAttacker, setActiveAttacker] = useState(null);
  const [damage1, setDamage1] = useState(false);
  const [damage2, setDamage2] = useState(false);
  const [winner, setWinner] = useState(null);
  const [rerolling1, setRerolling1] = useState(false);
  const [rerolling2, setRerolling2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper: Get a random integer between min and max (inclusive)
  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Helper: Fetch a single Pokémon by ID and get 4 random move details from PokéAPI
  const fetchPokemonFromApi = async (id) => {
    // Fetch Pokémon data from PokéAPI
    const pokemonResponse = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${id}`
    );
    const pokemonData = pokemonResponse.data;

    const name = pokemonData.name;
    const image = pokemonData.sprites.front_default;
    const movesList = pokemonData.moves;

    // Pick up to 4 random unique moves
    const numMovesToPick = Math.min(4, movesList.length);
    const pickedIndices = new Set();
    while (pickedIndices.size < numMovesToPick) {
      pickedIndices.add(getRandomInt(0, movesList.length - 1));
    }

    // Fetch details for each picked move
    const movesPromises = Array.from(pickedIndices).map(async (idx) => {
      const moveName = movesList[idx].move.name;
      try {
        const moveResponse = await axios.get(
          `https://pokeapi.co/api/v2/move/${moveName}`
        );
        // Default status or non-damaging moves to power 40 so they deal damage in our game
        const power = moveResponse.data.power !== null ? moveResponse.data.power : 40;
        return { name: moveName, power };
      } catch (err) {
        return { name: moveName, power: 40 };
      }
    });

    const moves = await Promise.all(movesPromises);

    return {
      name,
      image,
      moves,
    };
  };

  // Fetch two random unique Pokémon directly from the frontend
  const generateBattle = async () => {
    setLoading(true);
    setError('');
    setBattleLogs([]);
    setPokemon1(null);
    setPokemon2(null);
    setWinner(null);
    setHasBattleFinished(false);
    setHp1(100);
    setHp2(100);

    try {
      const id1 = getRandomInt(1, 151);
      let id2 = getRandomInt(1, 151);
      while (id1 === id2) {
        id2 = getRandomInt(1, 151);
      }

      const [p1, p2] = await Promise.all([
        fetchPokemonFromApi(id1),
        fetchPokemonFromApi(id2),
      ]);
      setPokemon1(p1);
      setPokemon2(p2);
    } catch (err) {
      setError(
        'Failed to fetch Pokémon data from PokéAPI. If you are on a school or work network, the PokéAPI might be blocked by your firewall.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Reroll an individual Pokémon
  const rerollPokemon = async (playerIndex) => {
    if (isBattleRunning) return;

    setWinner(null);
    setHasBattleFinished(false);
    setHp1(100);
    setHp2(100);
    setBattleLogs([]);

    const otherPokemon = playerIndex === 1 ? pokemon2 : pokemon1;
    let otherId = null;
    if (otherPokemon && otherPokemon.image) {
      const match = otherPokemon.image.match(/\/pokemon\/(\d+)\.png/);
      if (match) otherId = parseInt(match[1]);
    }

    let newId = getRandomInt(1, 151);
    while (newId === otherId) {
      newId = getRandomInt(1, 151);
    }

    if (playerIndex === 1) setRerolling1(true);
    else setRerolling2(true);

    try {
      const newPokemon = await fetchPokemonFromApi(newId);
      if (playerIndex === 1) {
        setPokemon1(newPokemon);
      } else {
        setPokemon2(newPokemon);
      }
      addLog(`Player ${playerIndex} rerolled! ${capitalize(newPokemon.name)} enters the arena!`, 'start', newPokemon.image);
    } catch (err) {
      setError('Failed to reroll Pokémon.');
    } finally {
      if (playerIndex === 1) setRerolling1(false);
      else setRerolling2(false);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const addLog = (text, type = 'start', pokemonImage = null) => {
    setBattleLogs((prev) => [...prev, { text, type, pokemonImage }]);
  };

  // Turn-based real-time battle simulation
  const startBattle = async () => {
    if (!pokemon1 || !pokemon2 || isBattleRunning) return;

    setIsBattleRunning(true);
    setBattleLogs([]);
    setWinner(null);
    setHasBattleFinished(false);

    let currentHp1 = 100;
    let currentHp2 = 100;
    setHp1(100);
    setHp2(100);

    addLog('The battle begins in the arena!', 'start', '/pokeball-pokemon-svgrepo-com.svg');
    await sleep(1000);

    // Coin flip for first turn (1 or 2)
    let turn = Math.random() < 0.5 ? 1 : 2;

    while (currentHp1 > 0 && currentHp2 > 0) {
      if (turn === 1) {
        setActiveAttacker(1);
        
        // Randomly select one of Pokemon 1's moves
        const selectedMove = pokemon1.moves[Math.floor(Math.random() * pokemon1.moves.length)];
        const power = selectedMove.power;
        const variance = Math.floor(Math.random() * 7) - 3; // -3 to 3
        const damage = Math.max(8, Math.floor(power * 0.35 + variance));

        currentHp2 = Math.max(0, currentHp2 - damage);
        
        addLog(`${capitalize(pokemon1.name)} uses ${capitalize(selectedMove.name)}! It deals ${damage} damage.`, 'p1-attack', pokemon1.image);
        setHp2(currentHp2);
        
        // Shake target card
        setDamage2(true);
        await sleep(150);
        setDamage2(false);
        
        await sleep(1200);

        if (currentHp2 <= 0) {
          addLog(`${capitalize(pokemon2.name)} has fainted!`, 'faint', pokemon2.image);
          await sleep(600);
          break;
        }
        turn = 2;
      } else {
        setActiveAttacker(2);

        // Randomly select one of Pokemon 2's moves
        const selectedMove = pokemon2.moves[Math.floor(Math.random() * pokemon2.moves.length)];
        const power = selectedMove.power;
        const variance = Math.floor(Math.random() * 7) - 3; // -3 to 3
        const damage = Math.max(8, Math.floor(power * 0.35 + variance));

        currentHp1 = Math.max(0, currentHp1 - damage);
        
        addLog(`${capitalize(pokemon2.name)} uses ${capitalize(selectedMove.name)}! It deals ${damage} damage.`, 'p2-attack', pokemon2.image);
        setHp1(currentHp1);
        
        // Shake target card
        setDamage1(true);
        await sleep(150);
        setDamage1(false);
        
        await sleep(1200);

        if (currentHp1 <= 0) {
          addLog(`${capitalize(pokemon1.name)} has fainted!`, 'faint', pokemon1.image);
          await sleep(600);
          break;
        }
        turn = 1;
      }
    }

    setActiveAttacker(null);

    if (currentHp1 > 0) {
      addLog(`${capitalize(pokemon1.name)} wins the battle!`, 'victory', pokemon1.image);
      setWinner(1);
    } else {
      addLog(`${capitalize(pokemon2.name)} wins the battle!`, 'victory', pokemon2.image);
      setWinner(2);
    }

    setHasBattleFinished(true);
    setIsBattleRunning(false);
  };

  // Helper: Capitalize first letter of a string
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Pokémon Battle Arena</h1>
        <p className="app-subtitle">Generate two random combatants and initiate a real-time showdown</p>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <button
            className="btn btn-generate"
            onClick={generateBattle}
            disabled={loading || isBattleRunning}
          >
            {loading ? 'Generating...' : 'Generate Competitors'}
          </button>

          {error && <p className="error-message">{error}</p>}

          {pokemon1 && pokemon2 ? (
            <div className="arena-wrapper">
              <div className="battle-arena">
                <PokemonCard 
                  pokemon={pokemon1} 
                  team="blue"
                  currentHp={hp1}
                  active={activeAttacker === 1}
                  isWinner={winner === 1}
                  isDamaged={damage1}
                  isLoading={rerolling1}
                  onReroll={isBattleRunning ? null : () => rerollPokemon(1)}
                />
                <div className="vs-label">VS</div>
                <PokemonCard 
                  pokemon={pokemon2} 
                  team="red"
                  currentHp={hp2}
                  active={activeAttacker === 2}
                  isWinner={winner === 2}
                  isDamaged={damage2}
                  isLoading={rerolling2}
                  onReroll={isBattleRunning ? null : () => rerollPokemon(2)}
                />
              </div>

              <button 
                className="btn btn-battle" 
                onClick={startBattle}
                disabled={isBattleRunning || hasBattleFinished}
              >
                {isBattleRunning ? 'Battle in Progress...' : hasBattleFinished ? 'Battle Concluded' : 'Start Battle'}
              </button>
            </div>
          ) : (
            <div className="placeholder-arena">
              Generate competitors to start the battle.
            </div>
          )}
        </div>

        <div className="right-panel">
          <BattleLog logs={battleLogs} />
        </div>
      </div>
    </div>
  );
}

export default App;
