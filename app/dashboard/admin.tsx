import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Search,
  User,
  BarChart3,
  Package,
  Plus,
  Settings,
} from "lucide-react-native";
import OrderManagement from "../components/OrderManagement";
import UserManagement from "../components/UserManagement";
import AppSettings from "../components/AppSettings";
import { logoutUser, getUserRole } from "../utils/auth";

type TabType = "orders" | "users" | "analytics" | "settings";

export default function AdminDashboard() {
  const router = useRouter();

  // Check if user has admin role
  useEffect(() => {
    const checkAdminAccess = async () => {
      const userRole = await getUserRole();
      if (userRole !== "admin") {
        // Redirect non-admin users to customer dashboard
        router.replace("/dashboard/customer");
      }
    };

    checkAdminAccess();
  }, [router]);

  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [searchQuery, setSearchQuery] = useState("");

  const renderTabContent = () => {
    switch (activeTab) {
      case "orders":
        return <OrderManagement />;

      case "users":
        return <UserManagement />;

      case "settings":
        return <AppSettings />;

      case "analytics":
        return (
          <View className="bg-white p-4 rounded-lg shadow-sm">
            <Text className="text-lg font-bold mb-4">Business Analytics</Text>

            <View className="bg-gray-100 p-4 rounded-lg mb-4">
              <Text className="font-semibold mb-2">Orders Summary</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Total Orders</Text>
                <Text className="font-medium">42</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Completed</Text>
                <Text className="font-medium">28</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">In Progress</Text>
                <Text className="font-medium">14</Text>
              </View>
            </View>

            <View className="bg-gray-100 p-4 rounded-lg mb-4">
              <Text className="font-semibold mb-2">Revenue</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">This Month</Text>
                <Text className="font-medium">$4,250</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Last Month</Text>
                <Text className="font-medium">$3,800</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Growth</Text>
                <Text className="font-medium text-green-500">+11.8%</Text>
              </View>
            </View>

            <View className="bg-gray-100 p-4 rounded-lg">
              <Text className="font-semibold mb-2">Popular Products</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Business Cards</Text>
                <Text className="font-medium">32%</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Brochures</Text>
                <Text className="font-medium">24%</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Banners</Text>
                <Text className="font-medium">18%</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-xl font-bold">
              Admin Dashboard
            </Text>
            <Text className="text-blue-100">Manage orders and users</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              logoutUser()
                .then(() => router.replace("/"))
                .catch((error) =>
                  Alert.alert(
                    "Logout Error",
                    "Failed to log out. Please try again.",
                  ),
                );
            }}
            className="bg-red-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setActiveTab("orders")}
          className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "orders" ? "border-b-2 border-blue-500" : ""}`}
        >
          <Package
            size={18}
            color={activeTab === "orders" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            className={`ml-1 ${activeTab === "orders" ? "text-blue-500 font-medium" : "text-gray-500"}`}
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("users")}
          className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "users" ? "border-b-2 border-blue-500" : ""}`}
        >
          <User
            size={18}
            color={activeTab === "users" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            className={`ml-1 ${activeTab === "users" ? "text-blue-500 font-medium" : "text-gray-500"}`}
          >
            Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("analytics")}
          className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "analytics" ? "border-b-2 border-blue-500" : ""}`}
        >
          <BarChart3
            size={18}
            color={activeTab === "analytics" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            className={`ml-1 ${activeTab === "analytics" ? "text-blue-500 font-medium" : "text-gray-500"}`}
          >
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("settings")}
          className={`flex-1 py-3 flex-row justify-center items-center ${activeTab === "settings" ? "border-b-2 border-blue-500" : ""}`}
        >
          <Settings
            size={18}
            color={activeTab === "settings" ? "#3b82f6" : "#6b7280"}
          />
          <Text
            className={`ml-1 ${activeTab === "settings" ? "text-blue-500 font-medium" : "text-gray-500"}`}
          >
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search for Users Tab */}
      {activeTab === "users" && (
        <View className="p-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Search size={18} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-gray-800"
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      )}

      {/* Main Content */}
      <View className="flex-1 p-4">{renderTabContent()}</View>

      {/* Floating Action Button for Users */}
      {activeTab === "users" && (
        <TouchableOpacity className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg">
          <Plus size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}
