import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { X, Calendar } from "lucide-react-native";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Order,
  OrderStatus,
  generateOrderNumber,
  formatDate,
} from "../services/orderService";

interface OrderFormProps {
  order?: Order;
  onSubmit: (orderData: Omit<Order, "id">) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  order,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const isEditMode = !!order?.id;

  const [useCustomOrderNumber, setUseCustomOrderNumber] = useState(false);
  const [formData, setFormData] = useState<Omit<Order, "id">>(() => {
    if (order) {
      return { ...order };
    } else {
      // Default values for new order
      const today = new Date();
      return {
        orderNumber: generateOrderNumber(),
        customerName: "",
        orderDate: formatDate(today),
        status: "order_received" as OrderStatus,
        productDetails: "",
        estimatedCompletion: formatDate(
          new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        ), // 7 days from now
        orderType: "",
        size: "",
        quantity: 1,
        material: "",
        finishing: "",
        designLink: "",
      };
    }
  });

  // Date picker states
  const [showOrderDatePicker, setShowOrderDatePicker] = useState(false);
  const [showEstCompletionPicker, setShowEstCompletionPicker] = useState(false);
  const [orderDateObj, setOrderDateObj] = useState<Date>(() => {
    if (order?.orderDate) {
      return new Date(order.orderDate);
    }
    return new Date();
  });
  const [estCompletionDateObj, setEstCompletionDateObj] = useState<Date>(() => {
    if (order?.estimatedCompletion) {
      return new Date(order.estimatedCompletion);
    }
    const date = new Date();
    date.setDate(date.getDate() + 7); // 7 days from now
    return date;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderNumber.trim()) {
      newErrors.orderNumber = "Nomor pesanan wajib diisi";
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Nama pelanggan wajib diisi";
    }

    if (!formData.orderDate.trim()) {
      newErrors.orderDate = "Tanggal pesanan wajib diisi";
    }

    if (!formData.productDetails.trim()) {
      newErrors.productDetails = "Detail produk wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        Alert.alert("Error", "Gagal menyimpan pesanan. Silakan coba lagi.");
        console.error("Error submitting form:", error);
      }
    }
  };

  const handleChange = (field: keyof Omit<Order, "id">, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "quantity" ? parseInt(value) || 0 : value,
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Handle toggling date pickers
  const toggleOrderDatePicker = () => {
    setShowOrderDatePicker(!showOrderDatePicker);
    if (showEstCompletionPicker) setShowEstCompletionPicker(false);
  };

  const toggleEstCompletionPicker = () => {
    setShowEstCompletionPicker(!showEstCompletionPicker);
    if (showOrderDatePicker) setShowOrderDatePicker(false);
  };

  const statusOptions: OrderStatus[] = [
    "order_received",
    "design_in_progress",
    "design_approved",
    "ready_to_print",
    "printing",
    "finishing_1",
    "finishing_2",
    "completed",
    "delivered",
  ];

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

  return (
    <View className="bg-white rounded-xl p-4 shadow-lg w-full">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">
          {isEditMode ? "Edit Pesanan" : "Buat Pesanan Baru"}
        </Text>
        <TouchableOpacity onPress={onCancel} className="p-2">
          <X size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView className="max-h-[500px]">
        <View className="space-y-4">
          {/* Order Number */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">
              Nomor Pesanan
            </Text>
            {!isEditMode && (
              <View className="flex-row items-center mb-2">
                <TouchableOpacity
                  onPress={() => {
                    setUseCustomOrderNumber(false);
                    handleChange("orderNumber", generateOrderNumber());
                  }}
                  className={`mr-2 px-3 py-1 rounded-full ${!useCustomOrderNumber ? "bg-blue-500" : "bg-gray-200"}`}
                >
                  <Text
                    className={
                      !useCustomOrderNumber ? "text-white" : "text-gray-700"
                    }
                  >
                    Otomatis
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setUseCustomOrderNumber(true);
                    handleChange("orderNumber", "");
                  }}
                  className={`mr-2 px-3 py-1 rounded-full ${useCustomOrderNumber ? "bg-blue-500" : "bg-gray-200"}`}
                >
                  <Text
                    className={
                      useCustomOrderNumber ? "text-white" : "text-gray-700"
                    }
                  >
                    Custom
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TextInput
              className={`border ${errors.orderNumber ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 text-gray-800`}
              value={formData.orderNumber}
              onChangeText={(text) => handleChange("orderNumber", text)}
              placeholder={
                useCustomOrderNumber
                  ? "Masukkan nomor pesanan custom"
                  : "Nomor Pesanan"
              }
              editable={!isEditMode || useCustomOrderNumber} // Editable for new orders with custom option or in edit mode
            />
            {errors.orderNumber ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.orderNumber}
              </Text>
            ) : null}
          </View>

          {/* Customer Name */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">
              Nama Pelanggan
            </Text>
            <TextInput
              className={`border ${errors.customerName ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 text-gray-800`}
              value={formData.customerName}
              onChangeText={(text) => handleChange("customerName", text)}
              placeholder="Nama Pelanggan"
            />
            {errors.customerName ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.customerName}
              </Text>
            ) : null}
          </View>

          {/* Order Date */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">
              Tanggal Pesanan
            </Text>
            <TouchableOpacity
              onPress={toggleOrderDatePicker}
              className={`border ${errors.orderDate ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 flex-row items-center justify-between`}
            >
              <Text className="text-gray-800">{formData.orderDate}</Text>
              <Calendar size={20} color="#6B7280" />
            </TouchableOpacity>
            <DatePicker
              selected={orderDateObj}
              onChange={(date: Date) => {
                setOrderDateObj(date);
                const formattedDate = formatDate(date);
                handleChange("orderDate", formattedDate);
              }}
              className="absolute opacity-0"
              customInput={<></>}
              open={showOrderDatePicker}
              onClickOutside={() => setShowOrderDatePicker(false)}
            />
            {errors.orderDate ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.orderDate}
              </Text>
            ) : null}
          </View>

          {/* Estimated Completion */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">
              Perkiraan Selesai
            </Text>
            <TouchableOpacity
              onPress={toggleEstCompletionPicker}
              className="border border-gray-300 rounded-lg px-3 py-2 flex-row items-center justify-between"
            >
              <Text className="text-gray-800">
                {formData.estimatedCompletion}
              </Text>
              <Calendar size={20} color="#6B7280" />
            </TouchableOpacity>
            <DatePicker
              selected={estCompletionDateObj}
              onChange={(date: Date) => {
                setEstCompletionDateObj(date);
                const formattedDate = formatDate(date);
                handleChange("estimatedCompletion", formattedDate);
              }}
              className="absolute opacity-0"
              customInput={<></>}
              open={showEstCompletionPicker}
              onClickOutside={() => setShowEstCompletionPicker(false)}
              minDate={orderDateObj} // Cannot be earlier than order date
            />
          </View>

          {/* Status */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">
              Status Pesanan
            </Text>
            <View className="border border-gray-300 rounded-lg overflow-hidden">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row p-2">
                  {statusOptions.map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => handleChange("status", status)}
                      className={`mr-2 px-3 py-1 rounded-full ${formData.status === status ? "bg-blue-500" : "bg-gray-200"}`}
                    >
                      <Text
                        className={
                          formData.status === status
                            ? "text-white"
                            : "text-gray-700"
                        }
                      >
                        {formatStatusLabel(status)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Order Type */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">
              Jenis Pesanan
            </Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-3 py-2 text-gray-800`}
              value={formData.orderType}
              onChangeText={(text) => handleChange("orderType", text)}
              placeholder="Contoh: spanduk 4x2 meter"
            />
          </View>

          {/* Size */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">Ukuran</Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-3 py-2 text-gray-800`}
              value={formData.size}
              onChangeText={(text) => handleChange("size", text)}
              placeholder="Masukkan ukuran"
            />
          </View>

          {/* Quantity */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">Jumlah</Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-3 py-2 text-gray-800`}
              value={formData.quantity?.toString() || "1"}
              onChangeText={(text) => handleChange("quantity", text)}
              placeholder="Masukkan jumlah"
              keyboardType="numeric"
            />
          </View>

          {/* Material */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">Material</Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-3 py-2 text-gray-800`}
              value={formData.material}
              onChangeText={(text) => handleChange("material", text)}
              placeholder="Masukkan material"
            />
          </View>

          {/* Finishing */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">Finishing</Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-3 py-2 text-gray-800`}
              value={formData.finishing}
              onChangeText={(text) => handleChange("finishing", text)}
              placeholder="Masukkan finishing"
            />
          </View>

          {/* Design Link */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">Link Design</Text>
            <TextInput
              className={`border border-gray-300 rounded-lg px-3 py-2 text-gray-800`}
              value={formData.designLink}
              onChangeText={(text) => handleChange("designLink", text)}
              placeholder="URL (Google Drive atau lainnya)"
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          {/* Product Details */}
          <View>
            <Text className="text-gray-700 mb-1 font-medium">
              Detail Produk
            </Text>
            <TextInput
              className={`border ${errors.productDetails ? "border-red-500" : "border-gray-300"} rounded-lg px-3 py-2 text-gray-800 min-h-[100px]`}
              value={formData.productDetails}
              onChangeText={(text) => handleChange("productDetails", text)}
              placeholder="Masukkan detail produk..."
              multiline
              textAlignVertical="top"
            />
            {errors.productDetails ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.productDetails}
              </Text>
            ) : null}
          </View>

          {/* Submit Button */}
          <View className="flex-row justify-end space-x-2 mt-4">
            <TouchableOpacity
              onPress={onCancel}
              className="bg-gray-200 px-4 py-2 rounded-lg"
              disabled={isSubmitting}
            >
              <Text className="font-semibold text-gray-700">Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="font-semibold text-white ml-2">
                    {isEditMode ? "Memperbarui..." : "Membuat..."}
                  </Text>
                </>
              ) : (
                <Text className="font-semibold text-white">
                  {isEditMode ? "Perbarui Pesanan" : "Buat Pesanan"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderForm;
