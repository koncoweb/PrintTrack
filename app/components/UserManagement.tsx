import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  User,
  getUsers,
  updateUser,
  createUser,
  UserRole,
  UserStatus,
} from "../services/userService";
import {
  X,
  Check,
  Edit,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User as UserIcon,
} from "lucide-react-native";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedRole, setEditedRole] = useState<UserRole>("customer");
  const [editedStatus, setEditedStatus] = useState<UserStatus>("active");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedBirthdate, setEditedBirthdate] = useState("");

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Reset form fields
  const resetFormFields = () => {
    setEditedName("");
    setEditedEmail("");
    setEditedRole("customer");
    setEditedStatus("active");
    setEditedPhone("");
    setEditedAddress("");
    setEditedBirthdate("");
    setFormErrors({});
  };

  // Open add user modal
  const handleAddUser = () => {
    resetFormFields();
    setSelectedUser(null);
    setAddModalVisible(true);
  };

  // Open edit modal with user data
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditedName(user.name || "");
    setEditedEmail(user.email || "");
    setEditedRole(user.role || "customer");
    setEditedStatus(user.status || "active");
    setEditedPhone(user.phone || "");
    setEditedAddress(user.address || "");
    setEditedBirthdate(user.birthdate || "");
    setFormErrors({});
    setEditModalVisible(true);
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (user: User) => {
    try {
      const newStatus = user.status === "active" ? "inactive" : "active";
      await updateUser(user.id!, { status: newStatus });

      // Update local state
      setUsers(
        users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)),
      );

      Alert.alert("Status Updated", `User ${user.name} is now ${newStatus}.`);
    } catch (err) {
      console.error("Error updating user status:", err);
      Alert.alert("Error", "Failed to update user status. Please try again.");
    }
  };

  // Validate form fields
  const validateForm = (isNewUser: boolean): boolean => {
    const errors: Record<string, string> = {};

    if (!editedName.trim()) {
      errors.name = "Name is required";
    }

    if (isNewUser && !editedEmail.trim()) {
      errors.email = "Email is required";
    } else if (
      editedEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editedEmail)
    ) {
      errors.email = "Invalid email format";
    }

    if (editedPhone.trim() && !/^[0-9+\-\s()]{6,15}$/.test(editedPhone)) {
      errors.phone = "Invalid phone number";
    }

    if (
      editedBirthdate.trim() &&
      !/^\d{4}-\d{2}-\d{2}$/.test(editedBirthdate)
    ) {
      errors.birthdate = "Use format YYYY-MM-DD";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new user
  const createNewUser = async () => {
    if (!validateForm(true)) return;

    setIsSubmitting(true);
    try {
      const newUser: Omit<User, "id"> = {
        name: editedName,
        email: editedEmail,
        role: editedRole,
        status: editedStatus,
        phone: editedPhone,
        address: editedAddress,
        birthdate: editedBirthdate,
      };

      const newUserId = await createUser(newUser);

      // Add to local state
      setUsers([{ ...newUser, id: newUserId }, ...users]);

      setAddModalVisible(false);
      Alert.alert("Success", "New user created successfully.");
    } catch (err) {
      console.error("Error creating user:", err);
      Alert.alert("Error", "Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save edited user data
  const saveUserChanges = async () => {
    if (!selectedUser || !validateForm(false)) return;

    setIsSubmitting(true);
    try {
      const updatedData = {
        name: editedName,
        role: editedRole,
        status: editedStatus,
        phone: editedPhone,
        address: editedAddress,
        birthdate: editedBirthdate,
      };

      // Only update email if it changed
      if (editedEmail !== selectedUser.email) {
        updatedData.email = editedEmail;
      }

      await updateUser(selectedUser.id!, updatedData);

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, ...updatedData } : u,
        ),
      );

      setEditModalVisible(false);
      Alert.alert("Success", "User information updated successfully.");
    } catch (err) {
      console.error("Error saving user changes:", err);
      Alert.alert(
        "Error",
        "Failed to update user information. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Loading users...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 mb-4">{error}</Text>
        <TouchableOpacity
          className="bg-blue-500 px-4 py-2 rounded-lg"
          onPress={fetchUsers}
        >
          <Text className="text-white font-medium">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* User List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-lg mb-3 shadow-sm">
            <View className="flex-row justify-between items-center">
              <Text className="font-bold text-lg">{item.name}</Text>
              <View
                className={`px-2 py-1 rounded-full ${item.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
              >
                <Text className="text-xs text-white font-medium">
                  {item.status}
                </Text>
              </View>
            </View>
            <Text className="text-gray-700 mt-1">{item.email}</Text>
            <Text className="text-gray-500 text-sm mt-1 capitalize">
              {item.role}
            </Text>
            <View className="flex-row mt-3 space-x-2">
              <TouchableOpacity
                className="bg-blue-500 px-3 py-1 rounded"
                onPress={() => handleEditUser(item)}
              >
                <Text className="text-white text-sm">Edit</Text>
              </TouchableOpacity>
              {item.status === "active" ? (
                <TouchableOpacity
                  className="bg-red-500 px-3 py-1 rounded"
                  onPress={() => toggleUserStatus(item)}
                >
                  <Text className="text-white text-sm">Deactivate</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  className="bg-green-500 px-3 py-1 rounded"
                  onPress={() => toggleUserStatus(item)}
                >
                  <Text className="text-white text-sm">Activate</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <Text className="text-gray-500">
              {searchQuery
                ? "No users found matching your search"
                : "No users found"}
            </Text>
          </View>
        }
      />

      {/* Edit User Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-5 rounded-lg w-5/6 max-w-md max-h-[90%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold">Edit User</Text>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-[400px]">
                {/* Name Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">
                    Name <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.name ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Full name"
                    />
                    <View className="absolute left-2 top-2.5">
                      <UserIcon size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.name ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </Text>
                  ) : null}
                </View>

                {/* Email Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Email</Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.email ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedEmail}
                      onChangeText={setEditedEmail}
                      placeholder="Email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <View className="absolute left-2 top-2.5">
                      <Mail size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.email ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </Text>
                  ) : null}
                </View>

                {/* Role Selection */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Role</Text>
                  <View className="border border-gray-300 rounded-lg overflow-hidden">
                    {["admin", "designer", "operator", "customer"].map(
                      (role) => (
                        <TouchableOpacity
                          key={role}
                          className={`flex-row items-center p-2 border-b border-gray-100 ${editedRole === role ? "bg-blue-50" : ""}`}
                          onPress={() => setEditedRole(role as UserRole)}
                        >
                          <View className="w-6 h-6 border border-gray-300 rounded-full items-center justify-center mr-2">
                            {editedRole === role && (
                              <View className="w-4 h-4 bg-blue-500 rounded-full" />
                            )}
                          </View>
                          <Text className="capitalize">{role}</Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                {/* Status Selection */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Status</Text>
                  <View className="flex-row space-x-4">
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => setEditedStatus("active")}
                    >
                      <View className="w-6 h-6 border border-gray-300 rounded-full items-center justify-center mr-2">
                        {editedStatus === "active" && (
                          <View className="w-4 h-4 bg-green-500 rounded-full" />
                        )}
                      </View>
                      <Text>Active</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => setEditedStatus("inactive")}
                    >
                      <View className="w-6 h-6 border border-gray-300 rounded-full items-center justify-center mr-2">
                        {editedStatus === "inactive" && (
                          <View className="w-4 h-4 bg-gray-500 rounded-full" />
                        )}
                      </View>
                      <Text>Inactive</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Phone Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Phone Number</Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.phone ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedPhone}
                      onChangeText={setEditedPhone}
                      placeholder="Phone number"
                      keyboardType="phone-pad"
                    />
                    <View className="absolute left-2 top-2.5">
                      <Phone size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.phone ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.phone}
                    </Text>
                  ) : null}
                </View>

                {/* Address Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Address</Text>
                  <View className="relative">
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2 pl-9"
                      value={editedAddress}
                      onChangeText={setEditedAddress}
                      placeholder="Address"
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                    <View className="absolute left-2 top-2.5">
                      <MapPin size={18} color="#6b7280" />
                    </View>
                  </View>
                </View>

                {/* Birthdate Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">
                    Birthdate (YYYY-MM-DD)
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.birthdate ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedBirthdate}
                      onChangeText={setEditedBirthdate}
                      placeholder="YYYY-MM-DD"
                    />
                    <View className="absolute left-2 top-2.5">
                      <Calendar size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.birthdate ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.birthdate}
                    </Text>
                  ) : null}
                </View>
              </ScrollView>

              <View className="flex-row justify-end space-x-2 mt-4">
                <TouchableOpacity
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setEditModalVisible(false)}
                  disabled={isSubmitting}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`${isSubmitting ? "bg-blue-400" : "bg-blue-500"} px-4 py-2 rounded-lg flex-row items-center`}
                  onPress={saveUserChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white ml-2">Saving...</Text>
                    </>
                  ) : (
                    <Text className="text-white">Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={handleAddUser}
      >
        <UserPlus size={24} color="white" />
      </TouchableOpacity>

      {/* Add User Modal */}
      <Modal
        visible={addModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white p-5 rounded-lg w-5/6 max-w-md max-h-[90%]">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-lg font-bold">Add New User</Text>
                <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                  <X size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="max-h-[400px]">
                {/* Name Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">
                    Name <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.name ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Full name"
                    />
                    <View className="absolute left-2 top-2.5">
                      <UserIcon size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.name ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </Text>
                  ) : null}
                </View>

                {/* Email Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">
                    Email <Text className="text-red-500">*</Text>
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.email ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedEmail}
                      onChangeText={setEditedEmail}
                      placeholder="Email address"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <View className="absolute left-2 top-2.5">
                      <Mail size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.email ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </Text>
                  ) : null}
                </View>

                {/* Role Selection */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Role</Text>
                  <View className="border border-gray-300 rounded-lg overflow-hidden">
                    {["admin", "designer", "operator", "customer"].map(
                      (role) => (
                        <TouchableOpacity
                          key={role}
                          className={`flex-row items-center p-2 border-b border-gray-100 ${editedRole === role ? "bg-blue-50" : ""}`}
                          onPress={() => setEditedRole(role as UserRole)}
                        >
                          <View className="w-6 h-6 border border-gray-300 rounded-full items-center justify-center mr-2">
                            {editedRole === role && (
                              <View className="w-4 h-4 bg-blue-500 rounded-full" />
                            )}
                          </View>
                          <Text className="capitalize">{role}</Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>

                {/* Phone Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Phone Number</Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.phone ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedPhone}
                      onChangeText={setEditedPhone}
                      placeholder="Phone number"
                      keyboardType="phone-pad"
                    />
                    <View className="absolute left-2 top-2.5">
                      <Phone size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.phone ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.phone}
                    </Text>
                  ) : null}
                </View>

                {/* Address Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">Address</Text>
                  <View className="relative">
                    <TextInput
                      className="border border-gray-300 rounded-lg p-2 pl-9"
                      value={editedAddress}
                      onChangeText={setEditedAddress}
                      placeholder="Address"
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                    <View className="absolute left-2 top-2.5">
                      <MapPin size={18} color="#6b7280" />
                    </View>
                  </View>
                </View>

                {/* Birthdate Field */}
                <View className="mb-3">
                  <Text className="text-gray-700 mb-1">
                    Birthdate (YYYY-MM-DD)
                  </Text>
                  <View className="relative">
                    <TextInput
                      className={`border ${formErrors.birthdate ? "border-red-500" : "border-gray-300"} rounded-lg p-2 pl-9`}
                      value={editedBirthdate}
                      onChangeText={setEditedBirthdate}
                      placeholder="YYYY-MM-DD"
                    />
                    <View className="absolute left-2 top-2.5">
                      <Calendar size={18} color="#6b7280" />
                    </View>
                  </View>
                  {formErrors.birthdate ? (
                    <Text className="text-red-500 text-xs mt-1">
                      {formErrors.birthdate}
                    </Text>
                  ) : null}
                </View>
              </ScrollView>

              <View className="flex-row justify-end space-x-2 mt-4">
                <TouchableOpacity
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                  onPress={() => setAddModalVisible(false)}
                  disabled={isSubmitting}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`${isSubmitting ? "bg-blue-400" : "bg-blue-500"} px-4 py-2 rounded-lg flex-row items-center`}
                  onPress={createNewUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white ml-2">Creating...</Text>
                    </>
                  ) : (
                    <Text className="text-white">Create User</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
