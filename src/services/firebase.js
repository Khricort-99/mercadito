import { getApp, getApps, initializeApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const env = import.meta.env

const DEFAULT_CONFIG = {
  apiKey: 'AIzaSyBscoUDGfJ0SH8ckA2uxtBN0cHwTvderGI',
  authDomain: 'tienda-511fa.firebaseapp.com',
  projectId: 'tienda-511fa',
  storageBucket: 'tienda-511fa.firebasestorage.app',
  messagingSenderId: '475004560035',
  appId: '1:475004560035:web:21cbd2a9cf32aec6781516',
  measurementId: 'G-M7C3RLGJGP'
}

function isPlaceholder(value) {
  if (!value) return true
  return /^(tu_|your_|tu-|your-|tu\s|your\s)/i.test(value)
}

function read(key, fallback) {
  const value = env[key]
  return value && !isPlaceholder(value) ? value : fallback
}

const firebaseConfig = {
  apiKey: read('VITE_FIREBASE_API_KEY', DEFAULT_CONFIG.apiKey),
  authDomain: read('VITE_FIREBASE_AUTH_DOMAIN', DEFAULT_CONFIG.authDomain),
  projectId: read('VITE_FIREBASE_PROJECT_ID', DEFAULT_CONFIG.projectId),
  storageBucket: read('VITE_FIREBASE_STORAGE_BUCKET', DEFAULT_CONFIG.storageBucket),
  messagingSenderId: read(
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    DEFAULT_CONFIG.messagingSenderId
  ),
  appId: read('VITE_FIREBASE_APP_ID', DEFAULT_CONFIG.appId),
  measurementId: read('VITE_FIREBASE_MEASUREMENT_ID', DEFAULT_CONFIG.measurementId)
}

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)
export const persistenceReady = setPersistence(auth, browserLocalPersistence)
