import React from 'react';

const HomeProfileCard = ({ user, selectedHero, onOpenAvatar, onDeploy, onFetchHeroes, onLogout }) => {
    return (
        <div className="glass-panel home-profile-card">
            <div className="panel-corner corner-tl"></div>
            <div className="panel-corner corner-br"></div>
            <div className="home-profile-head">
                <div className="home-avatar-ring"></div>

                <div className="home-avatar-wrap">
                    <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="home-avatar-image"
                    />
                    <button
                        onClick={onOpenAvatar}
                        className="home-avatar-edit"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                </div>
                <h2 className="home-username">{user.username}</h2>
                <p className="home-class">CLASS: ROGUE_AGENT</p>
            </div>

            <div className="home-profile-actions">
                <button className="btn-primary home-deploy-btn" onClick={onDeploy}>
                    DEPLOY TO GRID
                </button>

                <button className="btn-secondary" onClick={onFetchHeroes}>
                    {selectedHero ? `SYNCED: ${selectedHero.name}` : 'AWAITING HERO SYNC'}
                </button>

                <button className="btn-danger home-logout-btn" onClick={onLogout}>
                    TERMINATE SESSION
                </button>
            </div>
        </div>
    );
};

export default HomeProfileCard;
