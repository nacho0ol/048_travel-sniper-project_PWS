import { Link, useLocation } from "react-router-dom";
import { Plane, LogOut } from "lucide-react";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const isActive = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      {/* Logo Kiri */}
      <Link to={token ? "/sniper" : "/login"} className="nav-brand">
        <Plane size={24} /> TravelSniper
      </Link>

      {/* Menu Kanan */}
      <div className="nav-links">
        {token ? (
          // === MENU KALAU SUDAH LOGIN ===
          <>
            <Link to="/sniper" className={`nav-item ${isActive("/sniper")}`}>
              Cek Tiket
            </Link>

            <Link
              to="/dashboard"
              className={`nav-item ${isActive("/dashboard")}`}
            >
              Dashboard
            </Link>

            {/* Link API Explorer (User Login) */}
            <Link
              to="/api-explorer"
              className={`nav-item ${isActive("/api-explorer")}`}
            >
              API Explorer
            </Link>

            <button
              onClick={handleLogout}
              className="btn-logout"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </>
        ) : (
          // === MENU KALAU BELUM LOGIN (Tamu) ===
          <>
            {/* Link API Explorer (Tamu) */}
            <Link
              to="/api-explorer"
              className={`nav-item ${isActive("/api-explorer")}`}
            >
              API Explorer
            </Link>

            <Link to="/login" className={`nav-item ${isActive("/login")}`}>
              Masuk
            </Link>

            <Link
              to="/register"
              className={`nav-item ${isActive("/register")}`}
            >
              Daftar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
