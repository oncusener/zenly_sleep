import React, { useEffect, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSoundStore } from '../stores/soundStore';
import { SOUNDS } from '../constants/sounds';

function SoundPlayer({ file, volume }: { file: any; volume: number }) {
    const player = useAudioPlayer(file);
    const volumeRef = useRef(volume);
    const isReadyRef = useRef(false);
    const crossfadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function scheduleRestart(durationSec: number) {
        if (crossfadeTimer.current) clearTimeout(crossfadeTimer.current);

        // Bitmeden 300ms önce currentTime'ı sıfırla — native buffer doluyken kesinti olmaz
        const delay = Math.max(0, (durationSec - 0.3) * 1000);

        crossfadeTimer.current = setTimeout(() => {
            try {
                player.currentTime = 0;
                player.volume = volumeRef.current;
                // Süreyi tekrar al ve yeniden planla
                const dur = player.duration;
                if (dur && dur > 0.5) scheduleRestart(dur);
            } catch (_) {}
        }, delay);
    }

    useEffect(() => {
        player.loop = true;   // native loop — JS overhead yok
        player.volume = volume;
        player.play();
        isReadyRef.current = true;

        // Duration hazır olana kadar polling
        const poll = setInterval(() => {
            const dur = player.duration;
            if (dur && dur > 0.5) {
                clearInterval(poll);
                // Native loop yeterliyse scheduleRestart'a gerek yok
                // Ama yine de güvenlik için ekleyelim
            }
        }, 100);

        return () => {
            clearInterval(poll);
            if (crossfadeTimer.current) clearTimeout(crossfadeTimer.current);
            try { player.pause(); } catch (_) {}
        };
    }, []);

    useEffect(() => {
        volumeRef.current = volume;
        if (!isReadyRef.current) return;
        try { player.volume = volume; } catch (_) {}
    }, [volume]);

    return null;
}

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