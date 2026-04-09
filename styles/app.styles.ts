import { StyleSheet } from 'react-native';

export const s = StyleSheet.create({
    container:           { flex: 1, backgroundColor: '#0b0e14' },
    topBar:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 56, paddingBottom: 8 },
    topBarLeft:          { flexDirection: 'row', alignItems: 'center', gap: 8 },
    topBarIcon:          { fontSize: 18 },
    topBarTitle:         { color: '#c5cff5', fontSize: 11, fontWeight: '600', letterSpacing: 2.5 },

    section:             { paddingHorizontal: 24, paddingTop: 24 },
    sectionHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionLabel:        { color: '#3a3f50', fontSize: 9, fontWeight: '600', letterSpacing: 2, marginBottom: 12 },
    clearAll:            { color: '#454a5e', fontSize: 11 },

    // Sound grid — kart boyutu cover fotoğrafı için taller yapıldı
    soundGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    soundCard:           { width: '48%', height: 90, borderRadius: 14, overflow: 'hidden', position: 'relative' },
    soundCardInactive:   { borderWidth: 1, borderColor: '#1e2230' },
    soundCardActive:     { borderWidth: 1.5 },
    soundCardLocked:     { borderWidth: 1, borderColor: '#181a22' },

    // Sol-alt köşe içerik (inactive & locked)
    cardBottom:          { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10 },
    cardNameInactive:    { color: '#ffffff', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, flex: 1 },
    cardNameLocked:      { color: '#ffffff55', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, flex: 1 },

    // Active card inner layout
    activeInner:         { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10 },
    activeHeader:        { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    cardNameActive:      { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, flex: 1 },
    cardVol:             { fontSize: 9, opacity: 0.85 },
    closeBtn:            { fontSize: 12, fontWeight: '700' },
    slider:              { width: '100%', height: 26, marginTop: 0 },

    // Badges
    freeBadge:           { backgroundColor: 'rgba(18,40,18,0.9)', borderWidth: 1, borderColor: '#1e3a1e', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
    freeBadgeText:       { color: '#3a7a3a', fontSize: 8, fontWeight: '600', letterSpacing: 0.3 },
    proBadge:            { backgroundColor: 'rgba(26,20,8,0.92)', borderWidth: 1, borderColor: '#2e2010', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 3 },
    proDot:              { width: 5, height: 5, borderRadius: 3, backgroundColor: '#4a3810' },
    proBadgeText:        { color: '#7a5a20', fontSize: 8, fontWeight: '600', letterSpacing: 0.3 },

    // Saved mixes
    mixScroll:           { marginLeft: -24, paddingLeft: 24, marginTop: 4 },
    mixCard:             { width: 110, height: 72, borderRadius: 22, borderWidth: 1, borderColor: '#1e2230', overflow: 'hidden', justifyContent: 'flex-end' },
    mixCheck:            { position: 'absolute', top: 8, right: 10 },
    mixCardContent:      { padding: 10 },
    mixCardName:         { color: '#c5cff5', fontSize: 11, fontWeight: '500' },
    mixCardAdd:          { width: 56, height: 72, borderRadius: 22, borderWidth: 1, borderColor: '#1e2230', backgroundColor: '#111318', alignItems: 'center', justifyContent: 'center' },
    mixCardAddIcon:      { color: '#3a3f50', fontSize: 22, fontWeight: '300' },

    // Timer
    timerRow:            { flexDirection: 'row', gap: 8, marginBottom: 10 },
    timerBtn:            { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1e2230', backgroundColor: '#111318', alignItems: 'center' },
    timerBtnActive:      { borderColor: '#98a9ff44', backgroundColor: '#141829' },
    timerBtnText:        { color: '#3a3f50', fontSize: 12, fontWeight: '500' },
    timerBtnTextActive:  { color: '#98a9ff' },
    startBtn:            { paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: '#2a3050', backgroundColor: '#131520', alignItems: 'center' },
    startBtnActive:      { borderColor: '#ff7f5c55', backgroundColor: '#1a1008' },
    startBtnText:        { color: '#98a9ff', fontSize: 13, fontWeight: '500' },
    fadeNote:            { color: '#2a3050', fontSize: 9, letterSpacing: 1.5, textAlign: 'center', marginTop: 8 },

    // Bottom bar
    bottomBar:           { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12, backgroundColor: '#0b0e14' },
    saveNewBtn:          { paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: '#1e2230', backgroundColor: '#0e1018', alignItems: 'center' },
    saveNewBtnText:      { color: '#454a60', fontSize: 12, fontWeight: '500' },
    updateBtn:           { paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: '#2a3050', backgroundColor: '#131520', alignItems: 'center' },
    updateBtnText:       { color: '#98a9ff', fontSize: 12, fontWeight: '500' },
});

export const m = StyleSheet.create({
    overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    sheet:      { backgroundColor: '#161a24', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 44 },
    title:      { color: '#c5cff5', fontSize: 17, fontWeight: '600', marginBottom: 4 },
    sub:        { color: '#454a5e', fontSize: 13, marginBottom: 20 },
    input:      { backgroundColor: '#0e1018', borderWidth: 1, borderColor: '#1e2230', borderRadius: 12, padding: 14, color: '#c5cff5', fontSize: 15, marginBottom: 20 },
    row:        { flexDirection: 'row', gap: 12 },
    cancelBtn:  { flex: 1, padding: 13, borderRadius: 12, borderWidth: 1, borderColor: '#1e2230', backgroundColor: '#111318', alignItems: 'center' },
    cancelText: { color: '#454a5e', fontSize: 14 },
    saveBtn:    { flex: 1, padding: 13, borderRadius: 12, backgroundColor: '#151929', borderWidth: 1, borderColor: '#2a3050', alignItems: 'center' },
    saveText:   { color: '#98a9ff', fontSize: 14, fontWeight: '500' },
});

export const p = StyleSheet.create({
    banner:        { marginHorizontal: 24, marginTop: 20, backgroundColor: '#100e08', borderWidth: 1, borderColor: '#2a2010', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
    bannerIcon:    { width: 36, height: 36, backgroundColor: '#1e1608', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    bannerText:    { flex: 1 },
    bannerTitle:   { color: '#d4910a', fontSize: 13, fontWeight: '600', marginBottom: 2 },
    bannerSub:     { color: '#5a4820', fontSize: 10 },
    bannerCta:     { backgroundColor: '#2a1e08', borderWidth: 1, borderColor: '#3a2a10', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    bannerCtaText: { color: '#e8a020', fontSize: 10, fontWeight: '600' },
});