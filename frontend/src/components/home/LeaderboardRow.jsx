import React from 'react';

const LeaderboardRow = ({ score, index }) => {
    const rankTone = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'default';

    return (
        <div className={`leaderboard-row rank-${rankTone}`}>
            <div className="leaderboard-rank-rail">
                {index === 0 && <span className="leaderboard-rank-star">STAR</span>}
                <span className="leaderboard-rank-number">{index + 1}</span>
            </div>

            <img src={score.userId?.avatarUrl} alt="Avatar" className="leaderboard-avatar" />

            <div className="leaderboard-player">
                <div className="leaderboard-player-name">{score.userId?.username || 'GHOST_USER'}</div>
                <div className="leaderboard-player-meta">Nodes Cleared: {score.puzzlesSolved}</div>
            </div>

            <div className="leaderboard-score">
                <div className="leaderboard-score-value">{score.distance}</div>
                <div className="leaderboard-score-label">EXP_RATING</div>
            </div>
        </div>
    );
};

export default LeaderboardRow;
