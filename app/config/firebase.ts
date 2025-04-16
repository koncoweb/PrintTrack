import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCp4kAP2ip_qmXXbLNAw0Qw3lUiSZJwGeA",
  authDomain: "crmapp-6e5cf.firebaseapp.com",
  projectId: "crmapp-6e5cf",
  storageBucket: "crmapp-6e5cf.firebasestorage.app",
  messagingSenderId: "109134088317",
  appId: "1:109134088317:web:2f2b6b68a0254e3adbc914",
  measurementId: "G-5V3N2XJVK7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

// Default export for Expo Router
export default function FirebaseConfig() {
  return null;
}
