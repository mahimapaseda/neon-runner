import { create } from 'zustand';

const useGameStore = create((set) => ({
    selectedHero: null, // will store hero object { name, images, powerstats }
    setHero: (hero) => set({ selectedHero: hero }),
}));

export default useGameStore;
