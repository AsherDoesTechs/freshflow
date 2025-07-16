import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎧 FreshFlow</Text>
      <Text style={styles.subtitle}>Your vibe. Refreshed daily.</Text>
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>🎲 Roll Today’s Song</Text>
      </TouchableOpacity>
      <View style={styles.card}>
        <Text style={styles.songTitle}>[ Song Title Here ]</Text>
        <Text style={styles.songArtist}>[ Artist Name ]</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#22D3EE",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#CBD5E1",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#22D3EE",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 40,
  },
  buttonText: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  songTitle: {
    fontSize: 20,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 6,
  },
  songArtist: {
    fontSize: 16,
    color: "#94A3B8",
  },
});
