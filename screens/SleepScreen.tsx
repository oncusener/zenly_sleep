import React, { useState, useEffect, useMemo } from 'react';
import {
    View as RNView, Text as RNText, TouchableOpacity, ScrollView,
    StyleSheet, StatusBar, Dimensions, Alert
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { useSoundStore } from '../stores/soundStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { SOUNDS } from '../constants/sounds';

const { width } = Dimensions.get('window');

// ── Her aktif ses için ayrı player component'i ──────────────────────────────
// Hook kuralı: useAudioPlayer her zaman aynı sayıda çağrılmalı.
// Bunu garantilemek için her sesi ayrı component'e alıyoruz.
function SoundPlayer({ file, volume }: { file: any; volume: number }) {
    const player = useAudioPlayer(file);

    useEffect(() => {
        player.loop = true;
        player.volume = volume;
        player.play();
        return () => {
            try { player.pause(); } catch (_) {}
        };
    }, []);

    useEffect(() => {
        try { player.volume = volume; } catch (_) {}
    }, [volume]);

    return null;
}

// ── Ana ekran ────────────────────────────────────────────────────────────────
export default function SleepScreen() {
    const {
        activeSounds,
        volumes,
        savedMixes,
        activeMixId,
        toggleSound,
        updateMix,
        saveMix,
        loadMix,
        deleteMix,
        clearAll,
    } = useSoundStore();

    const { setVolume: setAudioVolume } = useAudioEngine();

    const [sleepTimer, setSleepTimer] = useState(30);

    // Audio session'ı bir kez ayarla
    useEffect(() => {
        setAudioModeAsync({
            playsInSilentMode: true,
            shouldPlayInBackground: true,
            interruptionMode: 'mixWithOthers',
        }).catch(console.warn);
    }, []);

    // Seçili mix
    const activeMix = useMemo(
        () => savedMixes.find(m => m.id === activeMixId),
        [savedMixes, activeMixId]
    );

    // Değişiklik kontrolü
    const hasChanges = useMemo(() => {
        if (!activeMix) return false;
        const currentSounds = [...activeSounds].sort().join(',');
        const savedSounds = [...activeMix.sounds.map(s => s.id)].sort().join(',');
        if (currentSounds !== savedSounds) return true;
        return activeSounds.some(id => {
            const currentVol = Math.round((volumes[id] ?? 0.7) * 100);
            const savedVol = Math.round((activeMix.sounds.find(s => s.id === id)?.volume ?? 0.7) * 100);
            return currentVol !== savedVol;
        });
    }, [activeSounds, volumes, activeMix]);

    return (
        <RNView style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Aktif sesler için player'lar — görünmez, sadece ses çalar */}
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

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* BAŞLIK */}
                <RNView style={styles.header}>
                    <RNText style={styles.title}>Zenly Sleep</RNText>
                </RNView>

                {/* KAYITLI KARIŞIMLAR */}
                {savedMixes.length > 0 && (
                    <RNView style={styles.presetsContainer}>
                        <RNText style={styles.sectionLabel}>KAYITLI KARIŞIMLARIM</RNText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.presetsScroll}
                        >
                            {savedMixes.map((mix) => {
                                const isSelected = activeMixId === mix.id;
                                return (
                                    <TouchableOpacity
                                        key={mix.id}
                                        style={[styles.presetCard, isSelected && styles.presetCardActive]}
                                        onPress={() => isSelected ? clearAll() : loadMix(mix)}
                                    >
                                        <TouchableOpacity
                                            style={styles.deleteBtn}
                                            onPress={() => deleteMix(mix.id)}
                                        >
                                            <RNText style={styles.deleteBtnText}>✕</RNText>
                                        </TouchableOpacity>
                                        <RNText style={styles.presetEmoji}>{isSelected ? '🔊' : '✨'}</RNText>
                                        <RNText style={styles.presetName}>{mix.name}</RNText>
                                        <RNView style={styles.mixActionRow}>
                                            <RNText style={styles.presetDetail}>
                                                {mix.sounds.length} ses
                                            </RNText>
                                            <RNView style={[styles.playCircle, isSelected && styles.playCircleActive]}>
                                                <RNText style={{ color: '#fff', fontSize: 12 }}>
                                                    {isSelected ? '⏸' : '▶'}
                                                </RNText>
                                            </RNView>
                                        </RNView>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </RNView>
                )}

                {/* SES GRİDİ */}
                <RNText style={styles.sectionLabel}>SESLER</RNText>
                <RNView style={styles.soundGrid}>
                    {SOUNDS.map((sound) => {
                        const isActive = activeSounds.includes(sound.id);
                        return (
                            <TouchableOpacity
                                key={sound.id}
                                style={[styles.soundBtn, isActive && styles.soundBtnActive]}
                                onPress={() => toggleSound(sound.id)}
                            >
                                <RNText style={[styles.soundEmoji, !isActive && { opacity: 0.3 }]}>
                                    {sound.emoji}
                                </RNText>
                                <RNText style={[styles.soundName, isActive && styles.soundNameActive]}>
                                    {sound.name}
                                </RNText>
                            </TouchableOpacity>
                        );
                    })}
                </RNView>

                {/* MİKSER */}
                {activeSounds.length > 0 && (
                    <RNView style={styles.mixerSection}>
                        <RNText style={styles.sectionLabel}>MİKSER</RNText>
                        {activeSounds.map((id) => {
                            const sound = SOUNDS.find(s => s.id === id);
                            const vol = volumes[id] ?? 0.7;
                            return (
                                <RNView key={id} style={styles.mixerRow}>
                                    <RNText style={styles.mixerEmoji}>{sound?.emoji}</RNText>
                                    <Slider
                                        style={{ flex: 1, height: 40 }}
                                        minimumValue={0}
                                        maximumValue={1}
                                        step={0.01}
                                        value={vol}
                                        onValueChange={(v) => setAudioVolume(id, v)}
                                        minimumTrackTintColor="#7c9fff"
                                        maximumTrackTintColor="#1a2030"
                                        thumbTintColor="#7c9fff"
                                    />
                                    <RNText style={styles.volText}>{Math.round(vol * 100)}%</RNText>
                                </RNView>
                            );
                        })}

                        {/* KAYDET / GÜNCELLE BUTONU */}
                        <RNView style={{ marginTop: 20, alignItems: 'center' }}>
                            {activeMix ? (
                                hasChanges && (
                                    <TouchableOpacity
                                        style={styles.updateMixBtn}
                                        onPress={() => updateMix(activeMix.id)}
                                    >
                                        <RNText style={styles.updateMixText}>
                                            ↻ "{activeMix.name}" Karışımını Güncelle
                                        </RNText>
                                    </TouchableOpacity>
                                )
                            ) : (
                                activeSounds.length > 1 && (
                                    <TouchableOpacity
                                        style={styles.saveMixBtn}
                                        onPress={() =>
                                            Alert.prompt(
                                                'İsim Ver',
                                                '',
                                                (name) => name && saveMix(name)
                                            )
                                        }
                                    >
                                        <RNText style={styles.saveMixText}>+ Yeni Karışım Kaydet</RNText>
                                    </TouchableOpacity>
                                )
                            )}
                        </RNView>
                    </RNView>
                )}

                <RNView style={{ height: 100 }} />
            </ScrollView>
        </RNView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0d14' },
    header: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 20 },
    title: { fontSize: 32, fontWeight: '700', color: '#e8eaf0' },
    sectionLabel: { fontSize: 11, letterSpacing: 1.5, color: '#4b5563', paddingHorizontal: 24, marginBottom: 12, fontWeight: '700' },
    presetsContainer: { marginBottom: 24 },
    presetsScroll: { paddingHorizontal: 20, gap: 12 },
    presetCard: { backgroundColor: '#121620', borderRadius: 24, padding: 16, width: 160, borderWidth: 2, borderColor: 'transparent' },
    presetCardActive: {
        borderColor: '#7c9fff',
        backgroundColor: 'rgba(124,159,255,0.15)',
        shadowColor: '#7c9fff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 15,
    },
    updateMixBtn: { backgroundColor: 'rgba(124,159,255,0.2)', borderColor: '#7c9fff', borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30 },
    updateMixText: { color: '#7c9fff', fontWeight: 'bold', fontSize: 13 },
    saveMixBtn: { backgroundColor: 'rgba(110,231,183,0.1)', borderColor: '#6ee7b7', borderWidth: 1.5, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30 },
    saveMixText: { color: '#6ee7b7', fontWeight: 'bold', fontSize: 13 },
    deleteBtn: { position: 'absolute', top: 10, right: 10, zIndex: 10 },
    deleteBtnText: { color: '#ff4d4d', fontSize: 14 },
    presetEmoji: { fontSize: 24, marginBottom: 8 },
    presetName: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    mixActionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    presetDetail: { color: '#6b7280', fontSize: 12 },
    playCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1a2030', alignItems: 'center', justifyContent: 'center' },
    playCircleActive: { backgroundColor: '#7c9fff' },
    soundGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
    soundBtn: { width: (width - 52) / 3, backgroundColor: '#121620', borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
    soundBtnActive: { borderColor: '#7c9fff', borderWidth: 1.5 },
    soundEmoji: { fontSize: 30, marginBottom: 8 },
    soundName: { fontSize: 12, color: '#6b7280' },
    soundNameActive: { color: '#7c9fff', fontWeight: 'bold' },
    mixerSection: { paddingHorizontal: 24, marginTop: 24 },
    mixerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    mixerEmoji: { fontSize: 20, marginRight: 12 },
    volText: { fontSize: 12, color: '#6b7280', width: 35, textAlign: 'right' },
});