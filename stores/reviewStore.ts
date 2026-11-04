import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Puanlama isteginin ne zaman gosterilecegini belirleyen sayaclar.
 *
 * Karisim verisinden ayri bir store: soundStore'un partialize'i yalnizca
 * savedMixes'i kaliciya yaziyor, bu sayaclari oraya eklemek o filtreyi
 * karistirirdi.
 */
type ReviewStore = {
    /** Sonuna kadar giden uyku zamanlayici sayisi. */
    completedSessions: number;
    /** Istegin en son gosterildigi an (ms). Hic gosterilmediyse null. */
    lastPromptAt: number | null;

    recordCompletedSession: () => void;
    markPrompted: () => void;
};

export const useReviewStore = create<ReviewStore>()(
    persist(
        (set) => ({
            completedSessions: 0,
            lastPromptAt: null,

            recordCompletedSession: () =>
                set((state) => ({ completedSessions: state.completedSessions + 1 })),

            markPrompted: () => set({ lastPromptAt: Date.now() }),
        }),
        {
            name: 'zenly-review-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
