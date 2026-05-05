import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SavedMix = {
    id: string;
    name: string;
    createdAt: number;
    sounds: { id: string; volume: number }[];
};

type SoundStore = {
    activeSounds: string[];
    volumes: Record<string, number>;
    activeMixId: string | null;
    savedMixes: SavedMix[];

    toggleSound: (id: string) => void;
    setVolume: (id: string, volume: number) => void;
    clearAll: () => void;
    loadMix: (mix: SavedMix) => void;
    saveMix: (name: string) => void;
    updateMix: (id: string) => void;
    deleteMix: (id: string) => void;
};

export const useSoundStore = create<SoundStore>()(
    persist(
        (set, get) => ({
            activeSounds: [],
            volumes: {},
            activeMixId: null,
            savedMixes: [],

            toggleSound: (id) =>
                set((state) => {
                    const isActive = state.activeSounds.includes(id);
                    const next = isActive
                        ? state.activeSounds.filter((s) => s !== id)
                        : state.activeSounds.length < 5
                            ? [...state.activeSounds, id]
                            : state.activeSounds;
                    return { activeSounds: next, activeMixId: null };
                }),

            setVolume: (id, volume) =>
                set((state) => ({
                    volumes: { ...state.volumes, [id]: volume },
                })),
            clearAll: () => set({ activeSounds: [], activeMixId: null, volumes: {} }),


            loadMix: (mix) =>
                set({
                    activeSounds: mix.sounds.map((s) => s.id),
                    volumes: Object.fromEntries(mix.sounds.map((s) => [s.id, s.volume])),
                    activeMixId: mix.id,
                }),

            saveMix: (name) => {
                const { activeSounds, volumes } = get();
                const newMix: SavedMix = {
                    id: `mix-${Date.now()}`,
                    name,
                    createdAt: Date.now(),
                    sounds: activeSounds.map((id) => ({ id, volume: volumes[id] ?? 0.7 })),
                };
                set((state) => ({
                    savedMixes: [newMix, ...state.savedMixes],
                    activeMixId: newMix.id,
                }));
            },

            updateMix: (id) => {
                const { activeSounds, volumes } = get();
                set((state) => ({
                    savedMixes: state.savedMixes.map((m) =>
                        m.id === id
                            ? {
                                ...m,
                                sounds: activeSounds.map((sid) => ({ id: sid, volume: volumes[sid] ?? 0.7 })),
                            }
                            : m
                    ),
                    activeMixId: id,
                }));
            },

            deleteMix: (id) =>
                set((state) => ({
                    savedMixes: state.savedMixes.filter((m) => m.id !== id),
                    activeMixId: state.activeMixId === id ? null : state.activeMixId,
                })),
        }),
        {
            name: 'zenly-mix-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ savedMixes: state.savedMixes }),
        }
    )
);