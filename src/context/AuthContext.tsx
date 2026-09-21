import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseAvailable, ADMIN_UID, ADMIN_EMAIL } from '../lib/firebase/client';
import { UserProfile, BangladeshAddress } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  loginDemoCustomer: () => void;
  loginDemoAdmin: () => void;
  updateAddresses: (addresses: BangladeshAddress[]) => Promise<void>;
  updateProfileInfo: (name: string, phone: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CUSTOMER: UserProfile = {
  uid: 'demo_customer_bd_01',
  name: 'Arifur Rahman',
  email: 'arif.rahman@example.com',
  phone: '01712-345678',
  role: 'customer',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-20T00:00:00Z',
  addresses: [
    {
      id: 'addr_01',
      recipientName: 'Arifur Rahman',
      phone: '01712-345678',
      division: 'Dhaka',
      district: 'Dhaka (City & Suburbs)',
      upazila: 'Gulshan & Banani',
      fullAddress: 'House 24, Road 11, Block D, Banani, Dhaka',
      isDefault: true,
    },
  ],
};

const DEMO_ADMIN: UserProfile = {
  uid: ADMIN_UID,
  name: 'ShopBD Master Admin',
  email: ADMIN_EMAIL,
  phone: '01911-000000',
  role: 'admin',
  photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-03-21T00:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('shopbd_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Determine admin rights
  const isAdmin = Boolean(
    user && (user.role === 'admin' || user.uid === ADMIN_UID || user.email === ADMIN_EMAIL)
  );

  useEffect(() => {
    if (user) {
      localStorage.setItem('shopbd_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('shopbd_current_user');
    }
  }, [user]);

  useEffect(() => {
    if (!isFirebaseAvailable || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          // Check firestore user doc
          let profile: UserProfile | null = null;
          if (db) {
            const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
            if (userDoc.exists()) {
              profile = userDoc.data() as UserProfile;
            }
          }

          if (!profile) {
            const role = fbUser.uid === ADMIN_UID || fbUser.email === ADMIN_EMAIL ? 'admin' : 'customer';
            profile = {
              uid: fbUser.uid,
              name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Customer',
              email: fbUser.email || '',
              role,
              photoURL: fbUser.photoURL || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            if (db) {
              await setDoc(doc(db, 'users', fbUser.uid), profile);
            }
          }
          setUser(profile);
        } catch (e) {
          console.warn('Error fetching user profile:', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        await signInWithEmailAndPassword(auth, email, pass);
      } else {
        // Fallback demo matching
        if (email.toLowerCase().includes('admin')) {
          loginDemoAdmin();
        } else {
          setUser({
            uid: 'cust_' + Date.now(),
            name: email.split('@')[0],
            email,
            role: 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      // If firebase auth fails or not set up, throw error with user-friendly message
      throw new Error(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, pass: string) => {
    setLoading(true);
    try {
      if (isFirebaseAvailable && auth) {
        const cred = await createUserWithEmailAndPassword(auth, email, pass);
        const newProfile: UserProfile = {
          uid: cred.user.uid,
          name,
          email,
          phone,
          role: cred.user.uid === ADMIN_UID ? 'admin' : 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        if (db) {
          await setDoc(doc(db, 'users', cred.user.uid), newProfile);
        }
        setUser(newProfile);
      } else {
        const newProfile: UserProfile = {
          uid: 'user_' + Date.now(),
          name,
          email,
          phone,
          role: 'customer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(newProfile);
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (isFirebaseAvailable && auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn('SignOut error:', e);
    } finally {
      setUser(null);
      localStorage.removeItem('shopbd_current_user');
    }
  };

  const loginDemoCustomer = () => {
    setUser(DEMO_CUSTOMER);
  };

  const loginDemoAdmin = () => {
    setUser(DEMO_ADMIN);
  };

  const updateAddresses = async (addresses: BangladeshAddress[]) => {
    if (!user) return;
    const updated = { ...user, addresses, updatedAt: new Date().toISOString() };
    setUser(updated);
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      } catch (e) {
        console.warn('Address update error:', e);
      }
    }
  };

  const updateProfileInfo = async (name: string, phone: string) => {
    if (!user) return;
    const updated = { ...user, name, phone, updatedAt: new Date().toISOString() };
    setUser(updated);
    if (isFirebaseAvailable && db) {
      try {
        await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      } catch (e) {
        console.warn('Profile update error:', e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        login,
        register,
        logout,
        loginDemoCustomer,
        loginDemoAdmin,
        updateAddresses,
        updateProfileInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
