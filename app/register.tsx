import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react-native";
import { auth, db } from "./config/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    // Create AbortController for cancellation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Update user profile with name
      await updateProfile(user, {
        displayName: name,
      });

      // Store additional user data in Firestore
      const docRef = doc(db, "users", user.uid);
      const userData = {
        uid: user.uid,
        displayName: name,
        email: email,
        role: "customer", // Default role for new users
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, userData);

      // Clear timeout since operations completed successfully
      clearTimeout(timeoutId);

      Alert.alert(
        "Registration Successful",
        "Your account has been created successfully!",
        [{ text: "OK", onPress: () => router.push("/") }],
      );
    } catch (error) {
      // Clear timeout to prevent memory leaks
      clearTimeout(timeoutId);

      console.error("Registration error:", error);
      let errorMessage = "Failed to register. Please try again.";

      // Handle abort/timeout errors
      if (
        error.name === "AbortError" ||
        error.code === "auth/network-request-failed"
      ) {
        errorMessage =
          "Network connection issue. Please check your internet connection and try again.";
      }
      // Handle specific Firebase errors
      else if (error.code === "auth/email-already-in-use") {
        errorMessage =
          "This email is already registered. Please use a different email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use a stronger password.";
      }

      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push("/");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center px-6 pt-10 pb-6 bg-white">
          {/* Logo */}
          <View className="w-full items-center mb-8">
            <Image
              source={require("../assets/images/icon.png")}
              className="w-24 h-24 mb-4"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-blue-600">
              Create Account
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              Join Digital Printing Tracker
            </Text>
          </View>

          {/* Registration Form */}
          <View className="w-full space-y-4">
            {/* Name Input */}
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <User size={20} color="#6B7280" />
              </View>
              <TextInput
                className="w-full bg-gray-100 rounded-lg px-10 py-3 text-gray-800"
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Mail size={20} color="#6B7280" />
              </View>
              <TextInput
                className="w-full bg-gray-100 rounded-lg px-10 py-3 text-gray-800"
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#6B7280" />
              </View>
              <TextInput
                className="w-full bg-gray-100 rounded-lg px-10 py-3 text-gray-800"
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                className="absolute right-3 top-3 z-10"
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#6B7280" />
                ) : (
                  <Eye size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input */}
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Lock size={20} color="#6B7280" />
              </View>
              <TextInput
                className="w-full bg-gray-100 rounded-lg px-10 py-3 text-gray-800"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`w-full ${loading ? "bg-blue-400" : "bg-blue-600"} rounded-lg py-3 items-center mt-4`}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-white font-bold text-lg">
                {loading ? "Creating Account..." : "Register"}
              </Text>
            </TouchableOpacity>

            {/* Login Option */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text className="text-blue-600 font-semibold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
