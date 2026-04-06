import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// ── Ana Stiller ───────────────────────────────────────────────────────────────
export const s = StyleSheet.create({
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

    // Sound list (yeni: dikey liste stili)
    soundList: {
        flexDirection: 'column',
        gap: 8, marginTop: 16,
    },
    soundRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        backgroundColor: '#161a21',
        borderWidth: 1,
        borderColor: 'transparent',
        gap: 12,
    },
    soundRowActive: {
        flexDirection: 'column',
        alignItems: 'stretch',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#161a21',
        borderWidth: 1,
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: 6,
    },
    soundRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    soundRowEmoji: { fontSize: 18 },
    soundRowName: {
        fontSize: 13,
        fontWeight: '700',
        letterSpacing: 1.5,
        flex: 1,
    },
    soundRowPct: {
        fontSize: 13,
        fontWeight: '700',
    },
    soundRowClose: {
        fontSize: 12,
        color: '#45484f',
        fontWeight: '600',
    },
    soundRowAdd: {
        paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2e3340',
    },
    soundRowAddText: {
        fontSize: 10, fontWeight: '700',
        color: '#45484f', letterSpacing: 1,
    },

    // Aktif satır (slider'lı) ek stiller
    soundRowActive: {
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 0,
        paddingVertical: 14,
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
    },
    soundRowHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    soundRowPct: {
        fontSize: 13, fontWeight: '700',
        flex: 1,
        marginRight: 6,
    },
    soundRowClose: {
        fontSize: 14, fontWeight: '700',
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

// ── Modal Stilleri ────────────────────────────────────────────────────────────
export const m = StyleSheet.create({
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