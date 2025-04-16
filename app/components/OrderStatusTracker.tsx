import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";

interface OrderStatus {
  id: string;
  name: string;
  completed: boolean;
  timestamp?: string;
  estimatedTime?: string;
}

interface OrderStatusTrackerProps {
  statuses?: OrderStatus[];
  currentStatusId?: string;
}

const OrderStatusTracker = ({
  statuses = [
    {
      id: "1",
      name: "Order Received",
      completed: true,
      timestamp: "2023-06-15 09:30 AM",
    },
    {
      id: "2",
      name: "Design in Progress",
      completed: true,
      timestamp: "2023-06-16 02:15 PM",
    },
    {
      id: "3",
      name: "Design Approval Pending",
      completed: false,
      estimatedTime: "1-2 days",
    },
    {
      id: "4",
      name: "Printing in Progress",
      completed: false,
      estimatedTime: "2-3 days",
    },
    {
      id: "5",
      name: "Quality Check",
      completed: false,
      estimatedTime: "1 day",
    },
    {
      id: "6",
      name: "Ready for Delivery",
      completed: false,
      estimatedTime: "1-2 days",
    },
    { id: "7", name: "Order Completed", completed: false },
  ],
  currentStatusId = "3",
}: OrderStatusTrackerProps) => {
  return (
    <View className="bg-white p-4 rounded-lg shadow-md w-full">
      <Text className="text-xl font-bold mb-4 text-center">Order Status</Text>

      <View className="space-y-1">
        {statuses.map((status, index) => {
          const isActive = status.id === currentStatusId;
          const isPast = status.completed;
          const isFuture = !isPast && !isActive;

          return (
            <View key={status.id} className="flex-row items-start">
              {/* Status dot */}
              <View
                className={`h-6 w-6 rounded-full items-center justify-center mt-1 ${isPast ? "bg-green-500" : isActive ? "bg-blue-500" : "bg-gray-300"}`}
              >
                {isPast && <Text className="text-white text-xs">✓</Text>}
              </View>

              {/* Status line (not for the last item) */}
              {index < statuses.length - 1 && (
                <View
                  className={`absolute h-14 w-0.5 left-3 top-6 ${isPast ? "bg-green-500" : "bg-gray-300"}`}
                />
              )}

              {/* Status details */}
              <View className="ml-4 flex-1 mb-6">
                <Text
                  className={`font-semibold ${isPast ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-500"}`}
                >
                  {status.name}
                </Text>

                {/* Show timestamp for completed steps */}
                {status.timestamp && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Completed: {status.timestamp}
                  </Text>
                )}

                {/* Show estimated time for future steps */}
                {status.estimatedTime && isFuture && (
                  <View className="flex-row items-center mt-1">
                    <Clock size={12} color="#6B7280" />
                    <Text className="text-xs text-gray-500 ml-1">
                      Est. time: {status.estimatedTime}
                    </Text>
                  </View>
                )}

                {/* Show in progress for active step */}
                {isActive && (
                  <Text className="text-xs text-blue-500 font-medium mt-1">
                    In Progress
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default OrderStatusTracker;
