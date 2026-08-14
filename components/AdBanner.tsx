import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '../constants/ads';
import { useConsentStore } from '../stores/consentStore';

/**
 * Reklam istemeden önce iki koşul aranır:
 *  - o platform için bir reklam birimi tanımlı olmalı (yoksa boş yer de açılmaz)
 *  - onay akışı tamamlanmış olmalı — onay öncesi reklam çağırmak UMP'ye aykırı
 */
export default function AdBanner({ style }: { style?: any }) {
    const resolved = useConsentStore((s) => s.resolved);
    const personalizedAds = useConsentStore((s) => s.personalizedAds);

    if (!bannerAdUnitId || !resolved) return null;

    return (
        <View style={[{ alignItems: 'center', marginVertical: 10 }, style]}>
            <BannerAd
                unitId={bannerAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: !personalizedAds }}
            />
        </View>
    );
}
