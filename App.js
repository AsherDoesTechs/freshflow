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

// Make Buffer available globally (outside component)
global.Buffer = Buffer;

// 🔐 Spotify Credentials
const CLIENT_ID = "20096e5384b746c6b692757222a50836";
const CLIENT_SECRET = "e379ba2732854836bd543f7faf9547fb";

export default function App() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // 🔑 Get Access Token from Spotify
  const getAccessToken = async () => {
    try {
      const res = await axios.post(
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
      return res.data.access_token;
    } catch (error) {
      throw new Error("Failed to get Spotify token.");
    }
  };

  // 🎲 Get a Random Song from New Releases
  const getRandomTrack = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const token = await getAccessToken();

      const res = await axios.get(
        "https://api.spotify.com/v1/browse/new-releases?limit=20",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const albums = res.data.albums.items;
      const randomAlbum = albums[Math.floor(Math.random() * albums.length)];
      const trackName = randomAlbum.name;
      const artistName = randomAlbum.artists[0].name;

      setTrack({ name: trackName, artist: artistName });
    } catch (err) {
      console.error("❌ Error fetching track:", err);
      setErrorMsg("Oops! Couldn't load a track. Try again.");
      setTrack(null);
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

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      {track && !errorMsg && (
        <View style={styles.card}>
          <Text style={styles.songTitle}>{track.name}</Text>
          <Text style={styles.songArtist}>by {track.artist}</Text>
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
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#22D3EE",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 30,
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
    marginTop: 20,
  },
  songTitle: {
    fontSize: 20,
    color: "#E2E8F0",
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  songArtist: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
  },
  error: {
    color: "#F87171",
    marginTop: 20,
    fontSize: 14,
    textAlign: "center",
  },
});
