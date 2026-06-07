import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { ServiceAccount } from 'firebase-admin'

function parseJsonKey(content: string): ServiceAccount {
  return JSON.parse(content) as ServiceAccount
}

export function parseFirebaseServiceAccount(raw: string): ServiceAccount {
  const trimmed = raw.trim()

  if (trimmed.startsWith('{')) {
    return parseJsonKey(trimmed)
  }

  if (existsSync(trimmed)) {
    return parseJsonKey(readFileSync(trimmed, 'utf8'))
  }

  const resolved = resolve(process.cwd(), trimmed)
  if (existsSync(resolved)) {
    return parseJsonKey(readFileSync(resolved, 'utf8'))
  }

  try {
    const decoded = Buffer.from(trimmed, 'base64').toString('utf8')
    return parseJsonKey(decoded)
  } catch {
    throw new Error(
      'FIREBASE_ADMIN_SDK_KEY must be valid JSON, a file path, or base64-encoded JSON. ' +
        'For multi-line keys, save to firebase-admin-key.json and set FIREBASE_ADMIN_SDK_KEY_PATH=./firebase-admin-key.json'
    )
  }
}

export function loadFirebaseServiceAccount(): ServiceAccount {
  const pathKey = process.env.FIREBASE_ADMIN_SDK_KEY_PATH
  if (pathKey) {
    const filePath = resolve(process.cwd(), pathKey)
    if (!existsSync(filePath)) {
      throw new Error(`Firebase key file not found: ${filePath}`)
    }
    return parseJsonKey(readFileSync(filePath, 'utf8'))
  }

  const inlineKey = process.env.FIREBASE_ADMIN_SDK_KEY
  if (!inlineKey) {
    throw new Error(
      'Set FIREBASE_ADMIN_SDK_KEY_PATH or FIREBASE_ADMIN_SDK_KEY (single-line JSON)'
    )
  }

  return parseFirebaseServiceAccount(inlineKey)
}
