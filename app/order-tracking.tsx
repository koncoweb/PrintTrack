import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Search,
  User,
  Menu,
  Truck,
  CheckCircle2,
} from "lucide-react-native";
import { db } from "./config/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

// Import the OrderTrackingView component
import OrderTrackingView from "./components/OrderTrackingView";

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { orderNumber: paramOrderNumber } = useLocalSearchParams();
  const [orderNumber, setOrderNumber] = useState(paramOrderNumber || "");
  const [loading, setLoading] = useState(paramOrderNumber ? true : false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Update searchInput when orderNumber changes from URL params
  useEffect(() => {
    if (paramOrderNumber) {
      setSearchInput(paramOrderNumber.toString());
    }
  }, [paramOrderNumber]);

  const fetchOrderData = async (orderNum) => {
    if (!orderNum) {
      setError("No order number provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    // Create an abort controller for the fetch operation
    const abortController = new AbortController();
    const abortTimeout = setTimeout(() => abortController.abort(), 20000);

    try {
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Network request timeout")), 15000);
      });

      // Use the imported Firestore functions

      // Query orders collection where orderNumber field matches the input
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("orderNumber", "==", orderNum.toString()),
      );

      // Wrap the query in a try-catch to handle potential connection issues
      let queryPromise;
      try {
        queryPromise = getDocs(q);
      } catch (innerError) {
        console.error("Error creating query:", innerError);
        throw new Error("Failed to initialize database query");
      }

      // Race the Firestore query against the timeout
      const querySnapshot = await Promise.race([queryPromise, timeoutPromise]);

      if (!querySnapshot.empty) {
        // Get the first matching document
        const orderDoc = querySnapshot.docs[0];
        const data = orderDoc.data();
        if (data) {
          setOrderData(data);
        } else {
          throw new Error("Order data is empty or corrupted");
        }
      } else {
        setError(
          "Order not found. Please check your order number and try again.",
        );
      }
    } catch (error) {
      console.error("Error fetching order:", error);

      if (error.name === "AbortError") {
        setError("Request was aborted due to timeout. Please try again.");
      } else if (
        error.message === "Network request timeout" ||
        error.code === "auth/network-request-failed" ||
        error.code === "unavailable" ||
        error.code === "resource-exhausted"
      ) {
        setError(
          "Network connection issue. Please check your internet connection and try again.",
        );
      } else if (error.code === "permission-denied") {
        setError("You don't have permission to access this order.");
      } else {
        setError(
          "Failed to retrieve order information. Please try again later.",
        );
      }
    } finally {
      clearTimeout(abortTimeout);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (paramOrderNumber && isMounted) {
        setOrderNumber(paramOrderNumber);
        await fetchOrderData(paramOrderNumber);
      }
    };

    fetchData();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [paramOrderNumber]);

  const handleSearch = () => {
    if (searchInput.trim()) {
      const trimmedInput = searchInput.trim();
      setOrderNumber(trimmedInput);
      // Add a small delay to ensure UI updates before fetch starts
      setTimeout(() => {
        fetchOrderData(trimmedInput);
      }, 100);
    }
  };

  // Map order status to display text and description
  const statusMap = {
    order_received: { label: "Pesanan Masuk", description: "Pesanan diterima" },
    design_in_progress: {
      label: "Pesanan Siap Desain",
      description: "Pesanan sedang proses desain",
    },
    design_approved: {
      label: "Desain Disetujui",
      description: "Desain telah divalidasi oleh konsumen",
    },
    ready_to_print: {
      label: "Pesanan Siap Cetak",
      description: "Pesanan sedang proses layout",
    },
    printing: {
      label: "Pesanan Proses Cetak",
      description: "Pesanan sedang dalam proses cetak",
    },
    finishing_1: {
      label: "Finishing 1",
      description: "Pesanan dalam proses finishing tahap 1",
    },
    finishing_2: {
      label: "Finishing 2",
      description: "Pesanan dalam proses finishing tahap 2",
    },
    completed: {
      label: "Selesai",
      description: "Pesanan sudah selesai dan siap diambil",
    },
    delivered: {
      label: "Diambil",
      description: "Pesanan telah diambil oleh konsumen",
    },
  };

  // Generate tracking timeline based on actual order status
  const trackingData = orderData
    ? [
        {
          status: statusMap[orderData.status]?.label || orderData.status,
          timestamp: new Date().toLocaleString(),
          description: statusMap[orderData.status]?.description || "",
          staff: "Staff",
        },
      ]
    : [];

  // Process order data from Firestore
  const processedOrderData = orderData
    ? {
        orderType: orderData.productDetails || "Banner Digital",
        currentStatus: orderData.status || "order_received",
        orderDate: orderData.orderDate || new Date().toLocaleDateString(),
        estimatedCompletion: orderData.estimatedCompletion || "-",
        customerName: orderData.customerName || "-",
        quantity: "1",
        size: orderData.size || "-",
        material: orderData.material || "-",
        finishing: orderData.finishing || "-",
      }
    : null;

  // Define steps for the OrderTrackingView component
  const orderSteps = [
    {
      id: "order_received",
      label: "Pesanan Diterima",
      description: "Pesanan masuk dan diterima oleh admin",
      updatedAt: processedOrderData?.orderDate,
    },
    {
      id: "design_in_progress",
      label: "Siap Desain",
      description: "Pesanan sedang proses desain",
      updatedAt:
        processedOrderData?.currentStatus === "design_in_progress"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      id: "design_approved",
      label: "Desain Disetujui",
      description: "Desain telah divalidasi oleh konsumen",
      updatedAt:
        processedOrderData?.currentStatus === "design_approved"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      id: "ready_to_print",
      label: "Siap Cetak",
      description: "Pesanan sedang proses layout",
      updatedAt:
        processedOrderData?.currentStatus === "ready_to_print"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      id: "printing",
      label: "Proses Cetak",
      description: "Pesanan sedang dalam proses cetak",
      updatedAt:
        processedOrderData?.currentStatus === "printing"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      id: "finishing_1",
      label: "Finishing 1",
      description: "Pesanan dalam proses finishing tahap 1",
      updatedAt:
        processedOrderData?.currentStatus === "finishing_1"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      id: "finishing_2",
      label: "Finishing 2",
      description: "Pesanan dalam proses finishing tahap 2",
      updatedAt:
        processedOrderData?.currentStatus === "finishing_2"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      id: "completed",
      label: "Selesai",
      description: "Pesanan sudah selesai dan siap diambil",
      updatedAt:
        processedOrderData?.currentStatus === "completed"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
    {
      id: "delivered",
      label: "Diambil",
      description: "Pesanan telah diambil oleh konsumen",
      updatedAt:
        processedOrderData?.currentStatus === "delivered"
          ? new Date().toLocaleString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
    },
  ];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header with logo and icons */}
      <View className="bg-white pt-12 pb-2 px-4 border-b border-gray-200">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-green-600">PRINT</Text>
            <Text className="text-sm font-bold text-green-600 ml-1">
              TRACKER
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity className="p-2">
              <User size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity className="p-2">
              <Menu size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 bg-gray-50">
        {/* Search Bar */}
        <View className="p-4 bg-white">
          <View className="bg-green-50 p-3 rounded-lg mb-3">
            <Text className="text-green-700 font-medium text-center mb-2">
              Lacak Status Pesanan Anda
            </Text>
            <View className="flex-row items-center border-2 border-green-300 rounded-md overflow-hidden bg-white shadow-sm">
              <TextInput
                className="flex-1 py-2 px-4 text-gray-700"
                placeholder="Masukkan nomor pesanan"
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                className="bg-green-600 p-3"
                onPress={handleSearch}
              >
                <Search size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {orderNumber ? (
            <View className="mt-2">
              <View className="flex-row items-center mb-1">
                <Text className="text-gray-600">Nomor Pesanan:</Text>
                <View className="bg-green-100 rounded-full px-2 py-0.5 ml-2">
                  <Text className="text-green-700 font-medium text-xs">
                    AKTIF
                  </Text>
                </View>
              </View>
              <View className="border-2 border-green-500 rounded-md bg-green-50 p-3 shadow-sm">
                <Text className="text-center text-green-700 font-bold text-lg">
                  {orderNumber}
                </Text>
              </View>
            </View>
          ) : null}
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center py-10">
            <View className="bg-green-50 p-6 rounded-full">
              <ActivityIndicator size="large" color="#10B981" />
            </View>
            <Text className="text-gray-600 mt-4 font-medium">
              Memuat informasi pesanan...
            </Text>
            <Text className="text-gray-400 text-xs mt-2">
              Mohon tunggu sebentar
            </Text>
          </View>
        ) : error ? (
          <View className="bg-red-50 p-6 m-4 rounded-lg border-2 border-red-300 shadow-md">
            <View className="items-center mb-4">
              <View className="bg-red-100 p-3 rounded-full">
                <Text className="text-3xl">⚠️</Text>
              </View>
            </View>
            <Text className="text-red-700 font-bold text-center text-lg mb-2">
              Error
            </Text>
            <Text className="text-red-600 text-center mb-4">{error}</Text>
            <TouchableOpacity
              className="mt-2 bg-green-600 py-3 rounded-lg items-center shadow-md"
              onPress={() => router.back()}
            >
              <Text className="text-white font-bold">Kembali</Text>
            </TouchableOpacity>
          </View>
        ) : orderData && processedOrderData ? (
          <View>
            {/* Order Title */}
            <View className="px-4 py-3 bg-white">
              <View className="items-center">
                <View className="bg-green-600 px-4 py-1 rounded-full mb-1">
                  <Text className="text-xl font-bold text-white">
                    Status Pesanan
                  </Text>
                </View>
                <View className="bg-green-100 px-3 py-1 rounded-lg">
                  <Text className="text-green-800 font-medium">
                    {processedOrderData.orderType} - {processedOrderData.size}
                  </Text>
                </View>
              </View>
            </View>

            {/* Integrated OrderTrackingView Component */}
            <View className="mt-1">
              <OrderTrackingView
                currentStatus={processedOrderData.currentStatus}
                showDescription={true}
                steps={orderSteps}
              />
            </View>

            {/* Order Details */}
            <View className="bg-white mt-1 p-4">
              <View className="flex-row items-center mb-3">
                <View className="bg-green-600 h-6 w-6 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-bold">📋</Text>
                </View>
                <Text className="font-bold text-gray-700 text-lg">
                  Detail Pesanan
                </Text>
              </View>
              <View className="bg-green-50 rounded-lg p-3">
                <View className="flex-row flex-wrap">
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">Jenis Pesanan</Text>
                    <Text className="text-gray-800 font-medium">
                      {processedOrderData.orderType}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">Ukuran</Text>
                    <Text className="text-gray-800 font-medium">
                      {processedOrderData.size}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">Tanggal Pesan</Text>
                    <View className="flex-row items-center">
                      <Text className="text-gray-800 font-medium">
                        {processedOrderData.orderDate}
                      </Text>
                    </View>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">
                      Estimasi Selesai
                    </Text>
                    <Text className="text-gray-800 font-medium">
                      {processedOrderData.estimatedCompletion}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">
                      Nama Pelanggan
                    </Text>
                    <Text className="text-gray-800 font-medium">
                      {processedOrderData.customerName}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">Jumlah</Text>
                    <Text className="text-gray-800 font-medium">
                      {processedOrderData.quantity}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">Material</Text>
                    <Text className="text-gray-800 font-medium">
                      {processedOrderData.material}
                    </Text>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-gray-500 text-xs">Finishing</Text>
                    <Text className="text-gray-800 font-medium">
                      {processedOrderData.finishing}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Current Status Highlight - Enhanced */}
            <View className="bg-white mt-1 p-4">
              <View className="flex-row items-center mb-3">
                <View className="bg-yellow-400 px-2 py-1 rounded-full mr-2">
                  <Text className="text-xs text-black font-bold">
                    STATUS SAAT INI
                  </Text>
                </View>
                <Text className="text-xl font-bold text-green-700">
                  {statusMap[processedOrderData.currentStatus]?.label ||
                    processedOrderData.currentStatus}
                </Text>
              </View>
              <View className="bg-green-50 p-4 rounded-lg border-2 border-green-300 shadow-md">
                <View className="flex-row items-center">
                  <Truck size={20} color="#059669" style={{ marginRight: 8 }} />
                  <Text className="text-green-700 text-base font-medium flex-1">
                    {statusMap[processedOrderData.currentStatus]?.description ||
                      "Pesanan sedang diproses"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Tracking Timeline */}
            <View className="bg-white mt-1 p-4 mb-6">
              <View className="flex-row items-center mb-3">
                <View className="bg-green-600 h-6 w-6 rounded-full items-center justify-center mr-2">
                  <Text className="text-white font-bold">⏱</Text>
                </View>
                <Text className="font-bold text-gray-700 text-lg">
                  Riwayat Status
                </Text>
              </View>
              {trackingData.map((item, index) => (
                <View key={index} className="flex-row mb-4">
                  <View className="mr-3 items-center">
                    <View className="bg-green-100 rounded-full p-1">
                      <CheckCircle2 size={22} color="#10B981" />
                    </View>
                    {index < trackingData.length - 1 && (
                      <View className="h-16 w-1 bg-green-500 my-1 rounded-full" />
                    )}
                  </View>
                  <View className="bg-green-50 p-3 rounded-lg flex-1 border-l-4 border-green-500">
                    <Text className="text-green-600 font-bold text-base">
                      {item.status}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {item.timestamp}
                    </Text>
                    <View className="flex-row flex-wrap mt-1 bg-white p-2 rounded-md">
                      <Text className="text-gray-700">{item.description}</Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <User size={14} color="#059669" />
                      <Text className="text-green-600 text-sm ml-1">
                        Diperbarui oleh: {item.staff}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="bg-yellow-50 p-6 m-4 rounded-lg border-2 border-yellow-300 shadow-md">
            <View className="items-center mb-4">
              <Truck size={40} color="#B45309" />
            </View>
            <Text className="text-yellow-700 font-bold text-center text-lg mb-2">
              Lacak Pesanan Anda
            </Text>
            <Text className="text-yellow-600 text-center">
              Masukkan nomor pesanan untuk melacak status pesanan Anda
            </Text>
            <View className="mt-4 bg-white p-2 rounded-md">
              <Text className="text-gray-500 text-center text-xs">
                Contoh: P12345 atau 12345
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
