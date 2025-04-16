import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Clock,
  Package,
  User,
  Calendar,
  Tag,
  ChevronRight,
} from "lucide-react-native";

interface OrderDetailsCardProps {
  orderNumber?: string;
  customerName?: string;
  orderDate?: string;
  status?: string;
  productDetails?: string;
  estimatedCompletion?: string;
  onPress?: () => void;
}

const OrderDetailsCard = ({
  orderNumber = "ORD-2023-001",
  customerName = "John Doe",
  orderDate = "15 May 2023",
  status = "Siap Desain",
  productDetails = "Kartu Nama (250 pcs), Full Color, Dua Sisi",
  estimatedCompletion = "18 May 2023",
  onPress = () => {},
}: OrderDetailsCardProps) => {
  // Map status to color
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      "Pesanan Diterima": "bg-blue-500",
      "Siap Desain": "bg-purple-500",
      "Desain Disetujui": "bg-yellow-500",
      "Siap Cetak": "bg-orange-500",
      "Proses Cetak": "bg-indigo-500",
      "Finishing 1": "bg-pink-500",
      "Finishing 2": "bg-pink-700",
      Selesai: "bg-green-500",
      Diambil: "bg-green-700",
    };

    return statusMap[status] || "bg-gray-500";
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl p-4 shadow-md mb-4 border border-gray-100 w-full"
    >
      {/* Order Number and Status */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <Package size={18} color="#4B5563" />
          <Text className="ml-2 font-bold text-gray-800">{orderNumber}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(status)}`}>
          <Text className="text-white text-xs font-medium">{status}</Text>
        </View>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-gray-100 my-2" />

      {/* Customer Info */}
      <View className="flex-row items-center mb-2">
        <User size={16} color="#6B7280" />
        <Text className="ml-2 text-gray-700">{customerName}</Text>
      </View>

      {/* Order Date */}
      <View className="flex-row items-center mb-2">
        <Calendar size={16} color="#6B7280" />
        <Text className="ml-2 text-gray-700">{orderDate}</Text>
      </View>

      {/* Product Details */}
      <View className="flex-row items-start mb-2">
        <Tag size={16} color="#6B7280" className="mt-1" />
        <Text className="ml-2 text-gray-700 flex-1">{productDetails}</Text>
      </View>

      {/* Estimated Completion */}
      <View className="flex-row items-center justify-between mt-2">
        <View className="flex-row items-center">
          <Clock size={16} color="#6B7280" />
          <Text className="ml-2 text-gray-700">
            Perkiraan selesai: {estimatedCompletion}
          </Text>
        </View>
        <ChevronRight size={18} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
};

export default OrderDetailsCard;
