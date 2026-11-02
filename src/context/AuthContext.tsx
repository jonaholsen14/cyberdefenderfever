'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  runTransaction,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInEmail: (email: string, pass: string) => Promise<void>;
  signUpEmail: (email: string, pass: string, username: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  claimUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3 || clean.length > 18) return false;
    try {
      const snap = await getDoc(doc(db, 'usernames', clean));
      return !snap.exists();
    } catch (e) {
      console.error('Error checking username availability:', e);
      return false;
    }
  };

  const claimUsername = async (username: string): Promise<{ success: boolean; error?: string }> => {
    if (!auth.currentUser) return { success: false, error: 'Must be logged in to claim username.' };
    const raw = username.trim();
    const lower = raw.toLowerCase();

    if (raw.length < 3 || raw.length > 18) {
      return { success: false, error: 'Username must be between 3 and 18 characters.' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(raw)) {
      return { success: false, error: 'Username can only contain letters, numbers, and underscores.' };
    }

    try {
      const uid = auth.currentUser.uid;
      const usernameDocRef = doc(db, 'usernames', lower);
      const userDocRef = doc(db, 'users', uid);

      await runTransaction(db, async (tx) => {
        const usernameDoc = await tx.get(usernameDocRef);
        if (usernameDoc.exists() && usernameDoc.data()?.uid !== uid) {
          throw new Error('USERNAME_TAKEN');
        }

        // Get user's current doc to see if they had an old username to release
        const userDoc = await tx.get(userDocRef);
        if (userDoc.exists()) {
          const oldName = userDoc.data()?.username;
          if (oldName && oldName.toLowerCase() !== lower) {
            const oldUsernameRef = doc(db, 'usernames', oldName.toLowerCase());
            tx.delete(oldUsernameRef);
          }
        }

        tx.set(usernameDocRef, {
          uid,
          originalName: raw,
          lowerName: lower,
          createdAt: serverTimestamp()
        });

        tx.set(userDocRef, {
          username: raw
        }, { merge: true });
      });

      await updateProfile(auth.currentUser, { displayName: raw });
      return { success: true };
    } catch (err: any) {
      if (err.message === 'USERNAME_TAKEN') {
        return { success: false, error: 'That username is already claimed by another defender.' };
      }
      return { success: false, error: err.message || 'Failed to reserve username.' };
    }
  };

  const signInEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpEmail = async (email: string, pass: string, username: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user && username) {
      const res = await claimUsername(username);
      if (!res.success) {
        throw new Error(res.error || 'Failed to claim username during signup');
      }
    }
  };

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    // If first time with Google, check if user doc exists; if not, generate fallback handle or let them pick
    if (cred.user) {
      const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
      if (!userDoc.exists() || !userDoc.data()?.username) {
        let baseName = (cred.user.displayName || 'Defender').replace(/[^a-zA-Z0-9_]/g, '').slice(0, 12);
        if (baseName.length < 3) baseName = 'Defender';
        let candidate = baseName;
        let counter = 1;
        while (!(await checkUsernameAvailable(candidate)) && counter <= 10) {
          candidate = `${baseName}_${Math.floor(100 + Math.random() * 900)}`;
          counter++;
        }
        await claimUsername(candidate);
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInEmail, 
      signUpEmail, 
      signInGoogle, 
      logout,
      claimUsername,
      checkUsernameAvailable 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
