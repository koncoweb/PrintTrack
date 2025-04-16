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
import { Search, Plus, Filter, AlertTriangle } from "lucide-react-native";
import OrderDetailsCard from "./OrderDetailsCard";
import OrderTrackingView from "./OrderTrackingView";
import OrderForm from "./OrderForm";
import {
  Order,
  OrderStatus,
  getOrders,
  getOrdersByStatus,
  createOrder,
  updateOrder,
  deleteOrder,
} from "../services/orderService";

interface OrderManagementProps {}

const OrderManagement: React.FC<OrderManagementProps> = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<Order | undefined>(undefined);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders when search query or status filter changes
  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, statusFilter]);

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

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(result);
  };

  const handleOrderPress = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCreateNewOrder = () => {
    setOrderToEdit(undefined);
    setShowForm(true);
  };

  const handleEditOrder = (order: Order) => {
    setOrderToEdit(order);
    setShowForm(true);
  };

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert(
      "Konfirmasi Hapus",
      "Apakah Anda yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            setIsSubmitting(true);
            try {
              await deleteOrder(orderId);
              // Remove from local state
              setOrders((prev) => prev.filter((order) => order.id !== orderId));
              if (selectedOrder?.id === orderId) {
                setSelectedOrder(null);
              }
              Alert.alert("Berhasil", "Pesanan berhasil dihapus");
            } catch (err) {
              console.error("Error deleting order:", err);
              Alert.alert(
                "Error",
                "Gagal menghapus pesanan. Silakan coba lagi.",
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const handleFormSubmit = async (orderData: Omit<Order, "id">) => {
    setIsSubmitting(true);
    try {
      if (orderToEdit?.id) {
        // Update existing order
        await updateOrder(orderToEdit.id, orderData);
        // Update in local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderToEdit.id
              ? { ...orderData, id: orderToEdit.id }
              : order,
          ),
        );
        if (selectedOrder?.id === orderToEdit.id) {
          setSelectedOrder({ ...orderData, id: orderToEdit.id });
        }
        Alert.alert("Berhasil", "Pesanan berhasil diperbarui");
      } else {
        // Create new order
        const newOrderId = await createOrder(orderData);
        const newOrder = { ...orderData, id: newOrderId };
        // Add to local state
        setOrders((prev) => [newOrder, ...prev]);
        Alert.alert("Berhasil", "Pesanan berhasil dibuat");
      }
      setShowForm(false);
    } catch (err) {
      console.error("Error saving order:", err);
      Alert.alert("Error", "Gagal menyimpan pesanan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const formatStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case "order_received":
        return "Pesanan Diterima";
      case "design_in_progress":
        return "Siap Desain";
      case "design_approved":
        return "Desain Disetujui";
      case "ready_to_print":
        return "Siap Cetak";
      case "printing":
        return "Proses Cetak";
      case "finishing_1":
        return "Finishing 1";
      case "finishing_2":
        return "Finishing 2";
      case "completed":
        return "Selesai";
      case "delivered":
        return "Diambil";
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "order_received":
        return "bg-blue-500";
      case "design_in_progress":
        return "bg-purple-500";
      case "design_approved":
        return "bg-yellow-500";
      case "ready_to_print":
        return "bg-orange-500";
      case "printing":
        return "bg-indigo-500";
      case "finishing_1":
        return "bg-pink-500";
      case "finishing_2":
        return "bg-pink-700";
      case "completed":
        return "bg-green-500";
      case "delivered":
        return "bg-green-700";
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

  // Render form
  if (showForm) {
    return (
      <OrderForm
        order={orderToEdit}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        isSubmitting={isSubmitting}
      />
    );
  }

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

          <View className="mt-6">
            <Text className="text-lg font-bold mb-4">Progres Pesanan</Text>
            <OrderTrackingView currentStatus={selectedOrder.status} />
          </View>

          {/* Status Update Section */}
          <View className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Text className="text-lg font-bold mb-3 text-blue-800">
              Perbarui Status Pesanan
            </Text>
            <Text className="text-gray-600 mb-3">
              Status saat ini:{" "}
              <Text className="font-bold text-blue-700">
                {formatStatusLabel(selectedOrder.status)}
              </Text>
            </Text>

            <Text className="text-gray-700 mb-2">Pilih status baru:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
            >
              <View className="flex-row">
                {[
                  "order_received",
                  "design_in_progress",
                  "design_approved",
                  "ready_to_print",
                  "printing",
                  "finishing_1",
                  "finishing_2",
                  "completed",
                  "delivered",
                ].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={async () => {
                      if (selectedOrder.id && status !== selectedOrder.status) {
                        setIsSubmitting(true);
                        try {
                          await updateOrder(selectedOrder.id, {
                            status: status as OrderStatus,
                          });
                          setSelectedOrder({
                            ...selectedOrder,
                            status: status as OrderStatus,
                          });
                          setOrders((prev) =>
                            prev.map((order) =>
                              order.id === selectedOrder.id
                                ? { ...order, status: status as OrderStatus }
                                : order,
                            ),
                          );
                          Alert.alert(
                            "Berhasil",
                            `Status pesanan diperbarui menjadi ${formatStatusLabel(status as OrderStatus)}`,
                          );
                        } catch (err) {
                          console.error("Error updating order status:", err);
                          Alert.alert(
                            "Error",
                            "Gagal memperbarui status pesanan. Silakan coba lagi.",
                          );
                        } finally {
                          setIsSubmitting(false);
                        }
                      }
                    }}
                    className={`mr-2 px-3 py-2 rounded-lg ${selectedOrder.status === status ? "bg-blue-500" : status === "order_received" ? "bg-blue-200" : status === "design_in_progress" ? "bg-purple-200" : status === "design_approved" ? "bg-yellow-200" : status === "ready_to_print" ? "bg-orange-200" : status === "printing" ? "bg-indigo-200" : status === "finishing_1" || status === "finishing_2" ? "bg-pink-200" : status === "completed" ? "bg-green-200" : status === "delivered" ? "bg-green-300" : "bg-gray-200"}`}
                    disabled={isSubmitting}
                  >
                    <Text
                      className={`${selectedOrder.status === status ? "text-white font-bold" : "text-gray-700"}`}
                    >
                      {formatStatusLabel(status as OrderStatus)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="mt-6 flex-row justify-between mb-6">
            <TouchableOpacity
              onPress={() => handleEditOrder(selectedOrder)}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Edit Pesanan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                selectedOrder.id && handleDeleteOrder(selectedOrder.id)
              }
              className="bg-red-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Hapus Pesanan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Render orders list
  return (
    <View className="flex-1">
      {/* Search and Filter */}
      <View className="mb-4">
        <View className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg">
          <Search size={18} color="#6b7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Cari pesanan..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 flex-row"
        >
          <TouchableOpacity
            onPress={() => setStatusFilter("all")}
            className={`mr-2 px-3 py-1 rounded-full ${statusFilter === "all" ? "bg-blue-500" : "bg-gray-200"}`}
          >
            <Text
              className={
                statusFilter === "all" ? "text-white" : "text-gray-700"
              }
            >
              Semua
            </Text>
          </TouchableOpacity>
          {[
            "order_received",
            "design_in_progress",
            "design_approved",
            "ready_to_print",
            "printing",
            "finishing_1",
            "finishing_2",
            "completed",
            "delivered",
          ].map((status) => (
            <TouchableOpacity
              key={status}
              onPress={() => setStatusFilter(status as OrderStatus)}
              className={`mr-2 px-3 py-1 rounded-full ${statusFilter === status ? "bg-blue-500" : "bg-gray-200"}`}
            >
              <Text
                className={
                  statusFilter === status ? "text-white" : "text-gray-700"
                }
              >
                {formatStatusLabel(status as OrderStatus)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      {isLoading && orders.length > 0 && (
        <View className="py-2">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      )}

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id || item.orderNumber}
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
              {searchQuery || statusFilter !== "all"
                ? "Tidak ada pesanan yang sesuai dengan filter"
                : "Tidak ada pesanan ditemukan"}
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreateNewOrder}
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default OrderManagement;
