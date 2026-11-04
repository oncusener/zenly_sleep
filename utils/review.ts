import * as StoreReview from 'expo-store-review';
import { useReviewStore } from '../stores/reviewStore';

/** Kac tamamlanmis uyku seansindan once sorulmasin. */
const MIN_SESSIONS = 3;
/** Iki istek arasinda birakilacak en az sure (gun). */
const MIN_DAYS_BETWEEN = 120;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Uyku zamanlayicisi sonuna kadar gittiginde cagrilir. Kullanici acisindan
 * "ise yaradi" ani burasi; acilista ya da ilk kullanimda sormak hem donusumu
 * dusuruyor hem de magaza politikalarinin hos bakmadigi bir kalip.
 *
 * Apple istegi yilda uc kezden fazla gostermiyor ve gosterip gostermedigini
 * bildirmiyor; bu yuzden o kotayi bosa harcamamak icin kendi sayaclarimizla
 * on eleme yapiyoruz. Hata durumunda akis sessizce biter — uykuya hazirlanan
 * kullanicinin onune uyari cikaracak bir sey degil.
 */
export async function maybeAskForReview(): Promise<void> {
    try {
        const { completedSessions, lastPromptAt, markPrompted } = useReviewStore.getState();

        if (completedSessions < MIN_SESSIONS) return;
        if (lastPromptAt !== null && Date.now() - lastPromptAt < MIN_DAYS_BETWEEN * DAY_MS) return;

        // hasAction(): hem API var mi hem de su an istek gonderilebilir mi.
        if (!(await StoreReview.hasAction())) return;

        await StoreReview.requestReview();
        markPrompted();
    } catch {
        // Puanlama istegi hicbir zaman kullaniciya hata gosterecek kadar onemli degil.
    }
}
