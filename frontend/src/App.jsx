import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TravelSniper from "./pages/TravelSniper";
import "./App.css";
import ApiExplorer from "./pages/ApiExplorer";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <div
        className="app-container"
        style={{ flexDirection: "column", gap: "20px" }}
      >
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={<Navigate to={token ? "/sniper" : "/login"} />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/sniper"
            element={token ? <TravelSniper /> : <Navigate to="/login" />}
          />

          <Route path="/api-explorer" element={<ApiExplorer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
