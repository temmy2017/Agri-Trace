// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { type UserProfile } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// User profile management
export const userProfileService = {
  // Create or update user profile
  async saveUserProfile(profile: Omit<UserProfile, 'createdAt'>): Promise<void> {
    const userRef = doc(db, 'users', profile.walletAddress);
    await setDoc(userRef, {
      ...profile,
      createdAt: serverTimestamp(), // Use server timestamp
    });
  },

  // Get user profile by wallet address
  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    const userRef = doc(db, 'users', walletAddress);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();

      // Convert Firestore Timestamp to Date
      let createdAt: Date;
      if (data.createdAt instanceof Timestamp) {
        createdAt = data.createdAt.toDate();
      } else if (data.createdAt?.toDate) {
        createdAt = data.createdAt.toDate();
      } else {
        createdAt = new Date(data.createdAt || Date.now());
      }

      return {
        walletAddress: data.walletAddress,
        name: data.name,
        location: data.location,
        role: data.role,
        createdAt
      } as UserProfile;
    }
    return null;
  },
};