import React, { useEffect, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSoundStore } from '../stores/soundStore';
import { SOUNDS } from '../constants/sounds';

const LOAD_POLL_MS = 100;      // asset yüklenene kadar bekleme aralığı
const WATCHDOG_MS = 5000;      // beklenmedik duruşları yakalama aralığı

/**
 * Her ses için TEK player + native loop.
 *
 * Önceki tasarım her ses için iki player açıp (A/B) aralarında crossfade
 * yapıyordu. Android'de duraklatılan player unload oluyor (isLoaded=false),
 * dolayısıyla ilk turdan sonra B'den A'ya dönülemiyor ve ses tamamen susuyordu
 * — sesler loop noktasına geldikçe teker teker ölüyordu. Native loop bu sınıf
 * hatayı tamamen ortadan kaldırıyor, üstelik yarı yarıya daha az native player
 * kullanıyor (5 ses için 10 değil 5).
 */
function SoundPlayer({ file, volume }: { file: any; volume: number }) {
    const player = useAudioPlayer(file);
    const volumeRef = useRef(volume);
    const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const watchdog = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let cancelled = false;

        // Asset yüklenmeden play() çağrılırsa ses hiç başlamıyor ve bir daha
        // denenmiyor. Yüklenene kadar bekleyip öyle başlat.
        function start() {
            if (cancelled) return;
            if (!player.isLoaded) {
                startTimer.current = setTimeout(start, LOAD_POLL_MS);
                return;
            }
            try { player.loop = true; } catch {}
            try { player.volume = volumeRef.current; } catch {}
            try { player.play(); } catch {}
        }

        start();

        // Uygulama saatlerce açık kalıyor; kesinti/odak kaybı sonrası bir ses
        // sessizce durursa kendi kendine toparlasın.
        watchdog.current = setInterval(() => {
            if (cancelled) return;
            if (player.isLoaded && !player.playing) {
                try { player.loop = true; } catch {}
                try { player.play(); } catch {}
            }
        }, WATCHDOG_MS);

        return () => {
            cancelled = true;
            if (startTimer.current) clearTimeout(startTimer.current);
            if (watchdog.current) clearInterval(watchdog.current);
            try { player.pause(); } catch {}
        };
    }, []);

    // store'dan canlı ses değişimi
    useEffect(() => {
        volumeRef.current = volume;
        try { player.volume = volume; } catch {}
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
