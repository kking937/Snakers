import React from 'react';
import logo from './logo.svg';
import './App.css';
import { GameContainer } from './Components';

function App() {
  return (
    <div className="App">
      <div className="App-header">SNAKE</div>
      <div className='App-container'>
        <GameContainer />
      </div>
    </div>
  );
}

export default App;
