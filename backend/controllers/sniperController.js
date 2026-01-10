const db = require("../config/db");
const axios = require("axios");

exports.generateKey = async (req, res) => {
  const userId = req.user.id;
  const newKey =
    "TRAVEL-" + Math.random().toString(36).substring(2, 15).toUpperCase();

  try {
    await db.query("DELETE FROM api_keys WHERE user_id = ?", [userId]);
    await db.query("INSERT INTO api_keys (user_id, key_string) VALUES (?, ?)", [
      userId,
      newKey,
    ]);
    res.json({ key: newKey, msg: "API Key baru berhasil dibuat!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkDestination = async (req, res) => {
  const { city, currencyCode, apiKey } = req.query;

  const [keys] = await db.query("SELECT * FROM api_keys WHERE key_string = ?", [
    apiKey,
  ]);
  if (keys.length === 0)
    return res.status(401).json({ msg: "API Key Invalid/Belum Bikin!" });

  await db.query("UPDATE api_keys SET hits = hits + 1 WHERE id = ?", [
    keys[0].id,
  ]);

  try {
    const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`;
    const weatherRes = await axios.get(weatherUrl);
    const { temp_c } = weatherRes.data.current;
    const condition = weatherRes.data.current.condition.text;

    const rateUrl = `https://api.exchangerate-api.com/v4/latest/IDR`;
    const rateRes = await axios.get(rateUrl);
    const rateToIDR = 1 / rateRes.data.rates[currencyCode.toUpperCase()];

    let decision = "THINK TWICE 🤔";
    let color = "bg-yellow-100 text-yellow-800";

    const isCheap = rateToIDR < 15500;
    const isNiceWeather =
      !condition.toLowerCase().includes("rain") && temp_c > 15 && temp_c < 30;

    if (isNiceWeather) {
      decision = "PACK YOUR BAGS! ✈️";
      color = "bg-green-100 text-green-800";
    } else if (condition.toLowerCase().includes("rain")) {
      decision = "STAY HOME ☔";
      color = "bg-red-100 text-red-800";
    }

    res.json({
      destination: city,
      weather: `${temp_c}°C (${condition})`,
      rate: `1 ${currencyCode} ≈ Rp ${rateToIDR.toFixed(2)}`,
      decision,
      color,
    });
  } catch (err) {
    res.status(500).json({
      msg: "Gagal cek data. Pastikan nama kota & kode mata uang benar (contoh: JPY).",
      err: err.message,
    });
  }
};
