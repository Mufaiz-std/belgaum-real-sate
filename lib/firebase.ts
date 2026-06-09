import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
// CRITICAL: Ensure you are importing ReCaptchaV3Provider, NOT ReCaptchaEnterpriseProvider
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

let app: FirebaseApp | undefined
let auth: Auth | undefined
let appCheck: AppCheck | undefined

export function getFirebaseAuth(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth is only available in the browser')
  }

  if (!auth) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)

    // --- INITIALIZE APP CHECK ---
    if (!appCheck) {
      if (process.env.NODE_ENV === 'development') {
        // CHANGED: Read the hardcoded token string from your env instead of passing 'true'
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN;
      }

      const v3SiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_KEY;
      
      if (v3SiteKey) {
        appCheck = initializeAppCheck(app, {
          // CRITICAL: Constructing a standard ReCaptchaV3Provider instance
          provider: new ReCaptchaV3Provider(v3SiteKey),
          isTokenAutoRefreshEnabled: true,
        });
      } else {
        console.warn("App Check failed: NEXT_PUBLIC_RECAPTCHA_V3_KEY environment variable is missing.");
      }
    }
  }

  return auth
}