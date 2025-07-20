import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import axios from "axios";
import { Buffer } from "buffer";
import { Audio } from "expo-av";
import SearchBar from "./components/SearchBar";

global.Buffer = Buffer;

// 🔐 Spotify Credentials
const CLIENT_ID = "20096e5384b746c6b692757222a50836";
const CLIENT_SECRET = "e379ba2732854836bd543f7faf9547fb";

export default function App() {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [moodTracks, setMoodTracks] = useState([]);
  const [sound, setSound] = useState(null);

  const playPreview = async (url) => {
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch (e) {
      console.error("Error playing preview:", e);
    }
  };

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
    } catch {
      throw new Error("Failed to get Spotify token.");
    }
  };

  const getRandomTrack = async () => {
    setLoading(true);
    setErrorMsg(null);
    setTrack(null);
    setMoodTracks([]);
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

      const albumTracksRes = await axios.get(
        `https://api.spotify.com/v1/albums/${randomAlbum.id}/tracks?limit=5`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const trackData =
        albumTracksRes.data.items[
          Math.floor(Math.random() * albumTracksRes.data.items.length)
        ];

      const fullTrackRes = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const fullTrack = fullTrackRes.data;

      setTrack({
        name: fullTrack.name,
        artist: fullTrack.artists[0].name,
        previewUrl: fullTrack.preview_url,
        albumArt: fullTrack.album?.images?.[0]?.url,
      });
    } catch (err) {
      console.error("❌ Error fetching track:", err);
      setErrorMsg("Oops! Couldn't load a track. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleMoodPress = async (mood) => {
    setLoading(true);
    setTrack(null);
    setErrorMsg(null);
    setMoodTracks([]);

    try {
      const token = await getAccessToken();

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(
          mood
        )}&type=playlist&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      const playlist = data?.playlists?.items?.[0];

      if (!playlist || !playlist.id) {
        throw new Error(`No playlists found for mood "${mood}"`);
      }

      const playlistRes = await fetch(
        `https://api.spotify.com/v1/playlists/${playlist.id}/tracks?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const playlistData = await playlistRes.json();
      const tracks = playlistData.items
        .map((item) => item.track)
        .filter((t) => t && t.name && t.artists?.length > 0);

      if (!tracks.length) {
        throw new Error("No tracks found in the playlist.");
      }

      setMoodTracks(tracks);
    } catch (error) {
      console.error("Error fetching mood playlist:", error);
      setErrorMsg("Couldn't load a mood playlist. Try a different vibe!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={moodTracks} // still required even if empty
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View>
            <SearchBar />

            <Text style={styles.title}>🎧 FreshFlow</Text>
            <Text style={styles.subtitle}>Your vibe. Refreshed daily.</Text>

            <View style={styles.moodButtons}>
              {["Chill", "Hype", "Focus", "Sad", "Happy"].map((mood) => (
                <TouchableOpacity
                  key={mood}
                  style={styles.moodButton}
                  onPress={() => handleMoodPress(mood)}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    {mood}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.button} onPress={getRandomTrack}>
              <Text style={styles.buttonText}>🎲 Roll Today’s Song</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#22D3EE" />}
            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

            {track && (
              <View style={styles.card}>
                {track.albumArt && (
                  <Image
                    source={{ uri: track.albumArt }}
                    style={styles.albumArt}
                  />
                )}
                <Text style={styles.songTitle}>{track.name}</Text>
                <Text style={styles.songArtist}>by {track.artist}</Text>

                {track.previewUrl ? (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      { marginTop: 15, backgroundColor: "#22D3EE" },
                    ]}
                    onPress={() => playPreview(track.previewUrl)}
                  >
                    <Text style={styles.buttonText}>▶️ Play Preview</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: "gray", marginTop: 10 }}>
                    ❌ No Preview Available
                  </Text>
                )}
              </View>
            )}

            {moodTracks.length > 0 && (
              <View style={styles.moodListContainer}>
                <Text style={styles.moodListTitle}>
                  🎵 Tracks for your mood:
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.moodTrackCard}>
            <Text style={styles.trackText}>
              {item.name} — {item.artists[0].name}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#22D3EE",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#CBD5E1",
    marginBottom: 20,
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
  moodButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  moodButton: {
    backgroundColor: "#1DB954",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 6,
  },
  card: {
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  albumArt: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
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
  moodListContainer: {
    marginTop: 30,
    width: "100%",
  },
  moodListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  moodTrackCard: {
    backgroundColor: "#1E293B",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  trackText: {
    fontSize: 16,
    color: "#E2E8F0",
    textAlign: "center",
  },
});
