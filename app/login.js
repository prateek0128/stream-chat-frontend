import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { useAuth } from "@/context/authContext";
import { fonts } from "@/config/fonts";

export default function Login() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const onLogin = () => {
    if (!id.trim()) return;
    setAuth(id.trim(), name.trim() || id.trim());
    router.push("/");
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 70}
      >
      <View style={styles.header}>
        <Text style={styles.logo}>💬</Text>
        <Text style={styles.title}>WhatsApp Chat</Text>
        <Text style={styles.subtitle}>
          Enter your details to start chatting
        </Text>
      </View>

      <View style={styles.form}>
        <TextInput
          placeholder="User ID (e.g. ronit63 or user_b)"
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
    </>
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
});
