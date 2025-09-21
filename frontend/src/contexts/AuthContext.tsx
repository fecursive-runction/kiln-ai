import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, UserCredential } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

interface AuthUser extends User {
  username?: string;
  role?: 'Manager' | 'Operator';
}

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, role: string) => Promise<any>;
  logIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<UserCredential | null>; // <-- Now returns a value
  finalizeGoogleSignUp: (user: User, role: string) => Promise<void>; // <-- NEW function
  logOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, username: string, role: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    return setDoc(userDocRef, { username, role, email });
  };

  const logIn = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async (): Promise<UserCredential | null> => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    // If the user document does NOT exist, they are a new user.
    // Return their credentials so the UI can prompt for a role.
    if (!userDoc.exists()) {
      return userCredential;
    }
    // If they exist, return null. The onAuthStateChanged listener will handle login.
    return null;
  };

  // --- NEW: This function saves the role for a new Google user ---
  const finalizeGoogleSignUp = async (user: User, role: string) => {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      username: user.displayName || user.email,
      role: role,
      email: user.email,
    });
    // Trigger a state refresh to get the new user data
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({ ...user, username: userData.username, role: userData.role });
    }
  };

  const logOut = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ ...user, username: userData.username, role: userData.role });
        } else {
          // This might happen briefly for a new Google user before their role is set
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, loading, signUp, logIn, signInWithGoogle, finalizeGoogleSignUp, logOut };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};