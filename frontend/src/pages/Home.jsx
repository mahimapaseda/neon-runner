import React from 'react';
import HomeHeader from '../components/home/HomeHeader';
import HomeProfileCard from '../components/home/HomeProfileCard';
import AvatarPickerModal from '../components/home/AvatarPickerModal';
import HeroWidget from '../components/home/HeroWidget';
import LeaderboardPanel from '../components/home/LeaderboardPanel';
import useHomePageData from '../hooks/useHomePageData';

const Home = () => {
    const {
        user,
        selectedHero,
        leaderboard,
        heroes,
        showHeroes,
        loadingHeroes,
        showAvatarPicker,
        tempAvatar,
        setTempAvatar,
        setShowHeroes,
        setShowAvatarPicker,
        handleUpdateAvatar,
        handleLogout,
        handleDeploy,
        handleOpenHeroSync,
        handleSelectHero,
    } = useHomePageData();

    return (
        <div className="home-shell">

            {/* Main Header */}
            <HomeHeader />

            {/* Profile & Controls Widget */}
            <HomeProfileCard
                user={user}
                selectedHero={selectedHero}
                onOpenAvatar={() => setShowAvatarPicker(true)}
                onDeploy={handleDeploy}
                onFetchHeroes={handleOpenHeroSync}
                onLogout={handleLogout}
            />

            {/* Avatar Picker Modal */}
            <AvatarPickerModal
                isOpen={showAvatarPicker}
                user={user}
                tempAvatar={tempAvatar}
                setTempAvatar={setTempAvatar}
                onConfirm={handleUpdateAvatar}
                onClose={() => setShowAvatarPicker(false)}
            />

            {/* Main Content Area */}
            <div className="home-main-content">

                {/* Hero Selection Widget */}
                <HeroWidget
                    isOpen={showHeroes}
                    loading={loadingHeroes}
                    heroes={heroes}
                    selectedHero={selectedHero}
                    onClose={() => setShowHeroes(false)}
                    onSelectHero={handleSelectHero}
                />

                {/* Leaderboard Widget */}
                <LeaderboardPanel leaderboard={leaderboard} />

            </div>
        </div>
    );
};

export default Home;
