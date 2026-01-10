const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const usernameRegex = /^[a-zA-Z0-9]+$/;

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!usernameRegex.test(username)) {
    return res
      .status(400)
      .json({ msg: "Username cuma boleh Huruf & Angka (Alphanumeric)!" });
  }
  if (username.length < 5) {
    return res
      .status(400)
      .json({ msg: "Username kedikitan! Minimal 5 karakter." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );
    res.status(201).json({ msg: "User registered! Silakan login." });
  } catch (err) {
    res
      .status(500)
      .json({
        msg: "Error register (Email/Username mungkin udah dipake)",
        error: err.message,
      });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0)
      return res.status(404).json({ msg: "User gak ketemu!" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ msg: "Password salah!" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
