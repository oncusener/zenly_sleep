import React, { useState, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
    View, Text, TouchableOpacity, ScrollView, StyleSheet,
    StatusBar, Dimensions, Image, Alert, TextInput, Modal,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSoundStore, SavedMix } from './stores/soundStore';
import { SOUNDS } from './constants/sounds';
import FocusScreen from './screens/FocusScreen';
import AudioProvider from './components/AudioProvider';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// ── Sabitler ─────────────────────────────────────────────────────────────────
const SOUND_COLORS: Record<string, string> = {
    rain:   '#98a9ff',
    ocean:  '#83fba5',
    wind:   '#a8b8ff',
    fire:   '#ff6e84',
    white:  '#98a9ff',
    forest: '#83fba5',
    fan:    '#75ec98',
    brown:  '#f4c97a',
};

const SOUND_SUBTITLES: Record<string, string> = {
    rain:   'STEADY RAINFALL',
    ocean:  'DISTANT TIDES',
    wind:   'GENTLE BREEZE',
    fire:   'CRACKLE & WARMTH',
    white:  'FULL SPECTRUM',
    forest: 'BIRDSONG & LEAVES',
    fan:    'AMBIENT DRONE',
    brown:  'DEEP RUMBLE',
};

const MIX_IMAGES: Record<string, string> = {
    'seed-1': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbraQ_xRwhibLS_cGBUikvPimCWdUDKicHe_KVjc-PKKeLosKDfkbF68nITjOh0pYhuwnXpxPtkDt8sBSsCeytw6sC0CE4sFSdqb6ipY0bQCFfbcH4yKEcwK-mR6NBxa7cPGxC6oPVekbFFwiUM7XHztfvDCwl55tjU4vk17nAAH8l_CO9BDeV4NGavMtpADw9Z7uo61JzNnZ6PUi2ssq8iZT4IVROPHAPR973UQkoGxAUthiYUg54GyVNeSoYaTIPPYZ05RDHjvkl',
    'seed-2': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaMoMCgpNHMnwKbVawjQtt7fKW0XJKYDqnMvedgrvnUg40iPScXJyIKjByBKWU21h0lLnfN-otqINcYTFqUgyYpb8V71sHUsjlcbHOoTFFHJ4-Q-_PxZf2_sLWesGPQcg4m2MNL-sIP_aSXXVtsH2ZcA-9ObSkvqwmjkstg6eA_KlmIDSi1CCRMzOtbM3XBdCCJ7dkQR3O3sujmzkJ-fz_-Ei6TcFpkowoKClWx9MHS33gj0_L0Jps8rimelbPR1t7BfPTZm8Syd5w',
    'seed-3': 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX-KiuxM7gZlo_Lz_KKdYwTSFRLBmbuCbMF285XQhDa8Y2y9gfPJJR2LchDnLXJ8ug79HILyh1APW4fNXb6MAfSykj-WpSJ2h4OtPNK5lw3YqaDEXU_d2iowy6nmMhJ4RUooCN_geHsm3HK980yU0Yh3vYf8e1Bp9HLx14S5VSBmOkjojF5F5xPRnCbW5R9mR0mR1izzzHv658qr7VPXyXqEEQXcMp-_Kua9GezvnwYnpU6GhV4ufxMSy2RWlSTVwJpCgu_LAjplJj',
};

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

    // Aktif mix objesi
    const activeMix = useMemo(
        () => savedMixes.find((m) => m.id === activeMixId) ?? null,
        [savedMixes, activeMixId]
    );

    // Değişiklik var mı? (mix yüklüyse sesler veya volumeler farklılaştı mı)
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

                {/* ── SAVED MIXES ─────────────────────────────────────────────────── */}
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
                                                style={[StyleSheet.absoluteFill, { opacity: isActive ? 0.6 : 0.25 }]}
                                                resizeMode="cover"
                                            />
                                            <View style={s.mixCardOverlay} />
                                        </>
                                    ) : (
                                        <View style={[StyleSheet.absoluteFill, { backgroundColor: accent + '20', borderRadius: 22 }]} />
                                    )}
                                    {/* Seçili check */}
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

                        {/* Yeni karışım ekle butonu */}
                        <TouchableOpacity
                            style={s.mixCardAdd}
                            onPress={() => activeSounds.length >= 2 ? setSaveModalVisible(true) : null}
                            activeOpacity={0.7}
                        >
                            <Text style={s.mixCardAddIcon}>+</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* ── SOUNDS ──────────────────────────────────────────────────────── */}
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
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    {/* Sound names row */}
                    <View style={s.soundNamesRow}>
                        {SOUNDS.map((sound) => {
                            const isActive = activeSounds.includes(sound.id);
                            const accent = SOUND_COLORS[sound.id] ?? '#98a9ff';
                            return (
                                <Text
                                    key={sound.id}
                                    style={[
                                        s.soundTileName,
                                        isActive ? { color: accent } : { color: '#a9abb3' },
                                    ]}
                                >
                                    {sound.name}
                                </Text>
                            );
                        })}
                    </View>
                </View>

                {/* ── MIXER ───────────────────────────────────────────────────────── */}
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

                        {/* Buton alanı */}
                        <View style={s.mixerActions}>
                            {activeMix ? (
                                // Mix yüklüyse ve değişiklik varsa → UPDATE butonu
                                hasChanges && (
                                    <TouchableOpacity
                                        style={s.updateBtn}
                                        onPress={() => updateMix(activeMix.id)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={s.updateBtnText}>↻  "{activeMix.name}" Güncelle</Text>
                                    </TouchableOpacity>
                                )
                            ) : (
                                // Mix yüklü değilse ve 2+ ses varsa → SAVE butonu
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

                {/* ── SLEEP TIMER ─────────────────────────────────────────────────── */}
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
                        onPress={() => setTimerActive(!timerActive)}
                        activeOpacity={0.85}
                    >
                        <Text style={s.startBtnText}>
                            {timerActive ? `Stop Timer` : `Start ${sleepTimer} Minute Fade`}
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
            {/* Audio engine — navigation dışında, tüm uygulama boyunca yaşıyor */}
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
                <Tab.Screen
                    name="Focus"
                    component={FocusScreen}
                    options={{
                        tabBarLabel: 'FOCUS',
                        tabBarIcon: ({ color }) => <Text style={{ fontSize: 18, color }}>⏱</Text>,
                    }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

// ── Stiller ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0b0e14' },

    topBar: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 58, paddingHorizontal: 24, paddingBottom: 12,
    },
    topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    topBarIcon: { fontSize: 22 },
    topBarTitle: { fontSize: 18, fontWeight: '800', color: '#98a9ff', letterSpacing: 3 },
    settingsIcon: { fontSize: 22, color: '#a9abb3' },

    section: { paddingHorizontal: 24, marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 },
    sectionLabel: { fontSize: 10, letterSpacing: 2.5, color: '#a9abb3', fontWeight: '700', marginBottom: 0 },
    clearAll: { fontSize: 12, color: '#8197ff', fontWeight: '500' },

    // Mix kartları
    mixCard: {
        width: 128, height: 128, borderRadius: 22,
        backgroundColor: '#161a21', overflow: 'hidden',
        justifyContent: 'flex-end',
        borderWidth: 1, borderColor: 'transparent',
    },
    mixCardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(11,14,20,0.5)',
    },
    mixCheck: {
        position: 'absolute', top: 10, right: 10,
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: 'rgba(152,169,255,0.2)',
        borderWidth: 1, borderColor: '#98a9ff',
        alignItems: 'center', justifyContent: 'center',
    },
    mixCardContent: { padding: 12 },
    mixCardName: { fontSize: 16, fontWeight: '700', color: '#ecedf6' },
    mixCardAdd: {
        width: 128, height: 128, borderRadius: 22,
        borderWidth: 2, borderColor: 'rgba(69,72,79,0.4)',
        borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    },
    mixCardAddIcon: { fontSize: 28, color: '#45484f' },

    // Sound tiles — kare büyük ikonlar
    soundGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: 12, marginTop: 16,
    },
    soundTile: {
        width: (width - 48 - 36) / 3,
        aspectRatio: 1,
        backgroundColor: '#161a21',
        borderRadius: 22,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: 'transparent',
    },
    soundTileEmoji: { fontSize: 32 },
    soundNamesRow: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: 12, marginTop: 8,
    },
    soundTileName: {
        width: (width - 48 - 36) / 3,
        fontSize: 11, fontWeight: '500',
        textAlign: 'center',
    },

    // Mixer panel
    mixerPanel: {
        marginHorizontal: 24, marginBottom: 32,
        backgroundColor: '#10131a', borderRadius: 20,
        padding: 20, borderWidth: 1, borderColor: 'rgba(152,169,255,0.1)',
    },
    mixerRow: { marginBottom: 8 },
    mixerRowHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 0,
    },
    mixerRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    mixerRowName: { fontSize: 13, fontWeight: '500', color: '#ecedf6' },
    mixerRowPct: { fontSize: 13, fontWeight: '700' },
    mixerActions: { marginTop: 12, alignItems: 'center' },
    updateBtn: {
        paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
        borderWidth: 1.5, borderColor: '#98a9ff',
        backgroundColor: 'rgba(152,169,255,0.08)', width: '100%', alignItems: 'center',
    },
    updateBtnText: { color: '#98a9ff', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
    saveNewBtn: {
        paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
        borderWidth: 1.5, borderColor: '#83fba5',
        backgroundColor: 'rgba(131,251,165,0.08)', width: '100%', alignItems: 'center',
    },
    saveNewBtnText: { color: '#83fba5', fontWeight: '700', fontSize: 13 },

    // Sleep timer
    timerRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 16 },
    timerBtn: {
        flex: 1, paddingVertical: 12, borderRadius: 20,
        backgroundColor: '#1c2028', alignItems: 'center',
    },
    timerBtnActive: {
        backgroundColor: '#98a9ff',
        shadowColor: '#98a9ff', shadowOpacity: 0.3,
        shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    },
    timerBtnText: { fontSize: 13, fontWeight: '500', color: '#a9abb3' },
    timerBtnTextActive: { color: '#002184', fontWeight: '700' },
    startBtn: {
        paddingVertical: 20, borderRadius: 24,
        backgroundColor: '#98a9ff', alignItems: 'center',
        shadowColor: '#98a9ff', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25, shadowRadius: 24,
    },
    startBtnActive: { backgroundColor: '#374151', shadowOpacity: 0 },
    startBtnText: { fontSize: 17, fontWeight: '800', color: '#002184' },
    fadeNote: {
        fontSize: 9, color: '#a9abb3', letterSpacing: 3,
        marginTop: 14, textAlign: 'center',
    },
});

// Modal stilleri
const m = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#161a21',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 28, paddingBottom: 48,
    },
    title: { fontSize: 20, fontWeight: '700', color: '#ecedf6', marginBottom: 6 },
    sub: { fontSize: 13, color: '#a9abb3', marginBottom: 20 },
    input: {
        backgroundColor: '#22262f', borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 15, color: '#ecedf6', marginBottom: 20,
    },
    row: { flexDirection: 'row', gap: 12 },
    cancelBtn: {
        flex: 1, paddingVertical: 16, borderRadius: 14,
        backgroundColor: '#22262f', alignItems: 'center',
    },
    cancelText: { fontSize: 15, fontWeight: '600', color: '#a9abb3' },
    saveBtn: {
        flex: 1, paddingVertical: 16, borderRadius: 14,
        backgroundColor: '#98a9ff', alignItems: 'center',
    },
    saveText: { fontSize: 15, fontWeight: '700', color: '#002184' },
});