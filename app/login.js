import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/authContext";
import { fonts } from "@/config/fonts";
import { predefinedUsers } from "@/config/users";

export default function Login() {
  const { setAuth } = useAuth();
  const navigation = useNavigation();
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const onLogin = () => {
    if (!id.trim()) return;
    setAuth(id.trim(), name.trim() || id.trim());
    navigation.navigate("Home");
  };

  const selectUser = (user) => {
    setId(user.id);
    setName(user.name);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 70}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Smart Matrimony</Text>
        <Text style={styles.subtitle}>
          Enter your details to start chatting
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Quick Select Users</Text>
        <FlatList
          data={predefinedUsers}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.userCard,
                id === item.id && styles.selectedUserCard
              ]}
              onPress={() => selectUser(item)}
            >
              {item.avatar.startsWith('http') ? (
                <Image 
                  source={{ uri: item.avatar }} 
                  style={styles.userAvatarImage}
                />
              ) : (
                <Text style={styles.userAvatar}>{item.avatar}</Text>
              )}
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userId}>@{item.id}</Text>
              <View style={[
                styles.statusDot,
                { backgroundColor: 
                  item.status === 'online' ? '#4CAF50' :
                  item.status === 'away' ? '#FF9800' :
                  item.status === 'busy' ? '#F44336' : '#9E9E9E'
                }
              ]} />
            </Pressable>
          )}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
        
        <Text style={styles.orText}>Or enter custom details</Text>
        
        <TextInput
          placeholder="User ID (e.g. ronit63, ananya_dev, kavya_pm)"
          placeholderTextColor="#999"
          value={id}
          onChangeText={setId}
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Display name (optional)"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <Pressable onPress={onLogin} style={styles.button}>
          <Text style={styles.buttonText}>Start Chatting</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E91E63",
  },
  header: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#fff",
    opacity: 0.8,
    textAlign: "center",
  },
  form: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingTop: 40,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 25,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: fonts.regular,
    backgroundColor: "#F8F8F8",
  },
  button: {
    backgroundColor: "#C2185B",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontFamily: fonts.semiBold,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  usersList: {
    paddingBottom: 20,
    minHeight: 260,
  },
  userCard: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 8,
    margin: 3,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
    minHeight: 90,
  },
  selectedUserCard: {
    borderColor: "#E91E63",
    backgroundColor: "#FCE4EC",
  },
  userAvatar: {
    fontSize: 28,
    marginBottom: 6,
  },
  userAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 6,
  },
  userName: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: "#333",
    textAlign: "center",
    marginBottom: 2,
  },
  userId: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: "#666",
    textAlign: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: 8,
    right: 8,
    borderWidth: 1,
    borderColor: "#fff",
  },
  orText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
});
