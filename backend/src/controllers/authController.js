// ============================================================================
// AUTH CONTROLLER (JWT-based)
// ============================================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { BusinessError } = require("../middleware/errorHandler");

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";

const authController = {
  // Register new user
  async register(req, res) {
    const { username, email, password, role } = req.validated;

    // Check if user exists
    const userExists = await pool.query(
      "SELECT * FROM users WHERE username = $1 OR email = $2",
      [username, email],
    );

    if (userExists.rows.length > 0) {
      throw new BusinessError(
        "Username or email already exists",
        400,
        "User Exists",
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, role, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email, role, created_at",
      [username, email, hashedPassword, role || "STAFF", true],
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  },

  // Login user
  async login(req, res) {
    const { username, password } = req.validated;

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND is_active = true",
      [username],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("Username not found", 401, "Unauthorized");
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      throw new BusinessError("Incorrect password", 401, "Unauthorized");
    }

    // Update last_login
    await pool.query("UPDATE users SET last_login = NOW() WHERE user_id = $1", [
      user.user_id,
    ]);

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY },
    );

    res.json({
      message: "Logged in successfully",
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  },

  // Verify token
  async verifyToken(req, res) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new BusinessError("No token provided", 401, "Unauthorized");
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({
        valid: true,
        user: decoded,
      });
    } catch (err) {
      throw new BusinessError("Invalid or expired token", 401, "Unauthorized");
    }
  },

  // Get current user
  async getCurrentUser(req, res) {
    if (!req.user) {
      throw new BusinessError("Not authenticated", 401, "Unauthorized");
    }

    res.json({
      user: req.user,
    });
  },

  // Get all users (admin only)
  async getAllUsers(req, res) {
    const result = await pool.query(
      "SELECT user_id, username, email, role, is_active, created_at, last_login FROM users ORDER BY created_at DESC",
    );

    res.json(result.rows);
  },

  // Get user by ID
  async getUserById(req, res) {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT user_id, username, email, role, is_active, created_at, last_login FROM users WHERE user_id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("User not found", 404, "Not Found");
    }

    res.json(result.rows[0]);
  },

  // Update user (self or admin)
  async updateUser(req, res) {
    const { id } = req.params;
    const { email, role, is_active } = req.validated;

    // Only allow user to update themselves or admins to update anyone
    if (req.user.user_id !== parseInt(id) && req.user.role !== "ADMIN") {
      throw new BusinessError(
        "Not authorized to update this user",
        403,
        "Forbidden",
      );
    }

    const result = await pool.query(
      "UPDATE users SET email = COALESCE($2, email), role = COALESCE($3, role), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE user_id = $1 RETURNING user_id, username, email, role, is_active",
      [
        id,
        email || null,
        role || null,
        is_active !== undefined ? is_active : null,
      ],
    );

    if (result.rows.length === 0) {
      throw new BusinessError("User not found", 404, "Not Found");
    }

    res.json({
      message: "User updated",
      user: result.rows[0],
    });
  },

  // Change password
  async changePassword(req, res) {
    const { user_id } = req.params;
    const { current_password, new_password } = req.validated;

    // Only allow user to change their own password (or admin)
    if (req.user.user_id !== parseInt(user_id) && req.user.role !== "ADMIN") {
      throw new BusinessError(
        "Not authorized to change this password",
        403,
        "Forbidden",
      );
    }

    // Get user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id],
    );

    if (userResult.rows.length === 0) {
      throw new BusinessError("User not found", 404, "Not Found");
    }

    const user = userResult.rows[0];

    // Verify current password (skip if admin changing someone else's)
    if (req.user.user_id === parseInt(user_id)) {
      const validPassword = await bcrypt.compare(
        current_password,
        user.password_hash,
      );

      if (!validPassword) {
        throw new BusinessError(
          "Current password is incorrect",
          401,
          "Unauthorized",
        );
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    const result = await pool.query(
      "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2 RETURNING user_id, username, email, role",
      [hashedPassword, user_id],
    );

    res.json({
      message: "Password changed successfully",
      user: result.rows[0],
    });
  },
};

module.exports = authController;
