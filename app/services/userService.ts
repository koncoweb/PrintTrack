import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";

export interface User {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  address?: string;
  birthdate?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type UserRole = "admin" | "designer" | "operator" | "customer";
export type UserStatus = "active" | "inactive";

const USERS_COLLECTION = "users";

// Get all users
export const getUsers = async (): Promise<User[]> => {
  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(usersQuery);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "customer",
        status: data.status || "active",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as User;
    });
  } catch (error) {
    console.error("Error getting users:", error);
    throw error;
  }
};

// Get a single user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "customer",
        status: data.status || "active",
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    throw error;
  }
};

// Update a user
export const updateUser = async (
  userId: string,
  userData: Partial<User>,
): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);

    const updatedData = {
      ...userData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(userRef, updatedData);
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
};

// Create a new user
export const createUser = async (
  userData: Omit<User, "id">,
): Promise<string> => {
  try {
    const userWithTimestamps = {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, USERS_COLLECTION),
      userWithTimestamps,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Default export for Expo Router
export default function UserService() {
  return null;
}
