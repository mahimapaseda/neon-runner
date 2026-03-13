import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
    persist(
        (set) => ({
            volume: 0.5,
            isMuted: false,
            setVolume: (level) => set({ volume: level }),
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted }))
        }),
        {
            name: 'neon-runner-settings'
        }
    )
);

export default useSettingsStore;
