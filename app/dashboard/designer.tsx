import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Modal,
} from "react-native";
import { Search, AlertTriangle, X } from "lucide-react-native";
import {
  Order,
  OrderStatus,
  getOrders,
  updateOrder,
} from "../services/orderService";
import { Stack, useRouter } from "expo-router";
import DesignLinkEditForm from "../components/DesignLinkEditForm";

export default function DesignerDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders when search query changes
  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getOrders();
      // Get all orders - filtering will be done in filterOrders()
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Gagal memuat pesanan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    // First filter by status: only show 'design_in_progress' and 'design_approved'
    let result = orders.filter(
      (order) =>
        order.status === "design_in_progress" ||
        order.status === "design_approved",
    );

    // Then apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.productDetails.toLowerCase().includes(query),
      );
    }

    setFilteredOrders(result);
  };

  const handleOrderPress = (order: Order) => {
    if (order.id) {
      router.push(`/dashboard/order-detail?orderId=${order.id}`);
    } else {
      Alert.alert("Error", "ID pesanan tidak valid");
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    fetchOrders(); // Refresh the orders list
    Alert.alert("Sukses", "Link desain berhasil diperbarui");
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  const formatStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case "design_in_progress":
        return "Siap Desain";
      case "design_approved":
        return "Desain Disetujui";
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "design_in_progress":
        return "bg-purple-500";
      case "design_approved":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  // Render loading state
  if (isLoading && orders.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Memuat pesanan...</Text>
      </View>
    );
  }

  // Render error state
  if (error && orders.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <AlertTriangle size={48} color="#ef4444" />
        <Text className="mt-2 text-red-500 font-medium">{error}</Text>
        <TouchableOpacity
          onPress={fetchOrders}
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render orders list
  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: "Dashboard Designer" }} />

      {/* Header */}
      <View className="bg-blue-500 p-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-xl font-bold">
              Dashboard Designer
            </Text>
            <Text className="text-white opacity-80 mt-1">
              Kelola desain untuk pesanan yang siap didesain
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              // Sign out logic
              import("../utils/auth").then(({ logoutUser }) => {
                logoutUser()
                  .then(() => {
                    router.replace("/");
                  })
                  .catch((error) => {
                    console.error("Logout error:", error);
                    Alert.alert("Error", "Failed to logout. Please try again.");
                  });
              });
            }}
            className="bg-red-500 px-3 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View className="p-4">
        <View className="flex-row items-center bg-white px-3 py-2 rounded-lg shadow-sm">
          <Search size={18} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Cari pesanan..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Orders List */}
      {isLoading && orders.length > 0 && (
        <View className="py-2 items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id || item.orderNumber}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleOrderPress(item)}
            className="bg-white p-4 rounded-lg mb-3 shadow-sm"
          >
            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-lg">{item.orderNumber}</Text>
              <View
                className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}
              >
                <Text className="text-xs text-white font-medium">
                  {formatStatusLabel(item.status)}
                </Text>
              </View>
            </View>
            <Text className="text-gray-700 mt-1">{item.customerName}</Text>
            <Text className="text-gray-500 text-sm mt-1">{item.orderDate}</Text>
            <Text className="text-gray-600 mt-2">{item.productDetails}</Text>
            <View className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-blue-600 font-medium">
                Link Desain: {item.designLink || "Belum ada"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleOrderPress(item)}
              className="mt-3 bg-blue-500 py-2 px-4 rounded-lg self-end"
            >
              <Text className="text-white font-medium">Lihat Detail</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">
              {searchQuery
                ? "Tidak ada pesanan yang sesuai dengan pencarian"
                : "Tidak ada pesanan yang perlu didesain saat ini"}
            </Text>
          </View>
        }
      />

      {/* Design Link Edit Modal */}
      <Modal
        visible={showEditForm && selectedOrder !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={handleEditCancel}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-[90%] max-w-md bg-white rounded-xl overflow-hidden">
            <View className="flex-row justify-between items-center bg-blue-500 p-4">
              <Text className="text-white font-bold text-lg">
                Edit Link Desain
              </Text>
              <TouchableOpacity onPress={handleEditCancel}>
                <X size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <View className="p-4">
              {selectedOrder && (
                <DesignLinkEditForm
                  order={selectedOrder}
                  onSuccess={handleEditSuccess}
                  onCancel={handleEditCancel}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
