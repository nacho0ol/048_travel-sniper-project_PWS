import { useState } from "react";
import axios from "axios";
import { CloudSun, CreditCard, Send } from "lucide-react";

const TravelSniper = () => {
  const [apiKey, setApiKey] = useState("");
  const [destination, setDestination] = useState("");
  const [currency, setCurrency] = useState("JPY");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShoot = async () => {
    if (!apiKey || !destination) {
      alert("Isi API Key dan Kota dulu dong!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/check-travel", {
        apiKey: apiKey, // Kirim key lewat body
        destination: destination,
        currency: currency,
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({
        decision: "ERROR: API KEY SALAH / MATI",
        weather: "Unknown",
        rate: "Unknown",
      });
      alert(err.response?.data?.msg || "Gagal ngecek!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <h1>✈️ Travel Sniper</h1>
      <p>Input API Key kamu, kita cek destinasi ini WORTH IT atau GAK.</p>

      <div className="input-group">
        <input
          type="text"
          placeholder="Paste API Key Kamu di sini..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          style={{ textAlign: "center", fontWeight: "bold" }}
        />
      </div>

      <div className="sniper-grid">
        <input
          type="text"
          placeholder="Mau ke kota mana? (ex: Tokyo)"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
          <option value="IDR">IDR (Indo)</option>
          <option value="USD">USD (Amerika)</option>
          <option value="JPY">JPY (Jepang)</option>
          <option value="EUR">EUR (Eropa)</option>
        </select>
      </div>

      <button onClick={handleShoot} className="btn-action" disabled={loading}>
        {loading ? (
          "Checking..."
        ) : (
          <>
            <Send size={20} /> SHOOT (Check)
          </>
        )}
      </button>

      {result && (
        <div
          className={`result-box ${
            result.decision.includes("PACK")
              ? "good"
              : result.decision.includes("STAY")
              ? "bad"
              : "think"
          }`}
        >
          <h2>{result.decision}</h2>
          <div className="details">
            <p>
              <CloudSun size={20} /> {result.weather}
            </p>
            <p>
              <CreditCard size={20} /> {result.rate}
            </p>
          </div>
        </div>
      )}

      <a href="/dashboard" className="link-small">
        Belum punya API Key? Ke Dashboard &rarr;
      </a>
    </div>
  );
};

export default TravelSniper;
