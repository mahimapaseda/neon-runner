import React, { useRef } from 'react';
import HeroCard from './HeroCard';

const HeroWidget = ({ isOpen, loading, heroes, selectedHero, onClose, onSelectHero }) => {
    const sliderRef = useRef(null);

    if (!isOpen) return null;

    const scrollHeroes = (direction) => {
        if (!sliderRef.current) return;
        const scrollAmount = direction === 'left' ? -300 : 300;
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    return (
        <div className="glass-panel hero-widget">
            <div className="panel-corner corner-tl"></div>
            <div className="panel-corner corner-br"></div>
            <div className="hero-widget-header">
                <h2 className="hero-widget-title">// HERO_DATABASE_LINK</h2>
                <button className="btn-secondary hero-widget-close" onClick={onClose}>CLOSE</button>
            </div>

            {loading ? <div className="hero-widget-loading">[ Fetching from SuperHero API... ]</div> : (
                <div className="hero-widget-body">
                    <div ref={sliderRef} className="hero-slider">
                        {heroes.map(hero => (
                            <HeroCard
                                key={hero.id}
                                hero={hero}
                                isSelected={selectedHero?.id === hero.id}
                                onSelect={() => onSelectHero(hero)}
                            />
                        ))}
                    </div>

                    <button onClick={() => scrollHeroes('left')} className="hero-slider-control left">&lt;</button>
                    <button onClick={() => scrollHeroes('right')} className="hero-slider-control right">&gt;</button>
                </div>
            )}
        </div>
    );
};

export default HeroWidget;
