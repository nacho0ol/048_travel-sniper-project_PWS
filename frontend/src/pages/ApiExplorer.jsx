import { useState } from "react";
import axios from "axios";
import { Terminal, Play, Code, Server, FileJson } from "lucide-react";

const ApiExplorer = () => {
  // State buat Input User
  const [apiKey, setApiKey] = useState("");
  const [city, setCity] = useState("London");
  const [currency, setCurrency] = useState("USD");

  // State buat Hasil Response
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // Fungsi Nembak API
  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);

    const startTime = Date.now();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/check-travel",
        {
          destination: city,
          currency: currency,
        },
        {
          headers: { "x-api-key": apiKey },
        }
      );

      const endTime = Date.now();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        data: res.data,
        time: endTime - startTime,
      });
    } catch (err) {
      const endTime = Date.now();
      setResponse({
        status: err.response?.status || 500,
        statusText: err.response?.statusText || "Error",
        headers: err.response?.headers || {},
        data: err.response?.data || { error: "Network Error / Server Down" },
        time: endTime - startTime,
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCurl = () => {
    return `curl -X POST http://localhost:5000/api/check-travel \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{"destination": "${city}", "currency": "${currency}"}'`;
  };

  return (
    <div
      className="page-card"
      style={{
        maxWidth: "1000px",
        textAlign: "left",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          marginBottom: "30px",
          borderBottom: "1px solid #eee",
          paddingBottom: "20px",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "2rem" }}>⚡ Interactive API Explorer</h1>
        <p>
          Test endpoint <code>/api/check-travel</code> langsung dari browser.
        </p>
      </div>

      {/* --- 1. INPUT PARAMETERS --- */}
      <div className="section" style={{ width: "100%" }}>
        <h3>
          <Terminal size={18} /> Request Parameters
        </h3>

        <label className="label-code">x-api-key (Header)</label>
        <input
          type="text"
          placeholder="Paste API Key kamu di sini..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />

        <div className="sniper-grid">
          <div style={{ flex: 2 }}>
            <label className="label-code">destination (Body)</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label className="label-code">currency (Body)</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSendRequest}
          className="btn-action"
          disabled={loading}
          style={{ width: "auto", padding: "12px 30px" }}
        >
          {loading ? (
            "Sending..."
          ) : (
            <>
              <Play size={18} /> Send Request
            </>
          )}
        </button>
      </div>

      <div className="section" style={{ width: "100%", marginTop: "20px" }}>
        <h3>
          <Code size={18} /> Call
        </h3>
        <div
          className="code-block"
          style={{ background: "#2d3436", color: "#fff", borderRadius: "8px" }}
        >
          <code style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
            {generateCurl()}
          </code>
        </div>
      </div>

      {/* --- 3. RESPONSE SECTION --- */}
      {response && (
        <div
          style={{ width: "100%", marginTop: "30px", animation: "fadeIn 0.5s" }}
        >
          {/* Status Code Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <h3>
              <Server size={18} /> Response Code
            </h3>
            <span
              className={`status-badge ${
                response.status === 200 ? "status-200" : "status-error"
              }`}
            >
              {response.status} {response.statusText}
            </span>
            <span style={{ fontSize: "0.85rem", color: "#888" }}>
              ({response.time}ms)
            </span>
          </div>

          {/* Response Headers */}
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ margin: "10px 0" }}>Response Headers</h4>
            <div className="code-block json-viewer">
              {JSON.stringify(response.headers, null, 2)}
            </div>
          </div>

          {/* Response Body */}
          <div>
            <h4
              style={{
                margin: "10px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <FileJson size={16} /> Response Body
            </h4>
            <div
              className="code-block json-viewer"
              style={{ color: "#55efc4" }}
            >
              {JSON.stringify(response.data, null, 2)}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "40px",
          background: "#fff",
          padding: "25px",
          borderRadius: "15px",
          border: "1px solid #dfe6e9",
          boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
        }}
      >
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#2d3436",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          ⚡ Cara Menggunakan API Explorer
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              padding: "15px",
              background: "#f1f2f6",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>🎯</div>
            <h4
              style={{ fontWeight: "bold", color: "#6c5ce7", margin: "5px 0" }}
            >
              1. Pilih Endpoint
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#636e72" }}>
              Tes rute API (misal: <code>/check-travel</code>).
            </p>
          </div>

          <div
            style={{
              padding: "15px",
              background: "#f1f2f6",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>✍️</div>
            <h4
              style={{ fontWeight: "bold", color: "#6c5ce7", margin: "5px 0" }}
            >
              2. Isi Parameter
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#636e72" }}>
              Masukkan <b>API Key</b> di Header & data di Body.
            </p>
          </div>

          <div
            style={{
              padding: "15px",
              background: "#f1f2f6",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "10px" }}>🚀</div>
            <h4
              style={{ fontWeight: "bold", color: "#6c5ce7", margin: "5px 0" }}
            >
              3. Kirim Request
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#636e72" }}>
              Klik <b>"Send Request"</b> & lihat respon server.
            </p>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "0.8rem",
            color: "#b2bec3",
            fontStyle: "italic",
          }}
        >
        </p>
      </div>
    </div>
  );
};

export default ApiExplorer;
