// Firebase client initialization
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase config (from your Firebase console)
const firebaseConfig = {
  apiKey: 'AIzaSyA2zJuPnxGv_gPqUN-_ruuuPQXVmmZ3UMw',
  authDomain: 'brainscraft-5fee1.firebaseapp.com',
  projectId: 'brainscraft-5fee1',
  storageBucket: 'brainscraft-5fee1.firebasestorage.app',
  messagingSenderId: '281546597051',
  appId: '1:281546597051:web:78b6b94c1ed5164696ff9e',
  measurementId: 'G-FF7LH5JHYF',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
