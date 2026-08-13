import { Platform } from 'react-native';
import Constants from 'expo-constants';

export type UpdateStatus = 'ok' | 'optional' | 'forced';

type PlatformConfig = {
    minVersion?: string;
    latestVersion?: string;
    storeUrl?: string;
};

type VersionConfig = {
    ios?: PlatformConfig;
    android?: PlatformConfig;
};

const CONFIG_URL = process.env.EXPO_PUBLIC_VERSION_CONFIG_URL;
const FETCH_TIMEOUT_MS = 6000;

const STORE_URL_FALLBACK = Platform.select({
    ios: 'https://apps.apple.com/app/id0000000000',
    android: 'https://play.google.com/store/apps/details?id=com.oncusener.zenly',
})!;

export const currentVersion: string =
    Constants.expoConfig?.version ?? '0.0.0';

/**
 * "1.0.19" > "1.0.9" gibi karşılaştırmalar için. Sayısal parça karşılaştırması
 * yapar, string karşılaştırması yapmaz — "1.0.9" > "1.0.19" hatasına düşmemek için.
 */
export function compareVersions(a: string, b: string): number {
    const pa = a.split('.').map((n) => parseInt(n, 10) || 0);
    const pb = b.split('.').map((n) => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
        if (diff !== 0) return diff < 0 ? -1 : 1;
    }
    return 0;
}

export type UpdateCheckResult = {
    status: UpdateStatus;
    storeUrl: string;
    latestVersion?: string;
};

/**
 * Uzak version.json'u okuyup mevcut sürümle karşılaştırır.
 *
 * FAIL-OPEN: ağ yoksa, istek zaman aşımına uğrarsa ya da JSON bozuksa
 * 'ok' döner. Sunucu erişilemediği için kullanıcıyı uygulamadan kilitlemek
 * force update'in en sık yapılan hatası — bilerek engellendi.
 */
export async function checkForUpdate(): Promise<UpdateCheckResult> {
    const safe: UpdateCheckResult = { status: 'ok', storeUrl: STORE_URL_FALLBACK };
    if (!CONFIG_URL) return safe;

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        const res = await fetch(CONFIG_URL, {
            signal: controller.signal,
            cache: 'no-store',
        });
        clearTimeout(timer);
        if (!res.ok) return safe;

        const json = (await res.json()) as VersionConfig;
        const cfg = Platform.OS === 'ios' ? json.ios : json.android;
        if (!cfg) return safe;

        const storeUrl = cfg.storeUrl ?? STORE_URL_FALLBACK;

        if (cfg.minVersion && compareVersions(currentVersion, cfg.minVersion) < 0) {
            return { status: 'forced', storeUrl, latestVersion: cfg.latestVersion };
        }
        if (cfg.latestVersion && compareVersions(currentVersion, cfg.latestVersion) < 0) {
            return { status: 'optional', storeUrl, latestVersion: cfg.latestVersion };
        }
        return { status: 'ok', storeUrl, latestVersion: cfg.latestVersion };
    } catch {
        return safe;
    }
}
