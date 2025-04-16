import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config/firebase";
import { Stack } from "expo-router";
import { getCurrentUser } from "./utils/auth";

interface UserProfile {
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  [key: string]: any; // For any additional fields
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const currentUser = getCurrentUser();

        if (!currentUser) {
          setError("No user is currently logged in");
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          setError("User profile not found");
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const renderProfileField = (label: string, value: any) => {
    if (value === undefined || value === null) return null;

    return (
      <View className="mb-4 border-b border-gray-200 pb-2">
        <Text className="text-gray-500 text-sm">{label}</Text>
        <Text className="text-black text-lg">{value}</Text>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: "My Profile" }} />
      <ScrollView className="flex-1 bg-white p-4">
        {loading ? (
          <View className="flex-1 justify-center items-center p-4">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-2 text-gray-600">Loading profile...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-red-500 text-center">{error}</Text>
          </View>
        ) : profile ? (
          <View className="bg-white rounded-lg p-4 shadow-sm">
            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center mb-2">
                <Text className="text-blue-500 text-2xl font-bold">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
              <Text className="text-xl font-bold">
                {profile.name || "User"}
              </Text>
              <Text className="text-sm text-gray-500 capitalize">
                {profile.role || "Customer"}
              </Text>
            </View>

            <View className="mt-4">
              {renderProfileField("Email", profile.email)}
              {renderProfileField("Phone", profile.phone)}
              {renderProfileField("Address", profile.address)}
              {renderProfileField("Account Created", profile.createdAt)}

              {/* Render any additional fields from the user document */}
              {Object.entries(profile)
                .filter(
                  ([key]) =>
                    ![
                      "email",
                      "name",
                      "role",
                      "phone",
                      "address",
                      "createdAt",
                    ].includes(key),
                )
                .map(([key, value], index) => {
                  // Skip rendering functions or objects
                  if (typeof value === "object" || typeof value === "function")
                    return null;
                  return (
                    <React.Fragment key={key}>
                      {renderProfileField(
                        key.charAt(0).toUpperCase() + key.slice(1),
                        value,
                      )}
                    </React.Fragment>
                  );
                })}
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-gray-500 text-center">
              No profile data available
            </Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
