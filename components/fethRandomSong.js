// fetchRandomSong.js
import { Buffer } from "buffer";

// Needed for Spotify auth
global.Buffer = Buffer;

const SPOTIFY_CLIENT_ID = "YOUR_SPOTIFY_CLIENT_ID";
const SPOTIFY_CLIENT_SECRET = "YOUR_SPOTIFY_CLIENT_SECRET";

export async function fetchRandomTrack() {
  try {
    // Step 1: Get Spotify access token
    const authResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET).toString(
            "base64"
          ),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Step 2: Call Spotify Recommendations API
    const genres = [
      "chill",
      "focus",
      "sad",
      "party",
      "lo-fi",
      "hip-hop",
      "sleep",
      "jazz",
      "alt-rock",
      "ambient",
    ];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];

    const recResponse = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=1&seed_genres=${randomGenre}&min_energy=0.4&max_energy=0.8`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const recData = await recResponse.json();
    const track = recData.tracks[0];

    return {
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
    };
  } catch (err) {
    console.error("Error fetching track:", err);
    return {
      title: "Error",
      artist: "Try again",
    };
  }
}
