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
} from "react-native";
import {
  Search,
  LogOut,
  AlertTriangle,
  ChevronDown,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  Order,
  getOrders,
  updateOrder,
  OrderStatus,
} from "../services/orderService";
import { logoutUser, getUserRole } from "../utils/auth";
import OrderDetailsCard from "../components/OrderDetailsCard";
import OrderTrackingView from "../components/OrderTrackingView";

export default function OperatorDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch orders and user role on component mount
  useEffect(() => {
    fetchOrders();
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const role = await getUserRole();
      setUserRole(role);
    } catch (err) {
      console.error("Error fetching user role:", err);
    }
  };

  // Filter orders when search query changes
  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Gagal memuat pesanan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let result = [...orders];

    // Filter orders by operator-relevant statuses
    result = result.filter(
      (order) =>
        order.status === "ready_to_print" ||
        order.status === "printing" ||
        order.status === "finishing_1" ||
        order.status === "finishing_2",
    );

    // Apply search filter
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
    setSelectedOrder(order);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace("/");
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert("Error", "Gagal keluar. Silakan coba lagi.");
    }
  };

  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case "ready_to_print":
        return "Siap Cetak";
      case "printing":
        return "Proses Cetak";
      case "finishing_1":
        return "Finishing 1";
      case "finishing_2":
        return "Finishing 2";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready_to_print":
        return "bg-orange-500";
      case "printing":
        return "bg-indigo-500";
      case "finishing_1":
        return "bg-pink-500";
      case "finishing_2":
        return "bg-pink-700";
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

  // Get available next statuses for operator
  const getAvailableNextStatuses = (): { id: OrderStatus; label: string }[] => {
    if (!selectedOrder || userRole !== "operator") return [];

    // Operators can only update from ready_to_print through finishing_2 to completed
    const operatorStatuses: { id: OrderStatus; label: string }[] = [];

    // Only show status options that are next in the workflow
    switch (selectedOrder.status) {
      case "ready_to_print":
        operatorStatuses.push({ id: "printing", label: "Proses Cetak" });
        break;
      case "printing":
        operatorStatuses.push({ id: "finishing_1", label: "Finishing 1" });
        break;
      case "finishing_1":
        operatorStatuses.push({ id: "finishing_2", label: "Finishing 2" });
        break;
      case "finishing_2":
        operatorStatuses.push({ id: "completed", label: "Selesai" });
        break;
    }

    return operatorStatuses;
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!selectedOrder || !selectedOrder.id) return;

    setIsUpdatingStatus(true);
    try {
      await updateOrder(selectedOrder.id, { status: newStatus }, userRole);
      // Refresh the order data
      const updatedOrder = { ...selectedOrder, status: newStatus };
      setSelectedOrder(updatedOrder);

      // Update the order in the orders list
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? updatedOrder : order,
      );
      setOrders(updatedOrders);

      Alert.alert("Sukses", "Status pesanan berhasil diperbarui");
    } catch (err) {
      console.error("Error updating order status:", err);
      Alert.alert("Error", "Gagal memperbarui status pesanan");
    } finally {
      setIsUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  // Render order details
  if (selectedOrder) {
    return (
      <ScrollView className="flex-1">
        <View className="p-4 bg-white rounded-lg shadow-sm">
          <TouchableOpacity
            onPress={() => setSelectedOrder(null)}
            className="mb-4"
          >
            <Text className="text-blue-500">← Kembali ke daftar pesanan</Text>
          </TouchableOpacity>

          <OrderDetailsCard
            orderNumber={selectedOrder.orderNumber}
            customerName={selectedOrder.customerName}
            orderDate={selectedOrder.orderDate}
            status={formatStatusLabel(selectedOrder.status) as any}
            productDetails={selectedOrder.productDetails}
            estimatedCompletion={selectedOrder.estimatedCompletion}
          />

          {/* Order Status Update for Operators */}
          {userRole === "operator" && (
            <View className="bg-white p-4 rounded-lg shadow-sm my-4">
              <Text className="font-bold text-lg mb-2">
                Update Status Pesanan
              </Text>
              <Text className="text-gray-700 mb-2">
                Status saat ini:{" "}
                <Text className="font-medium">
                  {formatStatusLabel(selectedOrder.status)}
                </Text>
              </Text>

              {getAvailableNextStatuses().length > 0 ? (
                <View className="relative">
                  <TouchableOpacity
                    onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="flex-row items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-200"
                    disabled={isUpdatingStatus}
                  >
                    <Text className="text-blue-700">
                      Pilih Status Berikutnya
                    </Text>
                    <ChevronDown size={20} color="#1d4ed8" />
                  </TouchableOpacity>

                  {showStatusDropdown && (
                    <View className="absolute top-12 left-0 right-0 bg-white rounded-md border border-gray-200 shadow-md z-10">
                      {getAvailableNextStatuses().map((status) => (
                        <TouchableOpacity
                          key={status.id}
                          onPress={() => handleStatusUpdate(status.id)}
                          className="p-3 border-b border-gray-100"
                        >
                          <Text>{status.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {isUpdatingStatus && (
                    <View className="absolute inset-0 bg-white bg-opacity-70 items-center justify-center rounded-md">
                      <ActivityIndicator size="small" color="#3b82f6" />
                    </View>
                  )}
                </View>
              ) : (
                <View className="bg-gray-50 p-3 rounded-md">
                  <Text className="text-gray-500 text-center">
                    {selectedOrder.status === "completed"
                      ? "Pesanan sudah selesai"
                      : "Tidak ada status berikutnya yang tersedia"}
                  </Text>
                </View>
              )}
            </View>
          )}

          <View className="mt-6">
            <Text className="text-lg font-bold mb-4">Progres Pesanan</Text>
            <OrderTrackingView currentStatus={selectedOrder.status} />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View className="flex-1">
      {/* Header with title and logout button */}
      <View className="flex-row justify-between items-center p-4 bg-white border-b border-gray-200">
        <Text className="text-xl font-bold">Dashboard Operator</Text>
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center bg-red-500 px-3 py-2 rounded-lg"
        >
          <LogOut size={18} color="white" />
          <Text className="text-white ml-1 font-medium">Keluar</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="p-4">
        <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg">
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
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">
              {searchQuery
                ? "Tidak ada pesanan yang sesuai dengan pencarian"
                : "Tidak ada pesanan dalam proses produksi saat ini"}
            </Text>
          </View>
        }
      />
    </View>
  );
}
