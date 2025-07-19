import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());

app.get("/token", async (req, res) => {
  try {
    const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      new URLSearchParams({ grant_type: "client_credentials" }).toString(),
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Token fetch failed", details: err.message });
  }
});

app.listen(3001, () =>
  console.log("🎵 Token server running on http://localhost:3001")
);
