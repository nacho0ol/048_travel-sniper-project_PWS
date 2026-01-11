import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Copy, Check, RefreshCw, LogOut } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [copied, setCopied] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: token },
        });
        setUser(res.data);

        if (role === "admin") {
          const resAdmin = await axios.get(
            "http://localhost:5000/api/admin/users",
            {
              headers: { Authorization: token },
            }
          );
          setAllUsers(resAdmin.data);
        }
      } catch (err) {
        console.error("Gagal ambil data:", err);

        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          alert(
            "Sesi kamu kadaluarsa (Server habis restart). Silakan Login/Register ulang ya!"
          );
          handleLogout();
        }
      }
    };

    fetchData();
  }, [navigate, token, role]);

  const handleGenerateKey = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/generate-key",
        {},
        {
          headers: { Authorization: token },
        }
      );
      setUser((prev) => ({ ...prev, api_key: res.data.api_key }));
      alert("API Key baru berhasil dibuat!");
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 401 || err.response.status === 403)
      ) {
        alert("Sesi habis. Login ulang yuk.");
        handleLogout();
      } else {
        alert("Gagal generate key.");
      }
    }
  };

  const handleCopy = () => {
    if (user?.api_key) {
      navigator.clipboard.writeText(user.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!user)
    return (
      <div className="page-card" style={{ marginTop: "100px" }}>
        Loading...
      </div>
    );

  return (
    <div className="page-card">
      <h1>🏡 Dashboard {role}</h1>
      <p>
        Selamat datang, <b>{user.username}</b> ({user.email})
      </p>

      <div className="section" style={{ width: "100%" }}>
        <h3 className="section-title">🔑 API Key Saya</h3>

        <div className="key-display">
          <span className="key-text">
            {user.api_key ? user.api_key : "Belum ada API Key"}
          </span>

          <button
            onClick={handleCopy}
            className="btn-copy"
            title="Copy API Key"
          >
            {copied ? <Check size={18} color="#00b894" /> : <Copy size={18} />}
          </button>
        </div>

        <button onClick={handleGenerateKey} className="btn-generate">
          <RefreshCw size={18} /> Generate New Key
        </button>
      </div>

      {/* Admin Table */}
      {role === "admin" && (
        <div
          className="admin-section"
          style={{ marginTop: "40px", width: "100%" }}
        >
          <h3 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
            🛡️ Admin Zone: User Stats
          </h3>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>API Key</th>
                <th>Hits</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {u.api_key || "-"}
                  </td>
                  <td>{u.request_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div
        style={{
          marginTop: "30px",
          background: "#f8f9fa",
          padding: "20px",
          borderRadius: "15px",
          border: "1px solid #eee",
        }}
      >
        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#2d3436",
            marginBottom: "15px",
            textAlign: "center",
          }}
        >
          🚀 Cara Menggunakan TravelSniper
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            textAlign: "center",
          }}
        >
          {/* Langkah 1 */}
          <div
            style={{
              padding: "15px",
              background: "#e3f2fd",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>🔑</div>
            <h4
              style={{ fontWeight: "bold", color: "#0984e3", margin: "5px 0" }}
            >
              1. Ambil Key
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#636e72" }}>
              Klik tombol <b>"Generate New Key"</b> di atas.
            </p>
          </div>

          {/* Langkah 2 */}
          <div
            style={{
              padding: "15px",
              background: "#e3f2fd",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>📋</div>
            <h4
              style={{ fontWeight: "bold", color: "#0984e3", margin: "5px 0" }}
            >
              2. Copy Key
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#636e72" }}>
              Salin kode <code>TRAVEL-XXX</code> yang muncul.
            </p>
          </div>

          {/* Langkah 3 */}
          <div
            style={{
              padding: "15px",
              background: "#e3f2fd",
              borderRadius: "10px",
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "5px" }}>✈️</div>
            <h4
              style={{ fontWeight: "bold", color: "#0984e3", margin: "5px 0" }}
            >
              3. Cek Travel
            </h4>
            <p style={{ fontSize: "0.85rem", color: "#636e72" }}>
              Buka menu <b>Cek Tiket</b>, paste Key kamu.
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "30px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <a href="/sniper" className="link-small">
          Ke Halaman Sniper ✈️
        </a>
        <button
          onClick={handleLogout}
          style={{
            background: "none",
            border: "none",
            color: "red",
            fontSize: "0.9rem",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
