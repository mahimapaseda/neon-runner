import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
    persist(
        (set) => ({
            bgmVolume: 0.4,
            sfxVolume: 0.6,
            isMuted: false,
            crtFilter: true,
            setBgmVolume: (level) => set({ bgmVolume: level }),
            setSfxVolume: (level) => set({ sfxVolume: level }),
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            toggleCrtFilter: () => set((state) => ({ crtFilter: !state.crtFilter }))
        }),
        {
            name: 'neon-runner-settings'
        }
    )
);

export default useSettingsStore;
