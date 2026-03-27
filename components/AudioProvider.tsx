import React, { useEffect, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSoundStore } from '../stores/soundStore';
import { SOUNDS } from '../constants/sounds';

// Her ses için ayrı component — useAudioPlayer hook kuralı gereği
function SoundPlayer({ file, volume }: { file: any; volume: number }) {
    const player = useAudioPlayer(file);
    const isReadyRef = useRef(false);

    useEffect(() => {
        player.loop = true;
        player.volume = volume;
        player.play();
        isReadyRef.current = true;

        return () => {
            try { player.pause(); } catch (_) {}
        };
    }, []);

    useEffect(() => {
        if (!isReadyRef.current) return;
        try { player.volume = volume; } catch (_) {}
    }, [volume]);

    return null;
}

// Ana provider — App.tsx veya layout'a ekle, bir kez render edilmeli
export default function AudioProvider() {
    const { activeSounds, volumes } = useSoundStore();

    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true,
            interruptionMode: 'mixWithOthers',
        }).catch(console.warn);
    }, []);

    return (
        <>
            {activeSounds.map((id) => {
                const sound = SOUNDS.find(s => s.id === id);
                if (!sound) return null;
                return (
                    <SoundPlayer
                        key={id}
                        file={sound.file}
                        volume={volumes[id] ?? 0.7}
                    />
                );
            })}
        </>
    );
}