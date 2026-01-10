import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/register", form);
      alert("Register Berhasil! Silakan Login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.msg || "Gagal Register");
    }
  };

  return (
    <div className="page-card">
      <h1>📝 Daftar Akun</h1>
      <p>Buat akun untuk akses API Travel Sniper.</p>
      <form onSubmit={handleRegister}>
        <input
          name="username"
          type="text"
          placeholder="Username (Min 5 huruf)"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="btn-action"
          style={{ background: "#54a0ff" }}
        >
          DAFTAR SEKARANG
        </button>
      </form>
      <a href="/login" className="link-small">
        Sudah punya akun? Login aja
      </a>
    </div>
  );
};

export default Register;
