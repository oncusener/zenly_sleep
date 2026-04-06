import { useSoundStore } from '../stores/soundStore';

export function useAudioEngine() {
    const { setVolume: storeSetVolume } = useSoundStore();

    const setVolume = (id: string, vol: number) => {
        storeSetVolume(id, vol);
    };

    return { setVolume };
}