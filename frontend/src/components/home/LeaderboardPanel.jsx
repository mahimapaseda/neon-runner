import React from 'react';
import LeaderboardRow from './LeaderboardRow';

const LeaderboardPanel = ({ leaderboard }) => {
    return (
        <div className="glass-panel home-leaderboard-card">
            <div className="panel-corner corner-tl"></div>
            <div className="panel-corner corner-br"></div>
            <div className="home-leaderboard-header">
                <h2 className="home-leaderboard-title">// HALL_OF_FAME</h2>
                <span className="home-leaderboard-subtitle">GLOBAL RANKINGS</span>
            </div>

            <div className="leaderboard-list">
                {leaderboard.length === 0 ? (
                    <p className="leaderboard-empty">[ No records found in Database ]</p>
                ) : (
                    leaderboard.map((score, index) => (
                        <LeaderboardRow key={score._id} score={score} index={index} />
                    ))
                )}
            </div>
        </div>
    );
};

export default LeaderboardPanel;
