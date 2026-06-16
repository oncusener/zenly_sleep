import React, { useEffect, useRef } from 'react';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSoundStore } from '../stores/soundStore';
import { SOUNDS } from '../constants/sounds';

const CROSSFADE_MS = 600;     // geçiş süresi (titiz desenli seslerde 800-1000)
const HEAD_TRIM_SEC = 0.05;   // MP3 baş padding'ini atla (müzik/ritimliyse 0 yap)
const TAIL_TRIM_SEC = 0.05;   // MP3 son padding'ini atla

function SoundPlayer({ file, volume }: { file: any; volume: number }) {
    const playerA = useAudioPlayer(file);
    const playerB = useAudioPlayer(file);
    const volumeRef = useRef(volume);
    const activeRef = useRef<'A' | 'B'>('A');
    const isFadingRef = useRef(false);
    const loopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let cancelled = false;
        const pick = (k: 'A' | 'B') => (k === 'A' ? playerA : playerB);

        // B player'ını ısıt — sonraki seekTo'ların güvenilir çalışması için
        try { playerB.volume = 0; playerB.play(); playerB.pause(); } catch {}

        function crossfade(next: 'A' | 'B') {
            const nxt = pick(next);
            const cur = pick(next === 'A' ? 'B' : 'A');
            isFadingRef.current = true;

            try { nxt.seekTo(HEAD_TRIM_SEC); } catch {}
            try { nxt.volume = 0; } catch {}
            try { nxt.play(); } catch {}

            const steps = 24;
            let i = 0;
            if (fadeTimer.current) clearInterval(fadeTimer.current);
            fadeTimer.current = setInterval(() => {
                i++;
                const t = i / steps;
                const target = volumeRef.current;
                try { nxt.volume = target * t; } catch {}
                try { cur.volume = target * (1 - t); } catch {}
                if (i >= steps) {
                    clearInterval(fadeTimer.current!);
                    try { cur.pause(); } catch {}
                    isFadingRef.current = false;
                }
            }, CROSSFADE_MS / steps);

            activeRef.current = next;
        }

        function schedule() {
            const cur = pick(activeRef.current);
            const dur = cur.duration;
            if (!dur || dur < 0.5) {                 // duration hazır değil, tekrar dene
                loopTimer.current = setTimeout(schedule, 150);
                return;
            }
            const fireIn = Math.max(50, (dur - TAIL_TRIM_SEC) * 1000 - CROSSFADE_MS);
            loopTimer.current = setTimeout(() => {
                if (cancelled) return;
                crossfade(activeRef.current === 'A' ? 'B' : 'A');
                schedule();
            }, fireIn);
        }

        // A'yı başlat — ilk çalışta seek yok, sadece play
        try { playerA.volume = volume; } catch {}
        try { playerA.play(); } catch {}
        activeRef.current = 'A';
        schedule();

        return () => {
            cancelled = true;
            if (loopTimer.current) clearTimeout(loopTimer.current);
            if (fadeTimer.current) clearInterval(fadeTimer.current);
            try { playerA.pause(); } catch {}
            try { playerB.pause(); } catch {}
        };
    }, []);

    // store'dan canlı ses değişimi (fade sırasında dokunma)
    useEffect(() => {
        volumeRef.current = volume;
        if (isFadingRef.current) return;
        const active = activeRef.current === 'A' ? playerA : playerB;
        try { active.volume = volume; } catch {}
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