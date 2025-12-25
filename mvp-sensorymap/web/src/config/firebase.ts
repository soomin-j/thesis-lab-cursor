import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if config is valid (not placeholder values)
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== 'your-api-key-here' &&
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== 'your-project-id' &&
  firebaseConfig.apiKey.startsWith('AIza'); // Firebase API keys start with AIza

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.warn('⚠️ Falling back to demo authentication mode');
  }
} else {
  console.warn('⚠️ Firebase config is missing or invalid.');
  console.warn('📝 Using demo authentication mode (localStorage-based)');
  console.warn('💡 To use Firebase, update your .env file with valid Firebase credentials');
}

export { auth, db };
export const isFirebaseConfigured = isConfigValid && auth !== null;
export default app;

