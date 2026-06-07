import * as admin from 'firebase-admin'
import { loadFirebaseServiceAccount } from '@/lib/parse-firebase-key'

function getAdminApp() {
  if (!admin.apps.length) {
    const serviceAccount = loadFirebaseServiceAccount()
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  }
  return admin
}

export const adminAuth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    const auth = getAdminApp().auth()
    const value = auth[prop as keyof admin.auth.Auth]
    return typeof value === 'function' ? value.bind(auth) : value
  },
})
