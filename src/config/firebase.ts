// Firebase Configuration
// Replace these values with your Firebase project config
// Go to: Firebase Console → Project Settings → Your Apps → Web App → Config

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, update, remove, get } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  // TODO: Replace with your Firebase config
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://YOUR_PROJECT.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Database references
export const dbRefs = {
  menuItems: ref(database, 'menuItems'),
  orders: ref(database, 'orders'),
  coupons: ref(database, 'coupons'),
  storeConfig: ref(database, 'storeConfig'),
  banners: ref(database, 'banners'),
  customers: ref(database, 'customers'),
};

// Helper function to get a specific ref
export const getRef = (path: string) => ref(database, path);

// Export Firebase utilities
export { 
  database, 
  auth, 
  ref, 
  set, 
  push, 
  onValue, 
  update, 
  remove, 
  get,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

export default app;
