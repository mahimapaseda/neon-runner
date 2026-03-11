import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameEngine from '../components/game/GameEngine';

const Game = () => {
    const navigate = useNavigate();

    return (
        <div style={{ width: '100vw', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '2rem' }}>

            <GameEngine />

        </div>
    );
};

export default Game;
