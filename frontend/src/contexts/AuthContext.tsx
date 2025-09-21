import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

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
  logout: () => Promise<any>; // FIX: Standardized to 'logout'
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

  // FIX: Standardized to 'logout'
  const logout = async () => {
    await signOut(auth);
    // The onAuthStateChanged listener will handle state updates and redirects
  };

  // Session Timeout Logic
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (currentUser) {
        timeoutId = setTimeout(() => {
            alert("Your session has expired due to inactivity. Please log in again.");
            logout(); // FIX: Standardized to 'logout'
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ ...user, username: userData.username, role: userData.role });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, username: string, role: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, { username, role, email });
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
    if (!userDoc.exists()) {
      return userCredential;
    }
    return null;
  };

  const finalizeGoogleSignUp = async (user: User, role: string) => {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      username: user.displayName || user.email,
      role: role,
      email: user.email,
    });
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({ ...user, username: userData.username, role: userData.role });
    }
  };

  const value = { currentUser, loading, signUp, logIn, signInWithGoogle, finalizeGoogleSignUp, logout }; // FIX: Standardized to 'logout'

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

