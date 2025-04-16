import { auth, db } from "../config/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// Check if user is authenticated
export const isAuthenticated = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Cache for user roles to improve performance
const userRoleCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Get user role from Firestore with caching
export const getUserRole = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  // Check cache first
  const cachedData = userRoleCache.get(user.uid);
  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_EXPIRY) {
    return cachedData.role;
  }

  // Create AbortController for cancellation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const docRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(docRef);

    // Clear timeout since operation completed successfully
    clearTimeout(timeoutId);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const role = userData.role || "customer"; // Default to customer if role is undefined

      // Update cache
      userRoleCache.set(user.uid, { role, timestamp: now });

      return role;
    }

    // If document doesn't exist, cache default role
    userRoleCache.set(user.uid, { role: "customer", timestamp: now });
    return "customer";
  } catch (error) {
    // Clear timeout to prevent memory leaks
    clearTimeout(timeoutId);

    console.error("Error getting user role:", error);

    // Return cached role if available, even if expired
    if (cachedData) {
      return cachedData.role;
    }

    return "customer"; // Default to customer role on error
  }
};

// Sign out user
export const logoutUser = async (): Promise<void> => {
  // Create AbortController for cancellation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    await signOut(auth);
    // Clear user role cache on logout
    if (auth.currentUser) {
      userRoleCache.delete(auth.currentUser.uid);
    }
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Error signing out:", error);
    throw error;
  }
};

// Default export for Expo Router
export default function AuthUtils() {
  return null;
}
