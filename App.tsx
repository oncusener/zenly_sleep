import React, { useState, useMemo, useRef } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    View, Text, TouchableOpacity, ScrollView,
    StatusBar, Image, Alert, TextInput, Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';

import { useSoundStore, SavedMix } from './stores/soundStore';
import { SOUNDS } from './constants/sounds';
import AudioProvider from './components/AudioProvider';

import { s, m } from './styles/sleep.styles';
import { SOUND_COLORS, MIX_IMAGES } from './styles/theme';

const Tab = createBottomTabNavigator();

// ── SaveMixModal ──────────────────────────────────────────────────────────────
function SaveMixModal({
                          visible, onClose, onSave,
                      }: { visible: boolean; onClose: () => void; onSave: (name: string) => void }) {
    const [name, setName] = useState('');

    function handleSave() {
        const t = name.trim();
        if (!t) { Alert.alert('İsim gerekli', 'Lütfen bir isim gir.'); return; }
        onSave(t);
        setName('');
        onClose();
    }

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={m.overlay}>
                <View style={m.sheet}>
                    <Text style={m.title}>Karışımı Kaydet</Text>
                    <Text style={m.sub}>Mevcut karışımına bir isim ver</Text>
                    <TextInput
                        style={m.input}
                        placeholder="ör. Yağmurlu Gece"
                        placeholderTextColor="#45484f"
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleSave}
                    />
                    <View style={m.row}>
                        <TouchableOpacity style={m.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                            <Text style={m.cancelText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={m.saveBtn} onPress={handleSave} activeOpacity={0.85}>
                            <Text style={m.saveText}>Kaydet</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ── SleepScreen ───────────────────────────────────────────────────────────────
function SleepScreen() {
    const {
        activeSounds, volumes, activeMixId, savedMixes,
        toggleSound, setVolume, clearAll, loadMix, saveMix, updateMix, deleteMix,
    } = useSoundStore();

    const [sleepTimer, setSleepTimer] = useState(30);
    const [timerActive, setTimerActive] = useState(false);
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [remaining, setRemaining] = useState(0);
    const fadeInterval = useRef<ReturnType<typeof setInterval> | null>(null);

    const activeMix = useMemo(
        () => savedMixes.find((mx) => mx.id === activeMixId) ?? null,
        [savedMixes, activeMixId]
    );

    const hasChanges = useMemo(() => {
        if (!activeMix) return false;
        const curSounds = [...activeSounds].sort().join(',');
        const savSounds = [...activeMix.sounds.map((s) => s.id)].sort().join(',');
        if (curSounds !== savSounds) return true;
        return activeSounds.some((id) => {
            const cur = Math.round((volumes[id] ?? 0.7) * 100);
            const sav = Math.round((activeMix.sounds.find((s) => s.id === id)?.volume ?? 0.7) * 100);
            return cur !== sav;
        });
    }, [activeSounds, volumes, activeMix]);

    function handleMixCardPress(mix: SavedMix) {
        if (activeMixId === mix.id) {
            clearAll();
        } else {
            loadMix(mix);
        }
    }

    function handleDeleteMix(mix: SavedMix) {
        Alert.alert(
            'Karışımı Sil',
            `"${mix.name}" silinsin mi?`,
            [
                { text: 'İptal', style: 'cancel' },
                { text: 'Sil', style: 'destructive', onPress: () => deleteMix(mix.id) },
            ]
        );
    }

    function startFade() {
        if (activeSounds.length === 0) {
            Alert.alert('Ses Seç', 'Önce en az bir ses seç.');
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
            soundsToFade.forEach(id => {
                setVolume(id, Math.max(0, (startVolumes[id] ?? 0.7) * factor));
            });
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

            {/* Top Bar */}
            <View style={s.topBar}>
                <View style={s.topBarLeft}>
                    <Text style={s.topBarIcon}>🌙</Text>
                    <Text style={s.topBarTitle}>ZENLY SLEEP</Text>
                </View>
                <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                    <Text style={s.settingsIcon}>⚙</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 56 }}>

                {/* ── SAVED MIXES ─────────────────────────────────────────────── */}
                <View style={s.section}>
                    <Text style={s.sectionLabel}>SAVED MIXES</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginLeft: -24, paddingLeft: 24, marginTop: 14 }}
                        contentContainerStyle={{ paddingRight: 24, gap: 14 }}
                    >
                        {savedMixes.map((mix) => {
                            const isActive = activeMixId === mix.id;
                            const hasImg = !!MIX_IMAGES[mix.id];
                            const accent = SOUND_COLORS[mix.sounds[0]?.id ?? 'rain'] ?? '#98a9ff';
                            return (
                                <TouchableOpacity
                                    key={mix.id}
                                    style={[
                                        s.mixCard,
                                        isActive && {
                                            borderColor: '#98a9ff',
                                            shadowColor: '#98a9ff',
                                            shadowOpacity: 0.5,
                                            shadowRadius: 16,
                                            shadowOffset: { width: 0, height: 0 },
                                            elevation: 12,
                                        },
                                    ]}
                                    onPress={() => handleMixCardPress(mix)}
                                    onLongPress={() => handleDeleteMix(mix)}
                                    activeOpacity={0.85}
                                >
                                    {hasImg ? (
                                        <>
                                            <Image
                                                source={{ uri: MIX_IMAGES[mix.id] }}
                                                style={[{ ...require('react-native').StyleSheet.absoluteFillObject }, { opacity: isActive ? 0.6 : 0.25 }]}
                                                resizeMode="cover"
                                            />
                                            <View style={s.mixCardOverlay} />
                                        </>
                                    ) : (
                                        <View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, { backgroundColor: accent + '20', borderRadius: 22 }]} />
                                    )}
                                    {isActive && (
                                        <View style={s.mixCheck}>
                                            <Text style={{ color: '#98a9ff', fontSize: 12 }}>✓</Text>
                                        </View>
                                    )}
                                    <View style={s.mixCardContent}>
                                        <Text style={[s.mixCardName, !isActive && { opacity: 0.6 }]}>{mix.name}</Text>
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

                {/* ── SOUNDS ──────────────────────────────────────────────────── */}
                <View style={s.section}>
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionLabel}>SOUNDS</Text>
                        {activeSounds.length > 0 && (
                            <TouchableOpacity onPress={clearAll}>
                                <Text style={s.clearAll}>Clear All</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={s.soundGrid}>
                        {SOUNDS.map((sound) => {
                            const isActive = activeSounds.includes(sound.id);
                            const accent = SOUND_COLORS[sound.id] ?? '#98a9ff';
                            return (
                                <TouchableOpacity
                                    key={sound.id}
                                    style={[
                                        s.soundTile,
                                        isActive && {
                                            borderColor: accent,
                                            shadowColor: accent,
                                            shadowOpacity: 0.3,
                                            shadowRadius: 12,
                                            shadowOffset: { width: 0, height: 0 },
                                        },
                                    ]}
                                    onPress={() => toggleSound(sound.id)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[s.soundTileEmoji, !isActive && { opacity: 0.35 }]}>
                                        {sound.emoji}
                                    </Text>
                                    <Text style={[s.soundTileName, { color: isActive ? accent : '#a9abb3' }]}>
                                        {sound.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* ── MIXER ───────────────────────────────────────────────────── */}
                {activeSounds.length > 0 && (
                    <View style={s.mixerPanel}>
                        {activeSounds.map((id) => {
                            const sound = SOUNDS.find((ss) => ss.id === id);
                            const vol = volumes[id] ?? 0.7;
                            const accent = SOUND_COLORS[id] ?? '#98a9ff';
                            return (
                                <View key={id} style={s.mixerRow}>
                                    <View style={s.mixerRowHeader}>
                                        <View style={s.mixerRowLeft}>
                                            <Text style={{ fontSize: 14 }}>{sound?.emoji}</Text>
                                            <Text style={s.mixerRowName}>{sound?.name} Volume</Text>
                                        </View>
                                        <Text style={[s.mixerRowPct, { color: accent }]}>
                                            {Math.round(vol * 100)}%
                                        </Text>
                                    </View>
                                    <Slider
                                        style={{ width: '100%', height: 36 }}
                                        minimumValue={0}
                                        maximumValue={1}
                                        step={0.01}
                                        value={vol}
                                        onValueChange={(v) => setVolume(id, v)}
                                        minimumTrackTintColor={accent}
                                        maximumTrackTintColor="#22262f"
                                        thumbTintColor="#ecedf6"
                                    />
                                </View>
                            );
                        })}

                        <View style={s.mixerActions}>
                            {activeMix ? (
                                hasChanges && (
                                    <TouchableOpacity
                                        style={s.updateBtn}
                                        onPress={() => updateMix(activeMix.id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={s.updateBtnText}>↻ "{activeMix.name}" Güncelle</Text>
                                    </TouchableOpacity>
                                )
                            ) : (
                                activeSounds.length >= 2 && (
                                    <TouchableOpacity
                                        style={s.saveNewBtn}
                                        onPress={() => setSaveModalVisible(true)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={s.saveNewBtnText}>+ Yeni Karışım Kaydet</Text>
                                    </TouchableOpacity>
                                )
                            )}
                        </View>
                    </View>
                )}

                {/* ── SLEEP TIMER ─────────────────────────────────────────────── */}
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

            <SaveMixModal
                visible={saveModalVisible}
                onClose={() => setSaveModalVisible(false)}
                onSave={(name) => saveMix(name)}
            />
        </View>
    );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
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
                        shadowColor: '#98a9ff',
                        shadowOffset: { width: 0, height: -12 },
                        shadowOpacity: 0.06,
                        shadowRadius: 24,
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