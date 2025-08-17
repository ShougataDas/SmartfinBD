import React from "react";
import { Stack, router } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Page Not Found" }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Oops! Page Not Found</Text>
          <Text style={styles.description}>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </Text>

          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            If you think this is a mistake, please contact support.
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: "bold",
    color: "#6c757d",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  helpText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
});
