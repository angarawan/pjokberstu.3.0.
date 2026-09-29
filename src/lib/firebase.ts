/**
 * Firebase Initialization & Configuration
 * PENILAIAN ANTAR TEMAN PJOK
 *
 * File ini menginisialisasi Firebase App, Firebase Authentication,
 * Cloud Firestore, dan Firebase Storage menggunakan konfigurasi modular.
 * Pengguna dapat mengganti nilai pada `firebaseConfig` dengan kredensial dari Firebase Console.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  type Firestore
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

// Matikan log internal Firestore yang bising saat initial handshake / koneksi transien
try {
  setLogLevel('error');
} catch {}

// Kredensial Firebase Proyek Aktif
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey || "ISI_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain || "penilaian-pjok.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId || "penilaian-pjok",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket || "penilaian-pjok.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId || "1:123456789012:web:abcdef123456",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || (appletConfig as any).firestoreDatabaseId || ""
};

/**
 * Kontrol Status Firebase Cloud
 * Diaktifkan agar tugas, indikator, kelas, dan akun tersinkronisasi otomatis
 * antara perangkat guru (laptop/HP) dan perangkat murid (HP).
 */
export const FIREBASE_ENABLED = true;

export const setFirebaseEnabled = (enabled: boolean) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pjok_firebase_enabled', enabled ? 'true' : 'false');
  }
};

export const isFirebaseActive = (): boolean => {
  if (typeof window !== 'undefined') {
    const forced = localStorage.getItem('pjok_firebase_enabled');
    if (forced === 'true') return true;
    if (forced === 'false') return false;
  }
  return FIREBASE_ENABLED;
};

/**
 * Memeriksa apakah Firebase sudah dikonfigurasi dan diaktifkan.
 */
export const isFirebaseConfigured = (): boolean => {
  if (!isFirebaseActive()) return false;
  const active = getActiveFirebaseConfig();
  return Boolean(
    active.apiKey &&
    active.apiKey !== 'ISI_API_KEY' &&
    active.projectId &&
    dbInstance
  );
};

export const getActiveFirebaseConfig = () => {
  try {
    const savedConfig = localStorage.getItem('pjok_custom_firebase_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.apiKey && parsed.apiKey !== 'ISI_API_KEY') {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gagal membaca custom Firebase config:', e);
  }
  return firebaseConfig;
};

// Inisialisasi Firebase App secara aman hanya jika Firebase diaktifkan
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

if (isFirebaseActive()) {
  try {
    const activeConfig = getActiveFirebaseConfig();
    if (getApps().length === 0) {
      appInstance = initializeApp(activeConfig);
    } else {
      appInstance = getApp();
    }
    authInstance = getAuth(appInstance);
    
    // Gunakan initializeFirestore dengan mode force long-polling untuk konektivitas stabil di iframe/browser
    try {
      const firestoreSettings = {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true
      };
      if (activeConfig.firestoreDatabaseId) {
        dbInstance = initializeFirestore(appInstance, firestoreSettings, activeConfig.firestoreDatabaseId);
      } else {
        dbInstance = initializeFirestore(appInstance, firestoreSettings);
      }
    } catch {
      // Fallback jika Firestore instance sudah pernah diinisialisasi
      if (activeConfig.firestoreDatabaseId) {
        dbInstance = getFirestore(appInstance, activeConfig.firestoreDatabaseId);
      } else {
        dbInstance = getFirestore(appInstance);
      }
    }

    storageInstance = getStorage(appInstance);
  } catch (error) {
    console.warn('Inisialisasi Firebase dinonaktifkan/menggunakan mode fallback lokal:', error);
  }
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

export default {
  app,
  auth,
  db,
  storage,
  firebaseConfig,
  isFirebaseConfigured
};
