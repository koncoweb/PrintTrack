import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Save, Upload, AlertTriangle } from "lucide-react-native";

interface AppSettingsProps {
  onClose?: () => void;
}

interface AppConfig {
  appName: string;
  logoUrl: string;
}

const defaultLogo = require("../../assets/images/icon.png");

const AppSettings: React.FC<AppSettingsProps> = ({ onClose }) => {
  const [appName, setAppName] = useState("NeRo Digital Printing");
  const [logoUrl, setLogoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppSettings();
  }, []);

  const fetchAppSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "appConfig", "settings");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as AppConfig;
        setAppName(data.appName || "NeRo Digital Printing");
        setLogoUrl(data.logoUrl || "");
      }
    } catch (err) {
      console.error("Error fetching app settings:", err);
      setError("Gagal memuat pengaturan aplikasi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!appName.trim()) {
      Alert.alert("Error", "Nama aplikasi tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const docRef = doc(db, "appConfig", "settings");
      await setDoc(docRef, {
        appName: appName.trim(),
        logoUrl: logoUrl || "",
        updatedAt: new Date(),
      });

      Alert.alert("Sukses", "Pengaturan aplikasi berhasil disimpan");
    } catch (err) {
      console.error("Error saving app settings:", err);
      setError("Gagal menyimpan pengaturan aplikasi. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadLogo = async () => {
    // In a real implementation, this would use expo-image-picker
    // For this demo, we'll just use a placeholder alert
    Alert.alert(
      "Upload Logo",
      "Pada implementasi sebenarnya, ini akan membuka pemilih gambar.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Gunakan Logo Default",
          onPress: () => {
            // In a real implementation, this would upload the default logo
            // For now, we'll just set a placeholder URL
            setLogoUrl("/assets/images/icon.png");
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">
          Memuat pengaturan aplikasi...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <Text className="text-xl font-bold text-gray-800 mb-6">
            Pengaturan Aplikasi
          </Text>

          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4 flex-row items-center">
              <AlertTriangle size={20} color="#ef4444" />
              <Text className="text-red-500 ml-2">{error}</Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2">
              Nama Aplikasi
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
              value={appName}
              onChangeText={setAppName}
              placeholder="Masukkan nama aplikasi"
            />
            <Text className="text-gray-500 text-xs mt-1">
              Nama ini akan ditampilkan di seluruh aplikasi
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">
              Logo Aplikasi
            </Text>
            <View className="items-center justify-center bg-gray-100 rounded-lg p-4 mb-2">
              {logoUrl ? (
                <Image
                  source={{ uri: logoUrl }}
                  className="w-48 h-48 rounded-lg"
                  resizeMode="contain"
                />
              ) : (
                <Image
                  source={defaultLogo}
                  className="w-48 h-48 rounded-lg"
                  resizeMode="contain"
                />
              )}
            </View>
            <TouchableOpacity
              onPress={handleUploadLogo}
              className="bg-blue-500 py-2 px-4 rounded-lg flex-row items-center justify-center"
            >
              <Upload size={18} color="white" />
              <Text className="text-white font-medium ml-2">
                Upload Logo Baru
              </Text>
            </TouchableOpacity>
            <Text className="text-gray-500 text-xs mt-1">
              Logo ini akan ditampilkan di halaman login dan register
            </Text>
          </View>

          <View className="flex-row justify-end">
            {onClose && (
              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-200 py-2 px-4 rounded-lg mr-2"
                disabled={isSaving}
              >
                <Text className="text-gray-700 font-medium">Batal</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleSaveSettings}
              className="bg-green-500 py-2 px-4 rounded-lg flex-row items-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Save size={18} color="white" />
              )}
              <Text className="text-white font-medium ml-2">
                {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AppSettings;
