import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { Order, updateOrder } from "../services/orderService";

interface DesignLinkEditFormProps {
  order: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

export default function DesignLinkEditForm({
  order,
  onSuccess,
  onCancel,
  disabled = false,
}: DesignLinkEditFormProps) {
  const [designLink, setDesignLink] = useState(order.designLink || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!order.id) {
      setError("ID pesanan tidak valid");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateOrder(order.id, { designLink });
      Alert.alert("Sukses", "Link desain berhasil diperbarui");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error updating design link:", err);
      setError("Gagal memperbarui link desain. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-sm">
      <Text className="text-lg font-bold mb-4">
        Edit Link Desain - {order.orderNumber}
      </Text>

      {error && (
        <View className="bg-red-50 p-3 rounded-md mb-4">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-gray-700 mb-1">Link Desain</Text>
        <TextInput
          className={`border ${disabled ? "border-gray-200 bg-gray-100" : "border-gray-300"} rounded-md p-2 text-gray-800`}
          placeholder="Masukkan link desain (URL)"
          value={designLink}
          onChangeText={setDesignLink}
          autoCapitalize="none"
          keyboardType="url"
          editable={!disabled}
        />
      </View>

      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          onPress={onCancel}
          className={`${disabled ? "bg-gray-100" : "bg-gray-200"} px-4 py-2 rounded-md flex-row items-center`}
          disabled={isSubmitting || disabled}
        >
          <X size={16} color="#4b5563" />
          <Text className="text-gray-700 ml-1">Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          className={`${disabled ? "bg-blue-300" : "bg-blue-500"} px-4 py-2 rounded-md flex-row items-center`}
          disabled={isSubmitting || disabled}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Check size={16} color="#ffffff" />
              <Text className="text-white ml-1">Simpan</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
