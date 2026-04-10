import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';
import {
    InterstitialAd,
    AdEventType,
    TestIds,
    BannerAd, BannerAdSize
} from 'react-native-google-mobile-ads';


const { width, height } = Dimensions.get('window');

const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : 'ca-app-pub-7987749549764501/3268250644';
const bannerId = __DEV__ ? TestIds.BANNER : 'ca-app-pub-7987749549764501/3268250644';
const interstitialId = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7987749549764501/3268250644';
const interstitial = InterstitialAd.createForAdRequest(interstitialId, {
    requestNonPersonalizedAdsOnly: true,
});


const STARS = [
    { x: 0.08, y: 0.06, size: 2,   op: 0.5 },
    { x: 0.22, y: 0.04, size: 1.5, op: 0.35 },
    { x: 0.55, y: 0.03, size: 2,   op: 0.6 },
    { x: 0.80, y: 0.07, size: 1,   op: 0.4 },
    { x: 0.12, y: 0.13, size: 1.5, op: 0.5 },
    { x: 0.90, y: 0.10, size: 2,   op: 0.3 },
    { x: 0.70, y: 0.15, size: 1,   op: 0.45 },
    { x: 0.05, y: 0.25, size: 1.5, op: 0.4 },
    { x: 0.95, y: 0.30, size: 1,   op: 0.3 },
    { x: 0.15, y: 0.70, size: 2,   op: 0.35 },
    { x: 0.88, y: 0.65, size: 1.5, op: 0.5 },
    { x: 0.03, y: 0.80, size: 1,   op: 0.4 },
    { x: 0.92, y: 0.85, size: 2,   op: 0.3 },
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

    const [adLoaded, setAdLoaded] = useState(false);
    const adShownRef   = useRef(false);
    const splashDone   = useRef(false);
    const adDone       = useRef(false);

    function tryFinish() {
        if (splashDone.current && adDone.current) {
            onFinish();
        }
    }

    useEffect(() => {
        const unsubLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
            setAdLoaded(true);
        });
        const unsubClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            adDone.current = true;
            tryFinish();
        });
        const unsubError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
            adDone.current = true;
            tryFinish();
        });

        interstitial.load();

        return () => { unsubLoaded(); unsubClosed(); unsubError(); };
    }, []);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        ]).start(() => {
            Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
                animateDots();
            });
        });

        const timer = setTimeout(() => {
            splashDone.current = true;

            if (adLoaded && !adShownRef.current) {
                adShownRef.current = true;
                interstitial.show();
            } else {
                const fallback = setTimeout(() => {
                    adDone.current = true;
                    tryFinish();
                }, 1000);
                return () => clearTimeout(fallback);
            }
        }, 2500);

        return () => clearTimeout(timer);
    }, [adLoaded]);

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
            <StatusBar barStyle="light-content" backgroundColor="#080b14" />

            {STARS.map((star, i) => (
                <View key={i} style={[styles.star, {
                    left: star.x * width, top: star.y * height,
                    width: star.size, height: star.size, opacity: star.op,
                }]} />
            ))}

            <View style={[styles.ring, { width: 240, height: 240, opacity: 0.12 }]} />
            <View style={[styles.ring, { width: 180, height: 180, opacity: 0.10 }]} />

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
            <BannerAd
                unitId={bannerId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
            <Text style={styles.version}>v1.0.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container:  { flex: 1, backgroundColor: '#080b14', alignItems: 'center', justifyContent: 'center' },
    star:       { position: 'absolute', borderRadius: 99, backgroundColor: '#8899ff' },
    ring:       { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: '#98a9ff' },
    logoWrap:   { marginBottom: 32 },
    moonOuter:  { width: 90, height: 90, borderRadius: 45, backgroundColor: '#E8C44A', overflow: 'hidden' },
    moonInner:  { position: 'absolute', width: 74, height: 74, borderRadius: 37, backgroundColor: '#080b14', top: -8, left: 22 },
    wordmark:   { fontSize: 24, fontWeight: '700', color: '#98a9ff', letterSpacing: 6, marginBottom: 6 },
    tagline:    { fontSize: 10, color: '#3a3d55', letterSpacing: 3, textTransform: 'uppercase' },
    dotsRow:    { flexDirection: 'row', gap: 8, marginTop: 40 },
    dot:        { width: 6, height: 6, borderRadius: 3, backgroundColor: '#98a9ff' },
    version:    { position: 'absolute', bottom: 32, fontSize: 10, color: '#2a2d40', letterSpacing: 1 },
});