import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
  increment,
  query,
  limit,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  SITE_OWNER_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase.ts';
import { UserProfileDoc, SavedInboxDoc, SiteStatsDoc } from '../types/index.ts';

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfileDoc | null;
  isOwner: boolean;
  loading: boolean;
  savedInboxes: SavedInboxDoc[];
  siteStats: SiteStatsDoc;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  recordNewInbox: (address: string, duration: string) => Promise<void>;
  refreshStats: () => Promise<void>;
}

const defaultStats: SiteStatsDoc = {
  visitorsCount: 1,
  signedInUsersCount: 1,
  inboxesGeneratedCount: 0,
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savedInboxes, setSavedInboxes] = useState<SavedInboxDoc[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStatsDoc>(defaultStats);

  const isOwner = Boolean(
    user && user.email && user.email.toLowerCase() === SITE_OWNER_EMAIL.toLowerCase()
  );

  // 1. Listen to global site statistics
  useEffect(() => {
    const statsDocRef = doc(db, 'stats', 'site');
    const unsubStats = onSnapshot(
      statsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<SiteStatsDoc>;
          setSiteStats({
            visitorsCount: typeof data.visitorsCount === 'number' ? data.visitorsCount : 1,
            signedInUsersCount: typeof data.signedInUsersCount === 'number' ? data.signedInUsersCount : 1,
            inboxesGeneratedCount: typeof data.inboxesGeneratedCount === 'number' ? data.inboxesGeneratedCount : 0,
            updatedAt: data.updatedAt,
          });
        }
      },
      (error) => {
        // Non-blocking log
        console.warn('Could not subscribe to site stats:', error);
      }
    );

    // Increment visitor count once per session
    const logVisitor = async () => {
      try {
        const hasLogged = sessionStorage.getItem('snapmail_visit_counted');
        if (!hasLogged) {
          const snap = await getDoc(statsDocRef);
          if (snap.exists()) {
            const data = snap.data();
            const updates: Record<string, unknown> = {
              visitorsCount: increment(1),
              updatedAt: new Date().toISOString(),
            };
            if (typeof data['signedInUsersCount'] !== 'number') {
              updates['signedInUsersCount'] = 1;
            }
            await updateDoc(statsDocRef, updates);
          } else {
            await setDoc(statsDocRef, {
              visitorsCount: 1,
              signedInUsersCount: 1,
              inboxesGeneratedCount: 0,
              updatedAt: new Date().toISOString(),
            });
          }
          sessionStorage.setItem('snapmail_visit_counted', 'true');
        }
      } catch (err) {
        console.warn('Failed to increment visitor counter:', err);
      }
    };

    logVisitor();

    return () => {
      unsubStats();
    };
  }, []);

  // 2. Auth State Listener & User Data Sync
  useEffect(() => {
    const statsDocRef = doc(db, 'stats', 'site');
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setUserProfile(null);
        setSavedInboxes([]);
        setLoading(false);
        return;
      }

      // Check / create user profile document in Firestore
      const userRef = doc(db, 'users', currentUser.uid);
      try {
        const userSnap = await getDoc(userRef);
        const nowIso = new Date().toISOString();
        const role = currentUser.email?.toLowerCase() === SITE_OWNER_EMAIL.toLowerCase() ? 'owner' : 'user';

        if (!userSnap.exists()) {
          const initialProfile: UserProfileDoc = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || (role === 'owner' ? 'مالك الموقع' : 'مستخدم SnapMail'),
            photoURL: currentUser.photoURL || undefined,
            role,
            inboxesCount: 0,
            registeredCounted: true,
            createdAt: nowIso,
            updatedAt: nowIso,
          };
          await setDoc(userRef, initialProfile);
          setUserProfile(initialProfile);

          // Increment registered users in stats
          try {
            await updateDoc(statsDocRef, {
              signedInUsersCount: increment(1),
              updatedAt: nowIso,
            });
          } catch (e) {
            console.warn('Could not increment signedInUsersCount:', e);
          }
        } else {
          const existingData = userSnap.data() as UserProfileDoc;
          const updates: Record<string, unknown> = {};

          if (role === 'owner' && existingData.role !== 'owner') {
            updates.role = 'owner';
            updates.updatedAt = nowIso;
          }

          // Count existing user once if not counted yet
          if (!existingData.registeredCounted) {
            updates.registeredCounted = true;
            updates.updatedAt = nowIso;
            try {
              await updateDoc(statsDocRef, {
                signedInUsersCount: increment(1),
                updatedAt: nowIso,
              });
            } catch (e) {
              console.warn('Could not increment signedInUsersCount for existing user:', e);
            }
          }

          if (Object.keys(updates).length > 0) {
            await updateDoc(userRef, updates);
            setUserProfile({ ...existingData, ...updates } as UserProfileDoc);
          } else {
            setUserProfile(existingData);
          }
        }
      } catch (err) {
        console.error('Error fetching/creating user profile:', err);
        handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
      }

      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 3. User Inboxes Realtime Listener
  useEffect(() => {
    if (!user) return;

    const inboxesColRef = collection(db, 'users', user.uid, 'inboxes');
    const inboxesQuery = query(inboxesColRef, limit(50));

    const unsubInboxes = onSnapshot(
      inboxesQuery,
      (snapshot) => {
        const inboxes: SavedInboxDoc[] = [];
        snapshot.forEach((docSnap) => {
          inboxes.push(docSnap.data() as SavedInboxDoc);
        });
        // Sort descending by createdAt
        inboxes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setSavedInboxes(inboxes);
      },
      (error) => {
        console.error('Error loading inboxes:', error);
        handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/inboxes`);
      }
    );

    return () => {
      unsubInboxes();
    };
  }, [user]);

  // Sign in with Google Popup
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setSavedInboxes([]);
    } catch (err) {
      console.error('Sign-out failed:', err);
      throw err;
    }
  };

  // Record a generated disposable inbox
  const recordNewInbox = async (address: string, duration: string) => {
    const nowIso = new Date().toISOString();
    const statsDocRef = doc(db, 'stats', 'site');

    // Always increment global generated count
    try {
      const snap = await getDoc(statsDocRef);
      if (snap.exists()) {
        await updateDoc(statsDocRef, {
          inboxesGeneratedCount: increment(1),
          updatedAt: nowIso,
        });
      } else {
        await setDoc(statsDocRef, {
          visitorsCount: 1,
          inboxesGeneratedCount: 1,
          updatedAt: nowIso,
        });
      }
    } catch (err) {
      console.warn('Failed to update inboxesGeneratedCount in stats:', err);
    }

    // If user is authenticated, store to user's database
    if (user) {
      try {
        const inboxId = address.replace(/[^a-zA-Z0-9_-]/g, '_');
        const inboxDocRef = doc(db, 'users', user.uid, 'inboxes', inboxId);
        const userRef = doc(db, 'users', user.uid);

        const newInbox: SavedInboxDoc = {
          id: inboxId,
          userId: user.uid,
          address,
          duration,
          createdAt: nowIso,
          status: 'active',
        };

        await setDoc(inboxDocRef, newInbox);
        await updateDoc(userRef, {
          inboxesCount: increment(1),
          updatedAt: nowIso,
        });

        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                inboxesCount: (prev.inboxesCount || 0) + 1,
                updatedAt: nowIso,
              }
            : null
        );
      } catch (err) {
        console.error('Failed to save inbox to user profile:', err);
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/inboxes`);
      }
    }
  };

  const refreshStats = async () => {
    try {
      const statsDocRef = doc(db, 'stats', 'site');
      const snap = await getDoc(statsDocRef);
      if (snap.exists()) {
        const data = snap.data() as Partial<SiteStatsDoc>;
        setSiteStats({
          visitorsCount: typeof data.visitorsCount === 'number' ? data.visitorsCount : 1,
          signedInUsersCount: typeof data.signedInUsersCount === 'number' ? data.signedInUsersCount : 1,
          inboxesGeneratedCount: typeof data.inboxesGeneratedCount === 'number' ? data.inboxesGeneratedCount : 0,
          updatedAt: data.updatedAt,
        });
      }
    } catch (err) {
      console.warn('Error refreshing stats:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isOwner,
        loading,
        savedInboxes,
        siteStats,
        signInWithGoogle,
        logout,
        recordNewInbox,
        refreshStats,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
