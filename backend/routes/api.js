const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const sniperController = require("../controllers/sniperController");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

// Middleware Token
const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).json({ msg: "No token provided" });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Token salah" });
    req.user = decoded;
    next();
  });
};

// Routes Auth
router.post("/register", authController.register);
router.post("/login", authController.login);

// Routes User Features
router.post("/generate-key", verifyToken, sniperController.generateKey);
router.get("/sniper", sniperController.checkDestination);

// Route ADMIN (Lihat Data)
router.get("/admin/stats", verifyToken, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ msg: "Khusus Admin woi!" });

  try {
    const [rows] = await db.query(`
            SELECT u.username, u.email, k.key_string, k.hits 
            FROM users u 
            LEFT JOIN api_keys k ON u.id = k.user_id
        `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
