import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      // Simpan Token
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert(`Welcome back, ${res.data.username}!`);

      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.msg || "Login Gagal");
    }
  };

  return (
    <div className="page-card">
      <h1>🔐 Login Sniper</h1>
      <p>Masuk dulu sebelum berburu tiket murah.</p>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-action">
          MASUK 🚀
        </button>
      </form>
      <a href="/register" className="link-small">
        Belum punya akun? Daftar di sini
      </a>
    </div>
  );
};

export default Login;
