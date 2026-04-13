import React from 'react';
import GameEngine from '../components/game/GameEngine';

const Game = () => {
    return (
        <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>

            <GameEngine />

        </div>
    );
};

export default Game;
