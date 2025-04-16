import React, { useState, useEffect } from "react";
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
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { auth } from "./config/firebase";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./config/firebase";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [orderNumber, setOrderNumber] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, check their role in Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          clearTimeout(timeoutId);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === "admin") {
              router.replace("/dashboard/admin");
            } else if (userData.role === "designer") {
              router.replace("/dashboard/designer");
            } else if (userData.role === "operator") {
              // For future implementation of operator dashboard
              // Currently redirecting to customer dashboard
              router.replace("/dashboard/customer");
            } else {
              // Default to customer dashboard for customer role or any other role
              router.replace("/dashboard/customer");
            }
          } else {
            // If no user document exists, default to customer dashboard
            router.replace("/dashboard/customer");
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.error("Error checking user role:", error);
          // Default to customer dashboard on error
          router.replace("/dashboard/customer");
        }
      } else {
        // User is not signed in, stay on login page
        clearTimeout(timeoutId);
        setInitializing(false);
      }
    });

    // Cleanup subscription and timeout on unmount
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    // Create AbortController for cancellation
    const controller = new AbortController();
    const signal = controller.signal;

    // Set timeout to abort if taking too long
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      // Pass signal to Firebase auth (will be ignored if not supported but helps with fetch operations)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Check user role in Firestore with AbortController
      const docRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(docRef);

      // Clear timeout since operation completed successfully
      clearTimeout(timeoutId);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role === "admin") {
          router.replace("/dashboard/admin");
        } else if (userData.role === "designer") {
          router.replace("/dashboard/designer");
        } else if (userData.role === "operator") {
          // For future implementation of operator dashboard
          // Currently redirecting to customer dashboard
          router.replace("/dashboard/customer");
        } else {
          // Default to customer dashboard for customer role or any other role
          router.replace("/dashboard/customer");
        }
      } else {
        // If no user document exists, default to customer dashboard
        router.replace("/dashboard/customer");
      }
    } catch (error) {
      // Clear timeout to prevent memory leaks
      clearTimeout(timeoutId);

      console.error("Login error:", error);
      let errorMessage = "Invalid email or password. Please try again.";

      // Handle abort/timeout errors
      if (
        error.name === "AbortError" ||
        error.code === "auth/network-request-failed"
      ) {
        errorMessage =
          "Network connection issue. Please check your internet connection and try again.";
      }
      // Handle specific Firebase errors
      else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage =
          "Too many failed login attempts. Please try again later.";
      } else if (error.code === "auth/user-disabled") {
        errorMessage =
          "This account has been disabled. Please contact support.";
      }

      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Create AbortController for cancellation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      await sendPasswordResetEmail(auth, email);
      clearTimeout(timeoutId);
      Alert.alert(
        "Password Reset",
        "A password reset link has been sent to your email address.",
      );
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Password reset error:", error);
      let errorMessage =
        "Failed to send password reset email. Please try again.";

      if (
        error.name === "AbortError" ||
        error.code === "auth/network-request-failed"
      ) {
        errorMessage =
          "Network connection issue. Please check your internet connection and try again.";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format.";
      }

      Alert.alert("Password Reset Failed", errorMessage);
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  const handleTrackOrder = () => {
    if (!orderNumber.trim()) {
      Alert.alert("Error", "Please enter an order number");
      return;
    }

    // Navigate to order tracking page with the order number as a parameter
    router.push(`/order-tracking?orderNumber=${orderNumber.trim()}`);
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
          <View className="w-full items-center mb-10">
            <Image
              source={require("../assets/images/icon.png")}
              className="w-32 h-32 mb-4"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-blue-600">
              NeRo Digital Printing
            </Text>
            <Text className="text-base text-gray-500 mt-1">
              Track your printing orders with ease
            </Text>
          </View>

          {/* Order Tracking */}
          <View className="w-full mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <Text className="text-base font-medium text-gray-700 mb-2">
              Track Your Order
            </Text>
            <View className="flex-row space-x-2">
              <TextInput
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                placeholder="Enter Order Number"
                value={orderNumber}
                onChangeText={setOrderNumber}
                keyboardType="default"
              />
              <TouchableOpacity
                className="bg-green-600 rounded-lg px-4 py-2 items-center justify-center"
                onPress={handleTrackOrder}
              >
                <Text className="text-white font-medium">Track</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Form */}
          <View className="w-full space-y-4">
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

            {/* Forgot Password */}
            <TouchableOpacity
              className="self-end"
              onPress={handleForgotPassword}
            >
              <Text className="text-blue-600">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="w-full bg-blue-600 rounded-lg py-3 items-center mt-2"
              onPress={handleLogin}
            >
              <Text className="text-white font-bold text-lg">Login</Text>
            </TouchableOpacity>

            {/* Register Option */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={handleRegister}>
                <Text className="text-blue-600 font-semibold">Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
