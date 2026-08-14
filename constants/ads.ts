import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

/**
 * Reklam birimi ID'leri platforma bağlıdır: AdMob'da her birim tek bir
 * uygulamaya (dolayısıyla tek bir platforma) aittir. Android birimini iOS'ta
 * istemek dolum getirmez, banner sessizce boş kalır.
 *
 * ID bulunamazsa null döneriz — yanlış platformun birimini istemektense
 * hiç reklam göstermemek doğrusu. AdBanner null ID'de hiçbir şey render etmez.
 */
function resolve(
    iosId: string | undefined,
    androidId: string | undefined,
    testId: string,
): string | null {
    if (__DEV__) return testId;
    const id = Platform.select({ ios: iosId, android: androidId });
    return id && id.startsWith('ca-app-pub-') ? id : null;
}

export const bannerAdUnitId = resolve(
    process.env.EXPO_PUBLIC_IOS_BANNER_ID,
    process.env.EXPO_PUBLIC_ANDROID_BANNER_ID,
    TestIds.BANNER,
);

// Geçiş (interstitial) reklamı şu an hiçbir yerde kullanılmıyor: splash'teki
// tam ekran reklam kaldırıldı. İleride eklenirse buradan türetilebilir:
//   export const interstitialAdUnitId = resolve(
//       process.env.EXPO_PUBLIC_IOS_INTERSTITIAL_ID,
//       process.env.EXPO_PUBLIC_ANDROID_INTERSTITIAL_ID,
//       TestIds.INTERSTITIAL,
//   );
