import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Check, Clock, AlertCircle, CheckCircle2 } from "lucide-react-native";

type OrderStatus =
  | "order_received"
  | "design_in_progress"
  | "design_approved"
  | "ready_to_print"
  | "printing"
  | "finishing_1"
  | "finishing_2"
  | "completed"
  | "delivered";

type OrderStep = {
  id: OrderStatus;
  label: string;
  description?: string;
  updatedAt?: string; // Date when the status was updated
};

type OrderTrackingViewProps = {
  currentStatus?: OrderStatus;
  steps?: OrderStep[];
  showDescription?: boolean;
};

const DEFAULT_STEPS: OrderStep[] = [
  {
    id: "order_received",
    label: "Pesanan Diterima",
    description: "Pesanan masuk dan diterima oleh admin",
    updatedAt: "2023-10-15 08:30",
  },
  {
    id: "design_in_progress",
    label: "Siap Desain",
    description: "Pesanan sedang proses desain",
    updatedAt: "2023-10-16 10:45",
  },
  {
    id: "design_approved",
    label: "Desain Disetujui",
    description: "Desain telah divalidasi oleh konsumen",
    updatedAt: "2023-10-17 14:20",
  },
  {
    id: "ready_to_print",
    label: "Siap Cetak",
    description: "Pesanan sedang proses layout",
    updatedAt: "2023-10-18 09:15",
  },
  {
    id: "printing",
    label: "Proses Cetak",
    description: "Pesanan sedang dalam proses cetak",
    updatedAt: "2023-10-19 11:30",
  },
  {
    id: "finishing_1",
    label: "Finishing 1",
    description: "Pesanan dalam proses finishing tahap 1",
    updatedAt: "2023-10-20 16:45",
  },
  {
    id: "finishing_2",
    label: "Finishing 2",
    description: "Pesanan dalam proses finishing tahap 2",
    updatedAt: "2023-10-21 13:10",
  },
  {
    id: "completed",
    label: "Selesai",
    description: "Pesanan sudah selesai dan siap diambil",
    updatedAt: "2023-10-22 15:30",
  },
  {
    id: "delivered",
    label: "Diambil",
    description: "Pesanan telah diambil oleh konsumen",
    updatedAt: "2023-10-23 10:00",
  },
];

const OrderTrackingView = ({
  currentStatus = "order_received",
  steps = DEFAULT_STEPS,
  showDescription = true,
}: OrderTrackingViewProps) => {
  // Find the index of the current status in the steps array
  const currentStepIndex = steps.findIndex((step) => step.id === currentStatus);

  return (
    <View className="bg-white p-4 rounded-lg shadow-md border border-green-100">
      <View className="flex-row items-center mb-4">
        <View className="bg-green-600 h-8 w-8 rounded-full items-center justify-center mr-2">
          <Text className="text-white font-bold">📋</Text>
        </View>
        <Text className="text-xl font-bold text-green-700">Status Pesanan</Text>
      </View>

      <View className="space-y-2">
        {steps.map((step, index) => {
          // Determine if this step is completed, active, or pending
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <View key={step.id} className="flex-row">
              {/* Status indicator and connecting line */}
              <View className="items-center mr-3">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center ${isCompleted ? "bg-green-500" : isActive ? "bg-yellow-500" : "bg-gray-300"}`}
                  style={{
                    elevation: isActive ? 4 : 0,
                    shadowColor: isActive ? "#000" : "transparent",
                    shadowOffset: { width: 0, height: isActive ? 2 : 0 },
                    shadowOpacity: isActive ? 0.3 : 0,
                    shadowRadius: isActive ? 3 : 0,
                    borderWidth: isActive ? 2 : 0,
                    borderColor: isActive ? "#FBBF24" : "transparent",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={20} color="white" />
                  ) : isActive ? (
                    <Clock size={20} color="white" />
                  ) : (
                    <AlertCircle size={20} color="white" />
                  )}
                </View>

                {/* Connecting line (except for the last item) */}
                {index < steps.length - 1 && (
                  <View
                    className={`w-1 h-16 ${isCompleted ? "bg-green-500" : isActive ? "bg-green-300" : "bg-gray-300"}`}
                    style={{
                      marginVertical: 2,
                    }}
                  />
                )}
              </View>

              {/* Step information */}
              <View
                className={`flex-1 pb-8 p-3 rounded-lg mb-1 ${isActive ? "bg-green-50 border-l-4 border-green-500" : isCompleted ? "bg-white border-l-4 border-green-300" : ""}`}
                style={{
                  transform: [{ scale: isActive ? 1.02 : 1.0 }],
                }}
              >
                <Text
                  className={`font-bold ${isCompleted ? "text-green-600 text-base" : isActive ? "text-green-700 text-lg" : "text-gray-400 text-xs"}`}
                >
                  {step.label}
                  {isActive && (
                    <View className="bg-yellow-400 px-2 py-0.5 rounded-full ml-2">
                      <Text className="text-[10px] text-black font-bold">
                        SAAT INI
                      </Text>
                    </View>
                  )}
                </Text>

                {/* Display update date for completed and active steps */}
                {(isCompleted || isActive) && step.updatedAt && (
                  <View className="mt-1">
                    <Text
                      className={`${isActive ? "text-green-600" : "text-gray-500"} text-xs italic`}
                    >
                      Diperbarui: {step.updatedAt}
                    </Text>
                  </View>
                )}

                {showDescription && step.description && (
                  <View
                    className={`mt-1 ${isActive ? "bg-white p-2 rounded-md" : isCompleted ? "bg-green-50 p-1 rounded-md" : ""}`}
                  >
                    <Text
                      className={`${isActive ? "text-gray-700" : isCompleted ? "text-gray-600" : "text-gray-400"} ${isActive ? "text-sm" : isCompleted ? "text-xs" : "text-xs"}`}
                    >
                      {step.description}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default OrderTrackingView;
