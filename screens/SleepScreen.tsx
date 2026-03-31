// import React, { useState, useMemo, useRef } from 'react';
// import {
//     View, Text, TouchableOpacity, ScrollView, Image, Alert,
//     TextInput, Modal, StatusBar
// } from 'react-native';
// import Slider from '@react-native-community/slider';
// import { useSoundStore, SavedMix } from './stores/soundStore';
// import { SOUNDS } from './constants/sounds';
//
// // Yeni ayırdığımız stilleri içe aktarıyoruz
// import { sleepStyles as s, modalStyles as m } from './styles/sleep.styles';
// import { COLORS } from './styles/theme';
//
// // ── SaveMixModal ──────────────────────────────────────────────────────────────
// function SaveMixModal({ visible, onClose, onSave }) {
//     const [name, setName] = useState('');
//
//     function handleSave() {
//         const t = name.trim();
//         if (!t) { Alert.alert('İsim gerekli', 'Lütfen bir isim gir.'); return; }
//         onSave(t);
//         setName('');
//         onClose();
//     }
//
//     return (
//         <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
//             <View style={m.overlay}>
//                 <View style={m.sheet}>
//                     <Text style={m.title}>Karışımı Kaydet</Text>
//                     <Text style={m.sub}>Mevcut karışımına bir isim ver</Text>
//                     <TextInput
//                         style={m.input}
//                         placeholder="ör. Yağmurlu Gece"
//                         placeholderTextColor={COLORS.onSurfaceVariant}
//                         value={name}
//                         onChangeText={setName}
//                         autoFocus
//                     />
//                     <View style={m.row}>
//                         <TouchableOpacity style={m.cancelBtn} onPress={onClose}>
//                             <Text style={m.cancelText}>İptal</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity style={m.saveBtn} onPress={handleSave}>
//                             <Text style={m.saveText}>Kaydet</Text>
//                         </TouchableOpacity>
//                     </View>
//                 </View>
//             </View>
//         </Modal>
//     );
// }
//
// // ── SleepScreen ───────────────────────────────────────────────────────────────
// export default function SleepScreen() {
//     const {
//         activeSounds, volumes, activeMixId, savedMixes,
//         toggleSound, setVolume, clearAll, loadMix, saveMix, updateMix, deleteMix,
//     } = useSoundStore();
//
//     const [sleepTimer, setSleepTimer] = useState(30);
//     const [timerActive, setTimerActive] = useState(false);
//     const [saveModalVisible, setSaveModalVisible] = useState(false);
//     const [remaining, setRemaining] = useState(0);
//
//     // ... (startFade ve cancelFade fonksiyonları aynı mantıkla kalıyor)
//
//     return (
//         <View style={s.container}>
//             <StatusBar barStyle="light-content" />
//
//             {/* Top Bar */}
//             <View style={s.topBar}>
//                 <View style={s.topBarLeft}>
//                     <Text style={s.topBarIcon}>🌙</Text>
//                     <Text style={s.topBarTitle}>ZENLY SLEEP</Text>
//                 </View>
//                 <TouchableOpacity style={s.iconButton}>
//                     <Text style={s.settingsIcon}>⚙</Text>
//                 </TouchableOpacity>
//             </View>
//
//             <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
//
//                 {/* 1. SAVED MIXES */}
//                 <View style={s.section}>
//                     <View style={s.sectionHeader}>
//                         <Text style={s.labelCaps}>Saved Mixes</Text>
//                         <TouchableOpacity><Text style={s.viewAllText}>View All</Text></TouchableOpacity>
//                     </View>
//                     <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.horizontalScroll}>
//                         {savedMixes.map((mix) => (
//                             <TouchableOpacity
//                                 key={mix.id}
//                                 style={[s.mixCard, activeMixId === mix.id && s.mixCardActive]}
//                                 onPress={() => handleMixCardPress(mix)}
//                             >
//                                 <Image source={{ uri: `https://picsum.photos/seed/${mix.id}/300/200` }} style={s.cardImg} />
//                                 <View style={s.cardOverlay} />
//                                 <Text style={s.mixCardName}>{mix.name}</Text>
//                                 {activeMixId === mix.id && (
//                                     <View style={s.checkBadge}><Text style={s.checkText}>✓</Text></View>
//                                 )}
//                             </TouchableOpacity>
//                         ))}
//                         <TouchableOpacity style={s.mixCardAdd} onPress={() => setSaveModalVisible(true)}>
//                             <Text style={s.addIcon}>+</Text>
//                         </TouchableOpacity>
//                     </ScrollView>
//                 </View>
//
//                 {/* 2. SOUNDS GRID */}
//                 <View style={s.section}>
//                     <Text style={s.labelCaps}>Sounds Library</Text>
//                     <View style={s.soundGrid}>
//                         {SOUNDS.map((sound) => {
//                             const isActive = activeSounds.includes(sound.id);
//                             return (
//                                 <TouchableOpacity
//                                     key={sound.id}
//                                     style={[s.soundTile, isActive && s.soundTileActive]}
//                                     onPress={() => toggleSound(sound.id)}
//                                 >
//                                     <Text style={[s.tileEmoji, !isActive && { opacity: 0.4 }]}>{sound.emoji}</Text>
//                                     <Text style={[s.tileLabel, isActive && { color: COLORS.primary }]}>{sound.name.toUpperCase()}</Text>
//                                 </TouchableOpacity>
//                             );
//                         })}
//                     </View>
//                 </View>
//
//                 {/* 3. ACTIVE MIXER */}
//                 {activeSounds.length > 0 && (
//                     <View style={s.section}>
//                         <Text style={s.labelCaps}>Active Mixer</Text>
//                         <View style={s.mixerPanel}>
//                             {activeSounds.map((id) => (
//                                 <View key={id} style={s.sliderRow}>
//                                     <View style={s.sliderHeader}>
//                                         <Text style={s.sliderLabelText}>{id} Volume</Text>
//                                         <Text style={s.sliderPct}>{Math.round((volumes[id] || 0.7) * 100)}%</Text>
//                                     </View>
//                                     <Slider
//                                         minimumValue={0}
//                                         maximumValue={1}
//                                         value={volumes[id] || 0.7}
//                                         onValueChange={(v) => setVolume(id, v)}
//                                         minimumTrackTintColor={COLORS.primary}
//                                         maximumTrackTintColor={COLORS.surfaceHigh}
//                                     />
//                                 </View>
//                             ))}
//                         </View>
//                     </View>
//                 )}
//
//                 {/* 4. SLEEP TIMER */}
//                 <View style={s.section}>
//                     <Text style={s.labelCaps}>Sleep Timer</Text>
//                     <View style={s.timerRow}>
//                         {[15, 30, 45, 60].map((m) => (
//                             <TouchableOpacity
//                                 key={m}
//                                 style={[s.timerBtn, sleepTimer === m && s.timerBtnActive]}
//                                 onPress={() => setSleepTimer(m)}
//                             >
//                                 <Text style={[s.timerBtnText, sleepTimer === m && s.timerBtnTextActive]}>{m}m</Text>
//                             </TouchableOpacity>
//                         ))}
//                     </View>
//                     <TouchableOpacity style={s.mainCta} onPress={timerActive ? cancelFade : startFade}>
//                         <Text style={s.mainCtaText}>
//                             {timerActive ? 'Cancel Fade' : `Start ${sleepTimer} Minute Fade`}
//                         </Text>
//                     </TouchableOpacity>
//                 </View>
//
//             </ScrollView>
//
//             <SaveMixModal
//                 visible={saveModalVisible}
//                 onClose={() => setSaveModalVisible(false)}
//                 onSave={(name) => saveMix(name)}
//             />
//         </View>
//     );
// }