import React, { useEffect, useState } from 'react';
import {
    View, Text, Modal, TouchableOpacity, StyleSheet, Linking, BackHandler, Platform,
} from 'react-native';
import { checkForUpdate, currentVersion, UpdateCheckResult } from '../utils/versionCheck';

const COLORS = {
    BACKGROUND: '#0D1019',
    MOON: '#F4D35E',
    TEXT_PRIMARY: '#F4D35E',
    TEXT_SECONDARY: '#8b91a1',
};

/**
 * Uygulamayı sarar. Kontrol bitene kadar children normal render edilir —
 * açılışı geciktirmez. Zorunlu güncelleme gerekiyorsa kapatılamaz bir modal
 * üstüne biner; opsiyonelse kullanıcı "Daha sonra" ile geçebilir.
 */
export default function UpdateGate({ children }: { children: React.ReactNode }) {
    const [result, setResult] = useState<UpdateCheckResult | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        let alive = true;
        checkForUpdate().then((r) => { if (alive) setResult(r); });
        return () => { alive = false; };
    }, []);

    const forced = result?.status === 'forced';
    const optional = result?.status === 'optional' && !dismissed;
    const visible = forced || optional;

    // Android geri tuşu zorunlu güncellemeyi atlatmasın
    useEffect(() => {
        if (!forced || Platform.OS !== 'android') return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
    }, [forced]);

    function openStore() {
        if (result?.storeUrl) Linking.openURL(result.storeUrl).catch(() => {});
    }

    return (
        <>
            {children}
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <Text style={styles.icon}>🌙</Text>
                        <Text style={styles.title}>
                            {forced ? 'Güncelleme gerekli' : 'Yeni sürüm hazır'}
                        </Text>
                        <Text style={styles.body}>
                            {forced
                                ? 'Zenly Sleep’i kullanmaya devam etmek için uygulamayı güncellemen gerekiyor.'
                                : 'Daha iyi bir deneyim için yeni sürüme geçebilirsin.'}
                        </Text>
                        <Text style={styles.versions}>
                            Yüklü sürüm {currentVersion}
                            {result?.latestVersion ? `  ·  Yeni sürüm ${result.latestVersion}` : ''}
                        </Text>

                        <TouchableOpacity style={styles.primaryBtn} onPress={openStore} activeOpacity={0.85}>
                            <Text style={styles.primaryText}>Şimdi güncelle</Text>
                        </TouchableOpacity>

                        {!forced && (
                            <TouchableOpacity onPress={() => setDismissed(true)} activeOpacity={0.7}>
                                <Text style={styles.laterText}>Daha sonra</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(5,7,12,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
    },
    sheet: {
        width: '100%',
        backgroundColor: '#161a24',
        borderRadius: 22,
        padding: 26,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#242938',
    },
    icon: { fontSize: 34, marginBottom: 12 },
    title: {
        fontSize: 19, fontWeight: '700', color: COLORS.TEXT_PRIMARY,
        marginBottom: 10, textAlign: 'center',
    },
    body: {
        fontSize: 14, color: COLORS.TEXT_SECONDARY, textAlign: 'center',
        lineHeight: 21, marginBottom: 16,
    },
    versions: {
        fontSize: 11, color: '#565c6b', letterSpacing: 0.4,
        marginBottom: 22, textAlign: 'center',
    },
    primaryBtn: {
        backgroundColor: COLORS.MOON, borderRadius: 14,
        paddingVertical: 14, width: '100%', alignItems: 'center',
    },
    primaryText: { color: '#0D1019', fontSize: 15, fontWeight: '700' },
    laterText: {
        color: COLORS.TEXT_SECONDARY, fontSize: 13,
        marginTop: 16, paddingVertical: 4,
    },
});
