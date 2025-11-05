import { useState } from "react";
import "./App.scss";

const POKEDEX_LIMIT = 1025;

export default function App() {
  const [displayValue, setDisplayValue] = useState("0");
  const [firstOperand, setFirstOperand] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);
  
  const [pokemonData, setPokemonData] = useState(null);
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false);
  const [pokemonError, setPokemonError] = useState(null);

  const calculate = (first, op, second) => {
    if (op === "+") return first + second;
    if (op === "-") return first - second;
    if (op === "*") return first * second;
    if (op === "/") return first / second;
    return second;
  };

  const fetchPokemon = async (id) => {
    if (id < 1 || id > POKEDEX_LIMIT) {
      setPokemonError(`Pokémon #${id} não está na Pokédex!`);
      setPokemonData(null);
      return;
    }
    setIsLoadingPokemon(true);
    setPokemonError(null);
    setPokemonData(null);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!response.ok) {
        throw new Error("Pokémon não encontrado.");
      }
      const data = await response.json();
      setPokemonData({
        name: data.name,
        sprite: data.sprites.front_default,
      });
    } catch (error) {
      setPokemonError(error.message);
    } finally {
      setIsLoadingPokemon(false);
    }
  };

  const checkPokedexLimit = (result) => {
    if (result > POKEDEX_LIMIT) {
      return `Error: Beyond Pokédex #${POKEDEX_LIMIT}!`;
    }
    return parseFloat(result.toPrecision(15));
  };

  const inputDigit = (digit) => {
    if (typeof displayValue === 'string' && displayValue.includes('Error')) {
      setDisplayValue(String(digit));
      return;
    }
    if (waitingForSecondOperand) {
      setDisplayValue(String(digit));
      setWaitingForSecondOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? String(digit) : displayValue + digit);
    }
  };

  const handleOperator = (nextOperator) => {
    const inputValue = parseFloat(displayValue);
    if (operator && !waitingForSecondOperand) {
      const result = calculate(firstOperand, operator, inputValue);
      const finalResult = checkPokedexLimit(result);
      setDisplayValue(String(finalResult));
      setFirstOperand(typeof finalResult === 'number' ? finalResult : null);
    } else {
      setFirstOperand(inputValue);
    }
    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };
  
  const handleEquals = () => {
    if (operator === null || firstOperand === null || waitingForSecondOperand) return;

    const secondOperand = parseFloat(displayValue);
    if (operator === "/" && secondOperand === 0) {
      setDisplayValue("Não pode dividir por zero!");
      setPokemonData(null);
      setPokemonError(null);
      return;
    }
    const result = calculate(firstOperand, operator, secondOperand);
    const finalResult = checkPokedexLimit(result);
    
    setDisplayValue(String(finalResult));

    if (typeof finalResult === 'number') {
      fetchPokemon(Math.floor(finalResult));
    } else {
      setPokemonData(null);
      setPokemonError(null);
    }

    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  const clearAll = () => {
    setDisplayValue("0");
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
    setPokemonData(null);
    setIsLoadingPokemon(false);
    setPokemonError(null);
  };

  return (
    <div className="app-wrapper">
      <main className="calculator-container">
        <h1 className="title">Calculadora Pokémon</h1>
        <div className="display-container">
          <div className="display">{displayValue}</div>
        </div>
        <div className="keypad">
          <button className="button" onClick={() => inputDigit(7)}>7</button>
          <button className="button" onClick={() => inputDigit(8)}>8</button>
          <button className="button" onClick={() => inputDigit(9)}>9</button>
          <button className="button operator" onClick={() => handleOperator("/")}>/</button>
          
          <button className="button" onClick={() => inputDigit(4)}>4</button>
          <button className="button" onClick={() => inputDigit(5)}>5</button>
          <button className="button" onClick={() => inputDigit(6)}>6</button>
          <button className="button operator" onClick={() => handleOperator("*")}>*</button>

          <button className="button" onClick={() => inputDigit(1)}>1</button>
          <button className="button" onClick={() => inputDigit(2)}>2</button>
          <button className="button" onClick={() => inputDigit(3)}>3</button>
          <button className="button operator" onClick={() => handleOperator("-")}>-</button>
          
          <button className="button function" onClick={clearAll}>C</button>
          <button className="button" onClick={() => inputDigit(0)}>0</button>
          <button className="button function" onClick={handleEquals}>=</button>
          <button className="button operator" onClick={() => handleOperator("+")}>+</button>
        </div>
      </main>
      <section className="pokemon-display-container">
        <h2 className="pokemon-question">Quem é esse Pokémon?</h2>
        <div className="pokemon-info">
          {isLoadingPokemon && <p className="loading">Procurando na Pokédex...</p>}
          {pokemonError && <p className="error">{pokemonError}</p>}
          {pokemonData && (
            <>
              <img src={pokemonData.sprite} alt={pokemonData.name} className="pokemon-sprite" />
              <p className="pokemon-name">{pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1)}</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
