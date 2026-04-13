import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useGameStore from '../store/gameStore';
import { fetchLeaderboard, fetchSuperHeroes, updateProfile } from '../services/apiClient';
import audioManager from '../services/audioManager';

const useHomePageData = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const logout = useAuthStore(state => state.logoutStore);
    const loginStore = useAuthStore(state => state.loginStore);
    const { selectedHero, setHero } = useGameStore();

    const [leaderboard, setLeaderboard] = useState([]);
    const [heroes, setHeroes] = useState([]);
    const [showHeroes, setShowHeroes] = useState(false);
    const [loadingHeroes, setLoadingHeroes] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);
    const [tempAvatar, setTempAvatar] = useState(user?.avatarUrl || '');

    const loadBoard = async () => {
        try {
            const data = await fetchLeaderboard();
            setLeaderboard(data);
        } catch {
            console.error('Failed to load leaderboard');
        }
    };

    const handleUpdateAvatar = async () => {
        if (!user?.username || !user?.token) {
            return;
        }

        try {
            const encodedUsername = encodeURIComponent(user.username);
            const finalAvatarUrl = tempAvatar.replace(user.username, encodedUsername);

            const updatedUser = await updateProfile({ avatarUrl: finalAvatarUrl }, user.token);

            loginStore(updatedUser);
            setShowAvatarPicker(false);
            audioManager.playSuccess();
            await loadBoard();
        } catch (err) {
            console.error('Failed to update avatar', err);
            audioManager.playGlitch();

            if (err.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const handleFetchHeroes = async () => {
        if (loadingHeroes) {
            setShowHeroes(true);
            return;
        }

        if (heroes.length === 0) {
            setLoadingHeroes(true);
            try {
                const data = await fetchSuperHeroes();
                setHeroes(data.slice(0, 30));
            } catch {
                console.error('Failed to load heroes');
            } finally {
                setLoadingHeroes(false);
            }
        }
        setShowHeroes(true);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeploy = () => {
        audioManager.init();
        navigate('/game');
    };

    const handleOpenHeroSync = () => {
        audioManager.init();
        handleFetchHeroes();
    };

    const handleSelectHero = (hero) => {
        audioManager.playBeep(selectedHero?.id === hero.id ? 220 : 440);
        setHero(hero);
        setShowHeroes(false);
    };

    useEffect(() => {
        loadBoard();
    }, []);

    useEffect(() => {
        if (showAvatarPicker) {
            setTempAvatar(user?.avatarUrl || '');
        }
    }, [showAvatarPicker, user?.avatarUrl]);

    return {
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
    };
};

export default useHomePageData;
