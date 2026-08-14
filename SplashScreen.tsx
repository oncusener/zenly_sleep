import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import AdBanner from './components/AdBanner';
import { currentVersion } from './utils/versionCheck';

const { width, height } = Dimensions.get('window');

// LOGO RENK PALETİ
const COLORS = {
    BACKGROUND: '#0D1019', // Logodaki en koyu lacivert
    MOON: '#F4D35E',       // Altın sarısı ay tonu
    TEXT_PRIMARY: '#F4D35E', // Yazılar için ay rengi
    TEXT_SECONDARY: '#3D455C', // Alt başlık için soluk gri-mavi
    STARS: '#F4D35E',      // Yıldızlar için ay rengi
    DOTS: '#F4D35E',
};

const SPLASH_MS = 2500;

const STARS = [
    { x: 0.08, y: 0.06, size: 2,   op: 0.6 },
    { x: 0.22, y: 0.04, size: 1.5, op: 0.4 },
    { x: 0.55, y: 0.03, size: 2,   op: 0.7 },
    { x: 0.80, y: 0.07, size: 1,   op: 0.5 },
    { x: 0.12, y: 0.13, size: 1.5, op: 0.6 },
    { x: 0.90, y: 0.10, size: 2,   op: 0.4 },
    { x: 0.70, y: 0.15, size: 1,   op: 0.5 },
    { x: 0.05, y: 0.25, size: 1.5, op: 0.45 },
    { x: 0.95, y: 0.30, size: 1,   op: 0.35 },
    { x: 0.15, y: 0.70, size: 2,   op: 0.4 },
    { x: 0.88, y: 0.65, size: 1.5, op: 0.6 },
    { x: 0.03, y: 0.80, size: 1,   op: 0.5 },
    { x: 0.92, y: 0.85, size: 2,   op: 0.4 },
];

interface Props {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
    const logoOpacity  = useRef(new Animated.Value(0)).current;
    const logoScale    = useRef(new Animated.Value(0.85)).current;
    const textOpacity  = useRef(new Animated.Value(0)).current;
    const dot1Opacity  = useRef(new Animated.Value(0.25)).current;
    const dot2Opacity  = useRef(new Animated.Value(0.25)).current;
    const dot3Opacity  = useRef(new Animated.Value(0.25)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start(() => {
            Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
                animateDots();
            });
        });

        const timer = setTimeout(onFinish, SPLASH_MS);
        return () => clearTimeout(timer);
    }, []);

    function animateDots() {
        const pulse = (anim: Animated.Value, delay: number) =>
            Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(anim, { toValue: 1,    duration: 300, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: 0.25, duration: 300, useNativeDriver: true }),
                ]),
            ).start();
        pulse(dot1Opacity, 0);
        pulse(dot2Opacity, 200);
        pulse(dot3Opacity, 400);
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.BACKGROUND} />

            {STARS.map((star, i) => (
                <View key={i} style={[styles.star, {
                    left: star.x * width, top: star.y * height,
                    width: star.size, height: star.size, opacity: star.op,
                    backgroundColor: COLORS.STARS
                }]} />
            ))}

            {/* Arka plandaki halkalar logodaki enerji dalgasını temsil eder */}
            <View style={[styles.ring, { width: 240, height: 240, opacity: 0.05, borderColor: COLORS.MOON }]} />
            <View style={[styles.ring, { width: 180, height: 180, opacity: 0.03, borderColor: COLORS.MOON }]} />

            <Animated.View style={[styles.logoWrap, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
                <View style={styles.moonOuter}>
                    <View style={styles.moonInner} />
                </View>
            </Animated.View>

            <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
                <Text style={styles.wordmark}>ZENLY SLEEP</Text>
                <Text style={styles.tagline}>Sound · Rest · Restore</Text>
            </Animated.View>

            <Animated.View style={[styles.dotsRow, { opacity: textOpacity }]}>
                <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
                <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
                <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
            </Animated.View>

            <View style={styles.bannerPos}>
                <AdBanner />
            </View>

            <Text style={styles.version}>v{currentVersion}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container:  { flex: 1, backgroundColor: COLORS.BACKGROUND, alignItems: 'center', justifyContent: 'center' },
    star:       { position: 'absolute', borderRadius: 99 },
    ring:       { position: 'absolute', borderRadius: 999, borderWidth: 1.5 },
    logoWrap:   { marginBottom: 32 },
    moonOuter:  { width: 90, height: 90, borderRadius: 45, backgroundColor: COLORS.MOON, overflow: 'hidden' },
    moonInner:  { position: 'absolute', width: 78, height: 78, borderRadius: 39, backgroundColor: COLORS.BACKGROUND, top: -4, left: 18 },
    wordmark:   { fontSize: 24, fontWeight: '700', color: COLORS.TEXT_PRIMARY, letterSpacing: 6, marginBottom: 8 },
    tagline:    { fontSize: 11, color: COLORS.TEXT_SECONDARY, letterSpacing: 4, textTransform: 'uppercase', fontWeight: '500' },
    dotsRow:    { flexDirection: 'row', gap: 10, marginTop: 45 },
    dot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.DOTS },
    bannerPos:  { position: 'absolute', bottom: 60 },
    version:    { position: 'absolute', bottom: 20, fontSize: 10, color: COLORS.TEXT_SECONDARY, letterSpacing: 1 },
});