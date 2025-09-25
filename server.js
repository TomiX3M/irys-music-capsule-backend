import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = "https://irys-music-capsule-backend.onrender.com//callback"; // must match Spotify app settings

// Step 1: Redirect user to Spotify login
app.get("/login", (req, res) => {
  const scopes = "user-read-email user-read-private user-top-read";
  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.redirect(authUrl);
});

// Step 2: Spotify sends back code
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri
    })
  });

  const data = await response.json();
  res.redirect(`https://irys-music-capsule.netlify.app/?access_token=${data.access_token}`);
});

// Step 3: Get user’s top tracks
app.get("/top-tracks", async (req, res) => {
  const token = req.query.token;

  const response = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term", {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await response.json();
  res.json(data);
});



// ✅ Get top artists
app.get("/top-artists", async (req, res) => {
    const token = req.query.token;
  
    if (!token) return res.status(401).json({ error: "Missing token" });
  
    try {
      const response = await fetch("https://api.spotify.com/v1/me/top/artists?limit=20", {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await response.json();
      res.json(data);
    } catch (err) {
      res.json({ error: "Failed to fetch top artists", details: err.message });
    }
  });
  

app.listen(4000, () => console.log("✅ Server running at https://irys-music-capsule-backend.onrender.com"));
