import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Configuration from environment variables with fallback to user's provided config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCDRPwXszeT-3_TH4rUhnYuHaSSPlcvHmY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "pet-shop-47222.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://pet-shop-47222-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "pet-shop-47222",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "pet-shop-47222.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "450023015684",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:450023015684:web:caa2fb85a418732e923c51",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-21N7JHWBCG",
};

export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || "fO27HKUtQofzCq4TLNhfNu6quw03";
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "admin@shopbd.com";

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let isFirebaseAvailable = false;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  isFirebaseAvailable = true;
  console.log('[ShopBD] Firebase initialized successfully with project:', firebaseConfig.projectId);
} catch (error) {
  console.warn('[ShopBD] Firebase initialization error or offline mode:', error);
  isFirebaseAvailable = false;
}

export { app, auth, db, storage, isFirebaseAvailable, firebaseConfig };

// Error handling as mandated by Firebase architecture skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.warn('[ShopBD Firestore Error]:', JSON.stringify(errInfo));
  return errInfo;
}
