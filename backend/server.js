require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 1. KONEKSI KE DATABASE
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "travel_sniper_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection()
  .then((conn) => {
    console.log("✅ SUKSES CONNECT KE DATABASE:", process.env.DB_NAME);
    conn.release();
  })
  .catch((err) => {
    console.error("❌ GAGAL CONNECT DB:", err.message);
  });

// === MIDDLEWARE VERIFIKASI TOKEN ===
const verifyToken = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ msg: "Butuh Token!" });

  try {
    const userId = token.split("-")[1];
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);

    if (rows.length === 0)
      return res.status(403).json({ msg: "Token Invalid / User Hilang" });

    req.user = rows[0];
    next();
  } catch (err) {
    res.status(403).json({ msg: "Error Auth" });
  }
};

// === ROUTES ===

// 1. REGISTER
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const [exist] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (exist.length > 0)
      return res.status(400).json({ msg: "Email sudah terdaftar!" });

    const role = username.toLowerCase().includes("admin") ? "admin" : "user";
    const [result] = await db.query(
      "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [username, email, password, role]
    );

    res.json({ msg: "Register Berhasil", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 2. LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password_hash = ?",
      [email, password]
    );

    if (rows.length === 0)
      return res.status(400).json({ msg: "Email atau Password Salah!" });

    const user = rows[0];
    const token = `TOKEN-${user.id}`;

    res.json({
      msg: "Login Sukses",
      token,
      role: user.role,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 3. PROFILE
app.get("/api/profile", verifyToken, async (req, res) => {
  try {
    const [keys] = await db.query(
      "SELECT key_string FROM api_keys WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1",
      [req.user.id]
    );

    const userData = {
      ...req.user,
      api_key: keys.length > 0 ? keys[0].key_string : null,
    };
    res.json(userData);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// 4. GENERATE KEY
app.post("/api/generate-key", verifyToken, async (req, res) => {
  const newKey =
    "TRAVEL-" + crypto.randomBytes(6).toString("hex").toUpperCase();
  try {
    await db.query("UPDATE api_keys SET is_active = 0 WHERE user_id = ?", [
      req.user.id,
    ]);
    await db.query(
      "INSERT INTO api_keys (user_id, key_string, hits, is_active) VALUES (?, ?, 0, 1)",
      [req.user.id, newKey]
    );
    res.json({ api_key: newKey });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

app.post("/api/check-travel", async (req, res) => {
  const clientKey = req.headers["x-api-key"] || req.body.apiKey;
  const { destination, currency } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM api_keys WHERE key_string = ? AND is_active = 1",
      [clientKey]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        decision: "ACCESS DENIED ❌",
        weather: "-",
        rate: "-",
        msg: "API Key Invalid / Expired",
      });
    }

    const keyData = rows[0];

    // 2. Update Hits (+1)
    await db.query("UPDATE api_keys SET hits = hits + 1 WHERE id = ?", [
      keyData.id,
    ]);

    // 3. AMBIL DATA REAL DARI WEATHER API
    let weatherResult = "Unknown";
    try {
      const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${destination}&aqi=no`;
      const response = await axios.get(weatherUrl);

      const current = response.data.current;
      const loc = response.data.location;

      weatherResult = `${current.temp_c}°C (${current.condition.text}) in ${loc.name}, ${loc.country}`;
    } catch (apiError) {
      console.error("WeatherAPI Error:", apiError.message);
      // Fallback ke dummy kalau API error / kuota habis / kota ga ketemu
      const randomTemp = Math.floor(Math.random() * 30) + 10;
      weatherResult = `${randomTemp}°C (Unknown - API Error)`;
    }

    // 4. Logika Gacha
    const isWorthIt = Math.random() > 0.5;
    const decision = isWorthIt
      ? `PACK YOUR BAGS TO ${destination?.toUpperCase()}! ✈️`
      : `STAY HOME, ${destination?.toUpperCase()} IS PRICEY! 🏠`;

    let rateText = "Loading...";

    if (currency === "IDR") {
      rateText = "1 IDR = Rp 1 (Lokal)";
    } else {
      try {
        const rateUrl = `https://api.frankfurter.app/latest?from=${currency}&to=IDR`;
        const rateRes = await axios.get(rateUrl);
        const rateValue = rateRes.data.rates.IDR;

        const formattedRate = rateValue.toLocaleString("id-ID");
        rateText = `1 ${currency} = Rp ${formattedRate}`;
      } catch (rateError) {
        console.error("Rate API Error:", rateError.message);

        switch (currency) {
          case "USD":
            rateText = "1 USD = Rp 15.500 (Est)";
            break;
          case "JPY":
            rateText = "1 JPY = Rp 105 (Est)";
            break;
          case "EUR":
            rateText = "1 EUR = Rp 16.800 (Est)";
            break;
          default:
            rateText = "Rate Error";
        }
      }
    }

    // Kirim Hasil
    res.json({
      decision,
      weather: weatherResult,
      rate: rateText,
      user_hits: keyData.hits + 1,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// 6. ADMIN
app.get("/api/admin/users", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Hanya Admin!" });

  try {
    const query = `
            SELECT u.username, u.email, k.key_string as api_key, k.hits as request_count 
            FROM users u 
            LEFT JOIN api_keys k ON u.id = k.user_id AND k.is_active = 1
        `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server Database MySQL Jalan di Port ${PORT}`)
);
