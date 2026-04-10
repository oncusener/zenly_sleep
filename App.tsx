import React, { useState } from 'react';
import {
    View, Text, TouchableOpacity, ScrollView,
    StatusBar, Image, Alert, TextInput, Modal, StyleSheet, ImageBackground,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Slider from '@react-native-community/slider';

import { useSoundStore, SavedMix } from './stores/soundStore';
import { SOUNDS } from './constants/sounds';
import AudioProvider from './components/AudioProvider';
import { s, m, p } from './styles/app.styles';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
const adUnitId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-7987749549764501/3268250644';
// ← YENİ: Splash import
import SplashScreen from './SplashScreen';

const Tab = createBottomTabNavigator();
const DEFAULT_VOLUME = 0.7;

const SOUND_COLORS: Record<string, string> = {
    ambient:       '#7ac97a',
    bass:          '#c678dd',
    rain:          '#6ea8fe',
    ocean:         '#98a9ff',
    wind:          '#5dd3b3',
    fire:          '#ff7f5c',
    forest:        '#56b6c2',
    river:         '#4ec9b0',
    thunder:       '#f5a623',
    cafe:          '#e8c07a',
    bus_noise:     '#abb2bf',
    baby_sleeping: '#f48fb1',
    street:        '#888780',
};

// ── SaveMixModal ──────────────────────────────────────────────────────────────

function SaveMixModal({
                          visible, onClose, onSave,
                      }: { visible: boolean; onClose: () => void; onSave: (name: string) => void }) {
    const [name, setName] = useState('');

    function handleSave() {
        const t = name.trim();
        if (!t) { Alert.alert('Name required', 'Please enter a name.'); return; }
        onSave(t);
        setName('');
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={m.overlay}>
                <View style={m.sheet}>
                    <Text style={m.title}>Save new mix</Text>
                    <Text style={m.sub}>Name your current mix</Text>
                    <TextInput
                        style={m.input}
                        placeholder="e.g. Rainy Night"
                        placeholderTextColor="#45484f"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                    />
                    <View style={m.row}>
                        <TouchableOpacity style={m.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                            <Text style={m.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={m.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                            <Text style={m.saveText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ── PremiumBanner ─────────────────────────────────────────────────────────────

function PremiumBanner({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity style={p.banner} onPress={onPress} activeOpacity={0.85}>
            <View style={p.bannerIcon}>
                <Text style={{ fontSize: 16 }}>✦</Text>
            </View>
            <View style={p.bannerText}>
                <Text style={p.bannerTitle}>Unlock all sounds</Text>
                <Text style={p.bannerSub}>Get access to premium sounds</Text>
            </View>
            <View style={p.bannerCta}>
                <Text style={p.bannerCtaText}>Upgrade →</Text>
            </View>
        </TouchableOpacity>
    );
}

// ── SoundCard ─────────────────────────────────────────────────────────────────

interface SoundCardProps {
    sound: typeof SOUNDS[number];
    isActive: boolean;
    isPremiumUser: boolean;
    volume: number;
    onToggle: () => void;
    onVolumeChange: (v: number) => void;
    onPremiumPress: () => void;
}

function SoundCard({
                       sound, isActive, isPremiumUser, volume,
                       onToggle, onVolumeChange, onPremiumPress,
                   }: SoundCardProps) {
    const accent = SOUND_COLORS[sound.id] ?? '#98a9ff';
    const isLocked = sound.premium && !isPremiumUser;

    if (isLocked) {
        return (
            <TouchableOpacity
                style={[s.soundCard, s.soundCardLocked]}
                onPress={onPremiumPress}
                activeOpacity={0.7}
            >
                {sound.image && (
                    <Image
                        source={sound.image}
                        style={[StyleSheet.absoluteFill, { borderRadius: 14, opacity: 0.18 }]}
                        resizeMode="cover"
                    />
                )}
                <View style={[StyleSheet.absoluteFill, { borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.55)' }]} />
                <View style={s.cardBottom}>
                    <Text style={s.cardNameLocked} numberOfLines={1}>
                        {sound.name.toUpperCase()}
                    </Text>
                    <View style={s.proBadge}>
                        <View style={s.proDot} />
                        <Text style={s.proBadgeText}>PRO</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    if (isActive) {
        return (
            <View style={[s.soundCard, s.soundCardActive, { borderColor: accent + '60' }]}>
                {sound.image && (
                    <Image
                        source={sound.image}
                        style={[StyleSheet.absoluteFill, { borderRadius: 14, opacity: 0.28 }]}
                        resizeMode="cover"
                    />
                )}
                <View style={[StyleSheet.absoluteFill, {
                    borderRadius: 14,
                    backgroundColor: 'rgba(0,0,0,0.45)',
                }]} />
                <View style={s.activeInner}>
                    <View style={s.activeHeader}>
                        <Text style={[s.cardNameActive, { color: accent }]} numberOfLines={1}>
                            {sound.name.toUpperCase()}
                        </Text>
                        <Text style={[s.cardVol, { color: accent }]}>
                            {Math.round(volume * 100)}%
                        </Text>
                        <TouchableOpacity
                            onPress={onToggle}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={[s.closeBtn, { color: accent + 'cc' }]}>X</Text>
                        </TouchableOpacity>
                    </View>
                    <Slider
                        style={s.slider}
                        minimumValue={0}
                        maximumValue={1}
                        step={0.01}
                        value={volume}
                        onValueChange={onVolumeChange}
                        minimumTrackTintColor={accent}
                        maximumTrackTintColor="#ffffff30"
                        thumbTintColor={accent}
                    />
                </View>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[s.soundCard, s.soundCardInactive]}
            onPress={onToggle}
            activeOpacity={0.8}
        >
            {sound.image && (
                <Image
                    source={sound.image}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14, opacity: 0.22 }]}
                    resizeMode="cover"
                />
            )}
            <View style={[StyleSheet.absoluteFill, { borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.38)' }]} />
            <View style={s.cardBottom}>
                <Text style={s.cardNameInactive} numberOfLines={1}>
                    {sound.name.toUpperCase()}
                </Text>
                <View style={s.freeBadge}>
                    <Text style={s.freeBadgeText}>FREE</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ── SleepScreen ───────────────────────────────────────────────────────────────
// (Orijinal kodunla aynı — dokunulmadı)

function SleepScreen() {
    const {
        activeSounds, volumes, activeMixId, savedMixes,
        toggleSound, setVolume, clearAll, loadMix, saveMix, updateMix, deleteMix,
    } = useSoundStore();

    const [isPremiumUser] = useState(false);
    const [sleepTimer, setSleepTimer] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [remaining, setRemaining] = useState(0);
    const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        return () => { if (fadeInterval.current) clearInterval(fadeInterval.current); };
    }, []);

    const activeMix = useMemo(
        () => savedMixes.find((mx) => mx.id === activeMixId) ?? null,
        [savedMixes, activeMixId],
    );

    const hasChanges = useMemo(() => {
        if (!activeMix) return false;
        const curSounds = [...activeSounds].sort().join(',');
        const savSounds = [...activeMix.sounds.map((snd) => snd.id)].sort().join(',');
        if (curSounds !== savSounds) return true;
        return activeSounds.some((id) => {
            const cur = Math.round((volumes[id] ?? DEFAULT_VOLUME) * 100);
            const sav = Math.round(
                (activeMix.sounds.find((snd) => snd.id === id)?.volume ?? DEFAULT_VOLUME) * 100,
            );
            return cur !== sav;
        });
    }, [activeSounds, volumes, activeMix]);

    function handlePremiumPress() {
        Alert.alert(
            'Unlock Premium',
            'Get access to all sounds with a premium subscription.',
            [
                { text: 'Not now', style: 'cancel' },
                { text: 'Upgrade', onPress: () => {} },
            ],
        );
    }

    function handleMixCardPress(mix: SavedMix) {
        if (activeMixId === mix.id) clearAll();
        else loadMix(mix);
    }

    function handleDeleteMix(mix: SavedMix) {
        Alert.alert('Delete mix', `Delete "${mix.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteMix(mix.id) },
        ]);
    }

    function startFade() {
        if (activeSounds.length === 0) {
            Alert.alert('No sounds', 'Select at least one sound first.');
            return;
        }
        const totalSeconds = sleepTimer * 60;
        const startVolumes = { ...volumes };
        const soundsToFade = [...activeSounds];
        let elapsed = 0;

        setRemaining(totalSeconds);
        setTimerActive(true);
        if (fadeInterval.current) clearInterval(fadeInterval.current);

        fadeInterval.current = setInterval(() => {
            elapsed += 1;
            const factor = 1 - elapsed / totalSeconds;
            soundsToFade.forEach((id) =>
                setVolume(id, Math.max(0, (startVolumes[id] ?? DEFAULT_VOLUME) * factor)),
            );
            setRemaining(totalSeconds - elapsed);
            if (elapsed >= totalSeconds) {
                clearInterval(fadeInterval.current!);
                fadeInterval.current = null;
                clearAll();
                setTimerActive(false);
                setRemaining(0);
            }
        }, 1000);
    }

    function cancelFade() {
        if (fadeInterval.current) clearInterval(fadeInterval.current);
        fadeInterval.current = null;
        setTimerActive(false);
        setRemaining(0);
    }

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.topBar}>
                <View style={s.topBarLeft}>
                    <Text style={s.topBarIcon}>🌙</Text>
                    <Text style={s.topBarTitle}>ZENLY SLEEP</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {savedMixes.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionLabel}>SAVED MIXES</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={s.mixScroll}
                            contentContainerStyle={{ paddingRight: 24, gap: 14 }}
                        >
                            {savedMixes.map((mix) => {
                                const isActive = activeMixId === mix.id;
                                const accent = SOUND_COLORS[mix.sounds[0]?.id ?? 'rain'] ?? '#98a9ff';
                                return (
                                    <TouchableOpacity
                                        key={mix.id}
                                        style={[s.mixCard, isActive && { borderColor: '#98a9ff' }]}
                                        onPress={() => handleMixCardPress(mix)}
                                        onLongPress={() => handleDeleteMix(mix)}
                                        activeOpacity={0.85}
                                    >
                                        <View style={[StyleSheet.absoluteFill, {
                                            backgroundColor: accent + '18', borderRadius: 22,
                                        }]} />
                                        {isActive && (
                                            <View style={s.mixCheck}>
                                                <Text style={{ color: '#98a9ff', fontSize: 12 }}>✓</Text>
                                            </View>
                                        )}
                                        <View style={s.mixCardContent}>
                                            <Text style={[s.mixCardName, !isActive && { opacity: 0.55 }]}>
                                                {mix.name}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                            <TouchableOpacity
                                style={s.mixCardAdd}
                                onPress={() => activeSounds.length >= 2 ? setSaveModalVisible(true) : null}
                                activeOpacity={0.7}
                            >
                                <Text style={s.mixCardAddIcon}>+</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}

                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionLabel}>SOUNDS</Text>
                        {activeSounds.length > 0 && (
                            <TouchableOpacity onPress={clearAll}>
                                <Text style={s.clearAll}>Clear all</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ alignItems: 'center', marginVertical: 10 }}>
                        <BannerAd
                            unitId={adUnitId}
                            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                        />
                    </View>
                    <View style={s.soundGrid}>
                        {SOUNDS.map((sound) => (
                            <SoundCard
                                key={sound.id}
                                sound={sound}
                                isActive={activeSounds.includes(sound.id)}
                                isPremiumUser={isPremiumUser}
                                volume={volumes[sound.id] ?? DEFAULT_VOLUME}
                                onToggle={() => toggleSound(sound.id)}
                                onVolumeChange={(v) => setVolume(sound.id, v)}
                                onPremiumPress={handlePremiumPress}
                            />
                        ))}
                    </View>
                </View>
                <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                    <BannerAd
                        unitId={adUnitId}
                        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                    />
                </View>
                <View style={s.section}>
                    <Text style={s.sectionLabel}>SLEEP TIMER</Text>
                    <View style={s.timerRow}>
                        {[15, 30, 45, 60].map((min) => (
                            <TouchableOpacity
                                key={min}
                                style={[s.timerBtn, sleepTimer === min && s.timerBtnActive]}
                                onPress={() => setSleepTimer(min)}
                                activeOpacity={0.8}
                            >
                                <Text style={[s.timerBtnText, sleepTimer === min && s.timerBtnTextActive]}>
                                    {min}m
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[s.startBtn, timerActive && s.startBtnActive]}
                        onPress={timerActive ? cancelFade : startFade}
                        activeOpacity={0.85}
                    >
                        <Text style={s.startBtnText}>
                            {timerActive
                                ? `Cancel — ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`
                                : `Start ${sleepTimer} Minute Fade`}
                        </Text>
                    </TouchableOpacity>
                    {timerActive && <Text style={s.fadeNote}>AUTOMATIC FADE-OUT ENABLED</Text>}
                </View>
            </ScrollView>
            <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
                <BannerAd
                    unitId={adUnitId}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{ requestNonPersonalizedAdsOnly: true }}
                />
            </View>
            {activeMix ? (
                hasChanges && (
                    <View style={s.bottomBar}>
                        <TouchableOpacity style={s.updateBtn} onPress={() => updateMix(activeMix.id)} activeOpacity={0.8}>
                            <Text style={s.updateBtnText}>Update "{activeMix.name}"</Text>
                        </TouchableOpacity>
                    </View>
                )
            ) : (
                <View style={s.bottomBar}>
                    <TouchableOpacity style={s.saveNewBtn} onPress={() => setSaveModalVisible(true)} activeOpacity={0.8}>
                        <Text style={s.saveNewBtnText}>+ Save as new mix</Text>
                    </TouchableOpacity>
                </View>
            )}

            <SaveMixModal
                visible={saveModalVisible}
                onClose={() => setSaveModalVisible(false)}
                onSave={(name) => saveMix(name)}
            />

        </View>
    );
}

// ── MainApp ───────────────────────────────────────────────────────────────────
// Tab navigator ayrı component'a çıkarıldı — splash sonrası render edilir

function MainApp() {
    return (
        <NavigationContainer>
            <AudioProvider />
            <Tab.Navigator
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                        backgroundColor: 'rgba(11,14,20,0.94)',
                        borderTopWidth: 0,
                        paddingBottom: 10,
                        height: 68,
                    },
                    tabBarActiveTintColor: '#98a9ff',
                    tabBarInactiveTintColor: '#45484f',
                    tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 1 },
                }}
            >
                <Tab.Screen
                    name="Sleep"
                    component={SleepScreen}
                    options={{
                        tabBarLabel: 'SLEEP',
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>🌙</Text>,
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

// ── App ───────────────────────────────────────────────────────────────────────
// ↓ Tek değişiklik: showSplash state ile SplashScreen → MainApp geçişi

import { useRef, useEffect, useMemo } from 'react';

export default function App() {
    const [showSplash, setShowSplash] = useState(true);

    return showSplash
        ? <SplashScreen onFinish={() => setShowSplash(false)} />
        : <MainApp />;
}