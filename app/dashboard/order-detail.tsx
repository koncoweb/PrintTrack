import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, AlertTriangle, ChevronDown } from "lucide-react-native";
import {
  Order,
  getOrderById,
  updateOrder,
  OrderStatus,
} from "../services/orderService";
import DesignLinkEditForm from "../components/DesignLinkEditForm";
import { useAuth } from "../utils/auth";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { user, userRole } = useAuth();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const orderData = await getOrderById(id);
      if (orderData) {
        setOrder(orderData);
      } else {
        setError("Pesanan tidak ditemukan");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError("Gagal memuat detail pesanan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchOrderDetails(orderId as string);
    Alert.alert("Sukses", "Link desain berhasil diperbarui");
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order || !order.id) return;

    setIsUpdatingStatus(true);
    try {
      await updateOrder(order.id, { status: newStatus }, userRole);
      fetchOrderDetails(order.id);
      Alert.alert("Sukses", "Status pesanan berhasil diperbarui");
    } catch (err) {
      console.error("Error updating order status:", err);
      Alert.alert("Error", "Gagal memperbarui status pesanan");
    } finally {
      setIsUpdatingStatus(false);
      setShowStatusDropdown(false);
    }
  };

  // Get available next statuses for operator
  const getAvailableNextStatuses = (): { id: OrderStatus; label: string }[] => {
    if (!order || userRole !== "operator") return [];

    // Operators can only update from ready_to_print through finishing_2 to completed
    const operatorStatuses: { id: OrderStatus; label: string }[] = [];

    // Only show status options that are next in the workflow
    switch (order.status) {
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

  const formatStatusLabel = (status: string): string => {
    switch (status) {
      case "design_in_progress":
        return "Siap Desain";
      case "design_approved":
        return "Desain Disetujui";
      case "order_received":
        return "Pesanan Diterima";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "design_in_progress":
        return "bg-purple-500";
      case "design_approved":
        return "bg-yellow-500";
      case "order_received":
        return "bg-blue-500";
      case "ready_to_print":
        return "bg-green-500";
      case "printing":
        return "bg-orange-500";
      case "finishing_1":
      case "finishing_2":
        return "bg-indigo-500";
      case "completed":
        return "bg-teal-500";
      case "delivered":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Memuat detail pesanan...</Text>
      </View>
    );
  }

  // Render error state
  if (error || !order) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <AlertTriangle size={48} color="#ef4444" />
        <Text className="mt-2 text-red-500 font-medium">
          {error || "Pesanan tidak ditemukan"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-medium">Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Stack.Screen options={{ title: "Detail Pesanan" }} />

      {/* Header */}
      <View className="bg-blue-500 p-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Detail Pesanan</Text>
            <Text className="text-white opacity-80 mt-1">
              {order.orderNumber}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Order Status Update for Operators */}
        {userRole === "operator" && order && (
          <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
            <Text className="font-bold text-lg mb-2">
              Update Status Pesanan
            </Text>
            <Text className="text-gray-700 mb-2">
              Status saat ini:{" "}
              <Text className="font-medium">
                {formatStatusLabel(order.status)}
              </Text>
            </Text>

            {getAvailableNextStatuses().length > 0 ? (
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="flex-row items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-200"
                  disabled={isUpdatingStatus}
                >
                  <Text className="text-blue-700">Pilih Status Berikutnya</Text>
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
                  {order.status === "completed"
                    ? "Pesanan sudah selesai"
                    : "Tidak ada status berikutnya yang tersedia"}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Order Details Card */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-lg">{order.orderNumber}</Text>
            <View
              className={`px-2 py-1 rounded-full ${getStatusColor(order.status)}`}
            >
              <Text className="text-xs text-white font-medium">
                {formatStatusLabel(order.status)}
              </Text>
            </View>
          </View>

          <View className="border-b border-gray-200 pb-3 mb-3">
            <Text className="text-gray-700 font-medium">Pelanggan:</Text>
            <Text className="text-gray-800">{order.customerName}</Text>
          </View>

          <View className="border-b border-gray-200 pb-3 mb-3">
            <Text className="text-gray-700 font-medium">Tanggal Pesanan:</Text>
            <Text className="text-gray-800">{order.orderDate}</Text>
          </View>

          <View className="border-b border-gray-200 pb-3 mb-3">
            <Text className="text-gray-700 font-medium">Detail Produk:</Text>
            <Text className="text-gray-800">{order.productDetails}</Text>
          </View>

          {order.estimatedCompletion && (
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-gray-700 font-medium">
                Estimasi Selesai:
              </Text>
              <Text className="text-gray-800">{order.estimatedCompletion}</Text>
            </View>
          )}

          {order.orderType && (
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-gray-700 font-medium">Jenis Pesanan:</Text>
              <Text className="text-gray-800">{order.orderType}</Text>
            </View>
          )}

          {order.size && (
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-gray-700 font-medium">Ukuran:</Text>
              <Text className="text-gray-800">{order.size}</Text>
            </View>
          )}

          {order.quantity && (
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-gray-700 font-medium">Jumlah:</Text>
              <Text className="text-gray-800">{order.quantity}</Text>
            </View>
          )}

          {order.material && (
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-gray-700 font-medium">Material:</Text>
              <Text className="text-gray-800">{order.material}</Text>
            </View>
          )}

          {order.finishing && (
            <View className="border-b border-gray-200 pb-3 mb-3">
              <Text className="text-gray-700 font-medium">Finishing:</Text>
              <Text className="text-gray-800">{order.finishing}</Text>
            </View>
          )}

          <View className="pb-3 mb-3">
            <Text className="text-gray-700 font-medium">Link Desain:</Text>
            <Text className="text-blue-600">
              {order.designLink || "Belum ada"}
            </Text>
          </View>
        </View>

        {/* Design Link Edit Form */}
        <View className="mb-4">
          <Text className="text-lg font-bold mb-2">Edit Link Desain</Text>
          {order.status === "design_approved" ? (
            <View className="bg-yellow-50 p-4 rounded-lg mb-4">
              <Text className="text-yellow-800 font-medium">
                Desain sudah disetujui. Link desain tidak dapat diubah lagi.
              </Text>
            </View>
          ) : null}
          <DesignLinkEditForm
            order={order}
            onSuccess={handleEditSuccess}
            disabled={order.status === "design_approved"}
          />
        </View>
      </ScrollView>
    </View>
  );
}
