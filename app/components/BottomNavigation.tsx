import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Home, Package, User, BarChart3 } from "lucide-react-native";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

export default function BottomNavigation({
  userRole,
}: {
  userRole: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      name: "Home",
      icon: (
        <Home
          size={24}
          color={pathname === "/dashboard/customer" ? "#3b82f6" : "#6b7280"}
        />
      ),
      path: "/dashboard/customer",
      roles: ["customer", "admin", "designer", "operator"],
    },
    {
      name: "Orders",
      icon: (
        <Package
          size={24}
          color={pathname === "/order-tracking" ? "#3b82f6" : "#6b7280"}
        />
      ),
      path: "/order-tracking",
      roles: ["customer", "admin", "designer", "operator"],
    },
    {
      name: "Admin",
      icon: (
        <BarChart3
          size={24}
          color={pathname === "/dashboard/admin" ? "#3b82f6" : "#6b7280"}
        />
      ),
      path: "/dashboard/admin",
      roles: ["admin"],
    },
    {
      name: "Profile",
      icon: (
        <User
          size={24}
          color={pathname === "/profile" ? "#3b82f6" : "#6b7280"}
        />
      ),
      path: "/profile",
      roles: ["customer", "admin", "designer", "operator"],
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => userRole && item.roles.includes(userRole),
  );

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex-row justify-around items-center h-16 px-2">
      {filteredNavItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          className={`flex-1 items-center justify-center py-2 ${pathname === item.path ? "border-t-2 border-blue-500" : ""}`}
          onPress={() => router.push(item.path)}
        >
          {item.icon}
          <Text
            className={`text-xs mt-1 ${pathname === item.path ? "text-blue-500 font-medium" : "text-gray-500"}`}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
