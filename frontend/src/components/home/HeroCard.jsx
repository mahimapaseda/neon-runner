import React from 'react';
import DecodingText from './DecodingText';

const HeroCard = ({ hero, isSelected, onSelect }) => (
    <div
        className={`hero-card${isSelected ? ' is-selected' : ''}`}
        onClick={onSelect}
    >
        <div className="hero-card-image-wrap">
            <img src={hero.images.sm} alt={hero.name} className="hero-card-image" />
        </div>
        <div className="hero-card-meta">
            <div className="hero-card-name">
                <DecodingText text={hero.name} active={isSelected} />
            </div>
            <div className="hero-card-stats">
                <span>SPD: {hero.powerstats.speed}</span>
                <span className="hero-card-str">STR: {hero.powerstats.strength}</span>
            </div>
        </div>
    </div>
);

export default HeroCard;
