// import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
// import { getAuth, type Auth } from 'firebase/auth'

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
// }

// let app: FirebaseApp | undefined
// let auth: Auth | undefined

// export function getFirebaseAuth(): Auth {
//   if (typeof window === 'undefined') {
//     throw new Error('Firebase Auth is only available in the browser')
//   }
//   if (!auth) {
//     app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
//     auth = getAuth(app)
//   }
//   return auth
// }
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeAppCheck, ReCaptchaEnterpriseProvider, type AppCheck } from 'firebase/app-check'

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
      // Step A: Set the global debug flag flag before initializing App Check
      if (process.env.NODE_ENV === 'development') {
        (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }

      appCheck = initializeAppCheck(app, {
        // Replace with your actual reCAPTCHA Enterprise site key if using it, 
        // or use ReCaptchaV3Provider depending on your Firebase configuration.
        provider: new ReCaptchaEnterpriseProvider(
          process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_KEY || '6LcSxBEtAAAAAKpsxXy964Vakf3hPCFBbVx6sVr9'
        ),
        isTokenAutoRefreshEnabled: true,
      });
    }
  }

  return auth
}