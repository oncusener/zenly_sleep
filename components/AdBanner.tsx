import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '../constants/ads';

/**
 * O platform için reklam birimi tanımlı değilse hiçbir şey render etmez —
 * böylece iOS'ta ID'ler girilene kadar boş banner boşluğu da oluşmaz.
 */
export default function AdBanner({ style }: { style?: any }) {
    if (!bannerAdUnitId) return null;

    return (
        <View style={[{ alignItems: 'center', marginVertical: 10 }, style]}>
            <BannerAd
                unitId={bannerAdUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
        </View>
    );
}
