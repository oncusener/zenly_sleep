import { create } from 'zustand';

type ConsentStore = {
    /** Onay akışı tamamlandı mı (başarısız olsa bile true olur). */
    resolved: boolean;
    /** Kişiselleştirilmiş reklam isteyebilir miyiz. */
    personalizedAds: boolean;
    /** Kullanıcı gizlilik tercihlerini sonradan değiştirebilir mi (AEA). */
    canShowPrivacyOptions: boolean;

    resolve: (v: { personalizedAds: boolean; canShowPrivacyOptions: boolean }) => void;
};

export const useConsentStore = create<ConsentStore>((set) => ({
    resolved: false,
    personalizedAds: false,
    canShowPrivacyOptions: false,

    resolve: ({ personalizedAds, canShowPrivacyOptions }) =>
        set({ resolved: true, personalizedAds, canShowPrivacyOptions }),
}));
