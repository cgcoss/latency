import React from 'react';
import './App.css';
import Pong from './Pong';
import Ping from './Ping';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Ping />
        <Pong />
      </header>
    </div>
  );
}

export default App;
