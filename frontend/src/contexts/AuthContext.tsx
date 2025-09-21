import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

// Interfaces remain the same
interface AuthUser extends User {
  username?: string;
  role?: 'Manager' | 'Operator';
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, role: string) => Promise<any>;
  logIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<UserCredential | null>;
  finalizeGoogleSignUp: (user: User, role: string) => Promise<void>;
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const SESSION_TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logOut = async () => {
    await signOut(auth);
    // No need to navigate here, onAuthStateChanged will handle it.
  };

  // Session Timeout Logic (unchanged from your request)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentUser) {
        timeoutId = setTimeout(() => {
            alert("Your session has expired due to inactivity. Please log in again.");
            logOut();
        }, SESSION_TIMEOUT_DURATION);
      }
    };
    const handleActivity = () => resetTimeout();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);
    resetTimeout();
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [currentUser]);

  // --- CORE FIX: Centralized Auth State and Firestore Data Fetching ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is authenticated by Firebase, now get their profile from Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // If the user profile exists in Firestore, combine auth data and profile data.
          const userData = userDoc.data();
          setCurrentUser({ ...user, username: userData.username, role: userData.role });
        } else {
          // This case is for a new Google user who hasn't picked a role yet.
          // We set the basic user object for now. The profile will be full after role selection.
          setCurrentUser(user);
        }
      } else {
        // User is logged out.
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  // --- Authentication Functions ---
  const signUp = async (email: string, password: string, username: string, role: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    // Save the extra user info to Firestore
    await setDoc(userDocRef, { username, role, email });
    // Sign out to force the user to log in after signing up
    return signOut(auth);
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    // If user document doesn't exist, they are a NEW Google user.
    // Return credentials to the UI to trigger the role selection modal.
    if (!userDoc.exists()) {
      return userCredential;
    }
    // If they already exist, do nothing. onAuthStateChanged will handle login.
    return null;
  };

  const finalizeGoogleSignUp = async (user: User, role: string) => {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      username: user.displayName || user.email,
      role: role,
      email: user.email,
    });
    // Manually update the current user state after finalizing the profile
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({ ...user, username: userData.username, role: userData.role });
    }
  };

  const value = { currentUser, loading, signUp, logIn, signInWithGoogle, finalizeGoogleSignUp, logOut };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

