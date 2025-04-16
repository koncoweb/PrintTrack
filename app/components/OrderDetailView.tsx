import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Edit,
  Truck,
} from "lucide-react-native";

interface OrderDetailViewProps {
  order?: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    orderDate: string;
    currentStatus: string;
    product: string;
    quantity: number;
    size: string;
    material: string;
    designPreviewUrl?: string;
    notes?: string;
    estimatedCompletion?: string;
  };
  userRole?: "customer" | "admin" | "designer" | "operator";
  onApproveDesign?: () => void;
  onRequestChanges?: () => void;
  onUpdateStatus?: () => void;
}

const OrderDetailView = ({
  order = {
    id: "ord123",
    orderNumber: "ORD-2023-001",
    customerName: "John Doe",
    customerPhone: "+62 812-3456-7890",
    orderDate: "2023-05-15",
    currentStatus: "Design in Progress",
    product: "Business Cards",
    quantity: 100,
    size: "90x55mm",
    material: "Art Carton 260gsm",
    designPreviewUrl:
      "https://images.unsplash.com/photo-1606676539940-12768ce0e762?w=600&q=80",
    notes: "Please make sure the colors match our brand guidelines",
    estimatedCompletion: "2023-05-20",
  },
  userRole = "customer",
  onApproveDesign = () => console.log("Design approved"),
  onRequestChanges = () => console.log("Changes requested"),
  onUpdateStatus = () => console.log("Update status clicked"),
}: OrderDetailViewProps) => {
  const [isImageLoading, setIsImageLoading] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View className="bg-white rounded-lg shadow-md p-4 w-full">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Order Number and Status */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-bold text-gray-800">
              {order.orderNumber}
            </Text>
            <Text className="text-sm text-gray-500">
              Ordered on {formatDate(order.orderDate)}
            </Text>
          </View>
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-800 font-medium">
              {order.currentStatus}
            </Text>
          </View>
        </View>

        {/* Customer Information */}
        <View className="mb-4 bg-gray-50 p-3 rounded-md">
          <Text className="text-md font-semibold text-gray-700 mb-2">
            Customer Information
          </Text>
          <Text className="text-gray-700">{order.customerName}</Text>
          <Text className="text-gray-700">{order.customerPhone}</Text>
        </View>

        {/* Order Details */}
        <View className="mb-4">
          <Text className="text-md font-semibold text-gray-700 mb-2">
            Order Details
          </Text>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Product:</Text>
            <Text className="text-gray-800 font-medium">{order.product}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Quantity:</Text>
            <Text className="text-gray-800 font-medium">
              {order.quantity} pcs
            </Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Size:</Text>
            <Text className="text-gray-800 font-medium">{order.size}</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">Material:</Text>
            <Text className="text-gray-800 font-medium">{order.material}</Text>
          </View>
          {order.estimatedCompletion && (
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">Est. Completion:</Text>
              <View className="flex-row items-center">
                <Clock size={16} className="text-blue-500 mr-1" />
                <Text className="text-blue-500 font-medium">
                  {formatDate(order.estimatedCompletion)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Design Preview */}
        {order.designPreviewUrl && (
          <View className="mb-4">
            <Text className="text-md font-semibold text-gray-700 mb-2">
              Design Preview
            </Text>
            <View className="relative">
              {isImageLoading && (
                <View className="absolute inset-0 flex items-center justify-center z-10">
                  <ActivityIndicator size="large" color="#4F46E5" />
                </View>
              )}
              <Image
                source={{ uri: order.designPreviewUrl }}
                className="w-full h-48 rounded-md"
                resizeMode="contain"
                onLoadStart={() => setIsImageLoading(true)}
                onLoadEnd={() => setIsImageLoading(false)}
              />
              <TouchableOpacity
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md"
                onPress={() => console.log("Download design")}
              >
                <Download size={20} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes */}
        {order.notes && (
          <View className="mb-4 bg-yellow-50 p-3 rounded-md">
            <Text className="text-md font-semibold text-gray-700 mb-1">
              Notes
            </Text>
            <Text className="text-gray-700">{order.notes}</Text>
          </View>
        )}

        {/* Action Buttons based on user role */}
        <View className="mt-4">
          {userRole === "customer" &&
            order.currentStatus === "Design Approval Pending" && (
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-green-500 py-2 px-4 rounded-md flex-1 mr-2 flex-row justify-center items-center"
                  onPress={onApproveDesign}
                >
                  <CheckCircle size={18} color="white" className="mr-1" />
                  <Text className="text-white font-medium">Approve Design</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="bg-orange-500 py-2 px-4 rounded-md flex-1 ml-2 flex-row justify-center items-center"
                  onPress={onRequestChanges}
                >
                  <Edit size={18} color="white" className="mr-1" />
                  <Text className="text-white font-medium">
                    Request Changes
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {(userRole === "admin" ||
            userRole === "designer" ||
            userRole === "operator") && (
            <TouchableOpacity
              className="bg-indigo-600 py-3 px-4 rounded-md flex-row justify-center items-center"
              onPress={onUpdateStatus}
            >
              <Edit size={18} color="white" className="mr-2" />
              <Text className="text-white font-medium">Update Status</Text>
            </TouchableOpacity>
          )}

          {userRole === "operator" &&
            order.currentStatus === "Ready for Delivery/Pickup" && (
              <TouchableOpacity
                className="bg-green-600 py-3 px-4 rounded-md flex-row justify-center items-center mt-2"
                onPress={() => console.log("Mark as handed over")}
              >
                <Truck size={18} color="white" className="mr-2" />
                <Text className="text-white font-medium">
                  Mark as Handed Over
                </Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderDetailView;
