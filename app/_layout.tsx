import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import "../global.css";
import { Platform } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./config/firebase";
import { doc, getDoc } from "firebase/firestore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Auth context provider for role-based access control
// Import BottomNavigation component
import BottomNavigation from "./components/BottomNavigation";

function ProtectedLayout() {
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role);
          } else {
            setUserRole("customer"); // Default role
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole("customer"); // Default to customer on error
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inAdminRoute = segments[0] === "dashboard" && segments[1] === "admin";

    // If user is not signed in and not on auth page, register page, or order-tracking page, redirect to login
    if (
      !user &&
      !segments[0]?.startsWith("tempobook") &&
      segments[0] !== "register" &&
      segments[0] !== "order-tracking"
    ) {
      router.replace("/");
    }
    // If trying to access admin route without admin role
    else if (inAdminRoute && userRole !== "admin") {
      router.replace("/dashboard/customer");
    }
    // If trying to access designer route without designer role
    else if (
      segments[0] === "dashboard" &&
      segments[1] === "designer" &&
      userRole !== "designer"
    ) {
      router.replace("/dashboard/customer");
    }
    // If user has designer role but is not on designer dashboard or order-detail, redirect them
    else if (
      userRole === "designer" &&
      segments[0] === "dashboard" &&
      segments[1] !== "designer" &&
      segments[1] !== "order-detail"
    ) {
      router.replace("/dashboard/designer");
    }
    // If user has operator role but is not on operator dashboard or order-detail, redirect them
    else if (
      userRole === "operator" &&
      segments[0] === "dashboard" &&
      segments[1] !== "operator" &&
      segments[1] !== "order-detail"
    ) {
      router.replace("/dashboard/operator");
    }
  }, [user, userRole, segments, isLoading]);

  return isLoading ? null : (
    <>
      <RootLayoutNav />
      {user && !segments[0]?.startsWith("tempobook") && (
        <BottomNavigation userRole={userRole} />
      )}
    </>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={({ route }) => ({
        headerShown: !route.name.startsWith("tempobook"),
      })}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen
        name="dashboard/customer"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="dashboard/admin" options={{ headerShown: false }} />
      <Stack.Screen
        name="dashboard/designer"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="dashboard/operator"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="dashboard/order-detail"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile" options={{ title: "My Profile" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_TEMPO && Platform.OS === "web") {
      const { TempoDevtools } = require("tempo-devtools");
      TempoDevtools.init();
    }
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <ProtectedLayout />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
