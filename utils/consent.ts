import { AppState, Platform } from 'react-native';
import mobileAds, {
    AdsConsent,
    AdsConsentStatus,
    AdsConsentPrivacyOptionsRequirementStatus,
} from 'react-native-google-mobile-ads';
import {
    requestTrackingPermissionsAsync,
    isAvailable as isAttAvailable,
} from 'expo-tracking-transparency';
import { useConsentStore } from '../stores/consentStore';

let started = false;

/** iOS'ta ATT penceresi uygulama "active" değilken açılmaz; sessizce reddedilmiş sayılır. */
function waitUntilActive(): Promise<void> {
    if (AppState.currentState === 'active') return Promise.resolve();
    return new Promise((resolve) => {
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                sub.remove();
                resolve();
            }
        });
    });
}

/**
 * Reklam onay akışı. Sıra Google'ın önerdiği gibi: önce UMP (GDPR/AEA onay
 * formu), sonra iOS ATT. Kişiselleştirme ancak ikisi de olumluysa açılır.
 *
 * İki adım ayrı try bloklarında: UMP'nin başarısız olması ATT'nin sorulmasını
 * engellememeli. (AdMob'da onay formu tanımlı değilse UMP hata fırlatıyor;
 * aynı bloğa konursa ATT hiç sorulmadan atlanıyor.)
 *
 * Akış bitmeden hiçbir reklam istenmez — AdBanner `resolved` bekler; onay
 * öncesi reklam çağırmak UMP politikasına aykırı.
 */
export async function initConsent(): Promise<void> {
    if (started) return;
    started = true;

    // 1) UMP — gerekiyorsa onay formunu gösterir.
    let umpOk = false;
    let canShowPrivacyOptions = false;
    try {
        const info = await AdsConsent.gatherConsent();
        umpOk =
            info.status === AdsConsentStatus.OBTAINED ||
            info.status === AdsConsentStatus.NOT_REQUIRED;
        canShowPrivacyOptions =
            info.privacyOptionsRequirementStatus ===
            AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
    } catch {
        // Onay alınamadıysa kişiselleştirme yapılamaz; reklam yine gösterilir.
        umpOk = false;
    }

    // 2) iOS ATT — IDFA olmadan kişiselleştirme zaten mümkün değil.
    let attOk = true;
    try {
        if (Platform.OS === 'ios' && isAttAvailable()) {
            await waitUntilActive();
            const { granted } = await requestTrackingPermissionsAsync();
            attOk = granted;
        }
    } catch {
        attOk = false;
    }

    try {
        await mobileAds().initialize();
    } catch {}

    useConsentStore
        .getState()
        .resolve({ personalizedAds: umpOk && attOk, canShowPrivacyOptions });
}

/** AEA kullanıcıları için "gizlilik tercihlerim" ekranı. Ayarlar'a bağlanabilir. */
export async function showPrivacyOptions(): Promise<void> {
    try {
        await AdsConsent.showPrivacyOptionsForm();
    } catch {}
}
