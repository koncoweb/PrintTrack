import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Search, Bell, User } from "lucide-react-native";
import OrderTrackingView from "../components/OrderTrackingView";
import OrderDetailsCard from "../components/OrderDetailsCard";
import { logoutUser } from "../utils/auth";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: string;
  productDetails: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Mock data for orders
  const mockOrders: Order[] = [
    {
      id: "1",
      orderNumber: "ORD-2023-001",
      customerName: "John Doe",
      orderDate: "2023-05-15",
      status: "Design in Progress",
      productDetails: "Business Cards (250 pcs)",
    },
    {
      id: "2",
      orderNumber: "ORD-2023-002",
      customerName: "John Doe",
      orderDate: "2023-05-20",
      status: "Awaiting Approval",
      productDetails: "Brochures (100 pcs)",
    },
    {
      id: "3",
      orderNumber: "ORD-2023-003",
      customerName: "John Doe",
      orderDate: "2023-05-25",
      status: "In Production",
      productDetails: "Banners (2 pcs)",
    },
  ];

  const filteredOrders = mockOrders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productDetails.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-white pb-16">
      {/* Added pb-16 to account for bottom navigation */}
      {/* Header */}
      <View className="px-4 py-3 flex-row justify-between items-center border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-100 mr-3 items-center justify-center">
            <User size={20} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-lg font-bold">Hello, John</Text>
            <Text className="text-sm text-gray-500">Customer</Text>
          </View>
        </View>
        <View className="flex-row items-center">
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
            className="mr-3 px-3 py-1 bg-red-500 rounded-lg"
          >
            <Text className="text-white font-medium">Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
            <Bell size={20} color="#4b5563" />
          </TouchableOpacity>
        </View>
      </View>
      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      {selectedOrder ? (
        // Order Detail View
        <View className="flex-1 px-4">
          <TouchableOpacity
            onPress={() => setSelectedOrder(null)}
            className="mb-4 py-2"
          >
            <Text className="text-blue-500 font-semibold">
              ← Back to Orders
            </Text>
          </TouchableOpacity>

          <OrderDetailsCard
            orderNumber={selectedOrder.orderNumber}
            customerName={selectedOrder.customerName}
            orderDate={selectedOrder.orderDate}
            status={selectedOrder.status}
            productDetails={selectedOrder.productDetails}
          />

          <View className="mt-6">
            <Text className="text-lg font-bold mb-4">Order Progress</Text>
            <OrderTrackingView currentStatus={selectedOrder.status} />
          </View>

          {selectedOrder.status === "Awaiting Approval" && (
            <View className="mt-6">
              <Text className="text-lg font-bold mb-4">Design Preview</Text>
              <View className="bg-gray-100 rounded-lg p-4 items-center justify-center h-40">
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1606048607130-e3c31249f9e9?w=400&q=80",
                  }}
                  className="w-full h-full rounded-lg"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity className="bg-red-500 py-3 px-6 rounded-lg">
                  <Text className="text-white font-semibold">
                    Request Changes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="bg-green-500 py-3 px-6 rounded-lg">
                  <Text className="text-white font-semibold">
                    Approve Design
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ) : (
        // Orders List View
        <ScrollView className="flex-1 px-4">
          <Text className="text-xl font-bold mb-4">Your Orders</Text>

          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
                onPress={() => setSelectedOrder(order)}
              >
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-lg font-semibold">
                      {order.orderNumber}
                    </Text>
                    <Text className="text-gray-500 mt-1">
                      {order.productDetails}
                    </Text>
                  </View>
                  <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800 text-sm font-medium">
                      {order.status}
                    </Text>
                  </View>
                </View>
                <View className="mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-gray-500">
                    Order Date: {order.orderDate}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <Text className="text-blue-500 font-semibold">
                      View Details
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-10">
              <Text className="text-gray-500 text-lg">No orders found</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
