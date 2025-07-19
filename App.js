import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { Buffer } from "buffer";

// 🔐 Spotify Credentials
const CLIENT_ID = "20096e5384b746c6b692757222a50836";
const CLIENT_SECRET = "e379ba2732854836bd543f7faf9547fb";

export default function App() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔑 Get access token
  const getAccessToken = async () => {
    const result = await axios.post(
      "https://accounts.spotify.com/api/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        },
      }
    );
    return result.data.access_token;
  };

  global.Buffer = Buffer;

  // 🎲 Roll Today’s Song
  const getRandomTrack = async () => {
    setLoading(true);
    try {
      const token = await getAccessToken();

      const result = await axios.get(
        "https://api.spotify.com/v1/browse/new-releases?limit=20",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const albums = result.data.albums.items;
      const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
      const trackName = randomAlbum.name;
      const artistName = randomAlbum.artists[0].name;

      setTrack({ name: trackName, artist: artistName });
    } catch (error) {
      console.error("❌ Error fetching track:", error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🎧 FreshFlow</Text>
      <Text style={styles.subtitle}>Your vibe. Refreshed daily.</Text>

      <TouchableOpacity style={styles.button} onPress={getRandomTrack}>
        <Text style={styles.buttonText}>🎲 Roll Today’s Song</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#22D3EE" />}

      {track && (
        <View style={styles.card}>
          <Text style={styles.songTitle}>{track.name}</Text>
          <Text style={styles.songArtist}>{track.artist}</Text>
        </View>
      )}
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
