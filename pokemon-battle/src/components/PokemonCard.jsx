import React from 'react';

function PokemonCard({ pokemon, team, currentHp, active, isWinner, isDamaged, isLoading, onReroll }) {
  if (isLoading) {
    return (
      <div className={`pokemon-card team-${team}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '380px', gap: '15px' }}>
        <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid rgba(255, 255, 255, 0.05)', borderTop: '3px solid var(--neon-red)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>Summoning...</div>
      </div>
    );
  }

  if (!pokemon) return null;

  // Helper to capitalize first letter of Pokemon/move names
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Determine HP bar color class
  const getHpColorClass = (hp) => {
    if (hp > 50) return 'hp-high';
    if (hp > 20) return 'hp-medium';
    return 'hp-low';
  };

  const hpValue = currentHp !== undefined ? currentHp : 100;

  return (
    <div className={`pokemon-card team-${team} ${active ? 'active-attacker' : ''} ${isWinner ? 'is-winner' : ''} ${isDamaged ? 'shake-animation' : ''}`}>
      {onReroll && (
        <button 
          onClick={(e) => { e.stopPropagation(); onReroll(); }} 
          className="reroll-btn"
          title="Reroll this Pokémon"
        >
          ↻
        </button>
      )}
      <div className="pokemon-image-container">
        <img 
          src={pokemon.image || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png'} 
          alt={pokemon.name} 
          className="pokemon-image"
        />
      </div>
      <h3 className="pokemon-name">{capitalize(pokemon.name)}</h3>
      
      {currentHp !== undefined && (
        <div className="hp-container">
          <div className="hp-header">
            <span>HP</span>
            <span>{hpValue}/100</span>
          </div>
          <div className="hp-bar-outer">
            <div 
              className={`hp-bar-inner ${getHpColorClass(hpValue)}`} 
              style={{ width: `${hpValue}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="pokemon-info" style={{ textAlign: 'left' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Moveset:</p>
        {pokemon.moves && pokemon.moves.map((m, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '4px 0', paddingBottom: '2px' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '500', textTransform: 'capitalize' }}>{m.name}</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{m.power}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PokemonCard;
