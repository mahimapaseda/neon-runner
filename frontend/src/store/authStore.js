import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            loginStore: (userData) => {
                set({ user: userData });
            },
            logoutStore: () => {
                set({ user: null });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

export default useAuthStore;
