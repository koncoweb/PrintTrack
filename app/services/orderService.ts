import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from "firebase/firestore";

export interface Order {
  id?: string;
  orderNumber: string;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  productDetails: string;
  estimatedCompletion?: string;
  orderType?: string;
  size?: string;
  quantity?: number;
  material?: string;
  finishing?: string;
  designLink?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type OrderStatus =
  | "order_received" // Pesanan Diterima
  | "design_in_progress" // Siap Desain
  | "design_approved" // Desain Disetujui
  | "ready_to_print" // Siap Cetak
  | "printing" // Proses Cetak
  | "finishing_1" // Finishing 1
  | "finishing_2" // Finishing 2
  | "completed" // Selesai
  | "delivered"; // Diambil

const ORDERS_COLLECTION = "orders";

// Generate a unique order number
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `ORD-${year}${month}-${random}`;
};

// Format date to string
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

// Create a new order
export const createOrder = async (
  orderData: Omit<Order, "id">,
): Promise<string> => {
  try {
    const orderWithTimestamps = {
      ...orderData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, ORDERS_COLLECTION),
      orderWithTimestamps,
    );
    return docRef.id;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(ordersQuery);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        orderDate: data.orderDate,
      } as Order;
    });
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (
  status: OrderStatus,
): Promise<Order[]> => {
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc"),
    );
    const querySnapshot = await getDocs(ordersQuery);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        orderDate: data.orderDate,
      } as Order;
    });
  } catch (error) {
    console.error(`Error getting orders with status ${status}:`, error);
    throw error;
  }
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        orderDate: data.orderDate,
      } as Order;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting order with ID ${orderId}:`, error);
    throw error;
  }
};

// Update an order
export const updateOrder = async (
  orderId: string,
  orderData: Partial<Order>,
  userRole?: string | null,
): Promise<void> => {
  try {
    // Get the current order to check status transitions
    if (orderData.status && userRole) {
      const currentOrder = await getOrderById(orderId);
      if (!currentOrder) {
        throw new Error("Order not found");
      }

      // Validate status transitions based on user role
      if (userRole === "operator") {
        // Operators can only update from ready_to_print through finishing_2 to completed
        const operatorAllowedTransitions: Record<OrderStatus, OrderStatus[]> = {
          ready_to_print: ["printing"],
          printing: ["finishing_1"],
          finishing_1: ["finishing_2"],
          finishing_2: ["completed"],
          // Define empty arrays for other statuses to indicate no transitions allowed
          order_received: [],
          design_in_progress: [],
          design_approved: [],
          completed: [],
          delivered: [],
        };

        const allowedNextStatuses =
          operatorAllowedTransitions[currentOrder.status] || [];
        if (!allowedNextStatuses.includes(orderData.status as OrderStatus)) {
          throw new Error(
            `Operator cannot update order from ${currentOrder.status} to ${orderData.status}`,
          );
        }
      }
      // Add other role-based restrictions here if needed
    }

    const orderRef = doc(db, ORDERS_COLLECTION, orderId);

    const updatedData = {
      ...orderData,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(orderRef, updatedData);
  } catch (error) {
    console.error(`Error updating order with ID ${orderId}:`, error);
    throw error;
  }
};

// Delete an order
export const deleteOrder = async (orderId: string): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error(`Error deleting order with ID ${orderId}:`, error);
    throw error;
  }
};

// Default export for Expo Router
export default function OrderService() {
  return null;
}
