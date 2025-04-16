import React from "react";
import { View, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import AppSettings from "../components/AppSettings";

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: "Pengaturan Aplikasi" }} />

      {/* Header */}
      <View className="bg-blue-500 p-4">
        <View className="flex-row items-center">
          <ArrowLeft
            size={24}
            color="white"
            onPress={() => router.back()}
            style={{ marginRight: 12 }}
          />
          <View>
            <Text className="text-white text-xl font-bold">
              Pengaturan Aplikasi
            </Text>
            <Text className="text-white opacity-80 mt-1">
              Konfigurasi dasar aplikasi
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <AppSettings />
    </View>
  );
}
