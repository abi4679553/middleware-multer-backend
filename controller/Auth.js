const Usermodel = require("../models/User");



// =========================
// CREATE USER
// =========================

const createUser = async (req, res) => {
  try {

    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await Usermodel.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Create user
    const user = await Usermodel.create({
      email: email.trim().toLowerCase(),
      password: password,
      role: role,              // ✅ role added
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,       // ✅ response-லும் role
      },
    });

  } catch (error) {

    console.log("Create User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// =========================
// LOGIN
// =========================

const login = async (req, res) => {
  try {
    console.log("========== LOGIN ==========");

    const { email, password } = req.body;

    console.log("Login email:", email);

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Convert email to lowercase
    const UserEmail = email.trim().toLowerCase();

    // Find user using personal email OR work email
    const user = await Usermodel.findOne({ email : UserEmail });

    console.log("User found:", user);

    // User not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist",
      });
    }

    // Password check
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Account status
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // =========================
    // SESSION DATA
    // =========================

    const saveSession = {
      id: String(user._id),

      role: user.role
    };

    // Save user into session
    req.session.user = saveSession;

    console.log("SESSION DATA BEFORE SAVE:");
    console.log(req.session.user);

    // =========================
    // SAVE SESSION
    // =========================

    req.session.save((err) => {

      if (err) {
        console.log("SESSION SAVE ERROR:", err);

        return res.status(500).json({
          success: false,
          message: "Session save failed",
          error: err.message
        });
      }

      console.log("================================");
      console.log("SESSION SAVED SUCCESSFULLY");
      console.log("SESSION ID:", req.sessionID);
      console.log("SESSION USER:", req.session.user);
      console.log("================================");

      return res.status(200).json({
        success: true,
        message: "Login successful",

        user: saveSession
      });
    });

  } catch (error) {

    console.error("========== LOGIN ERROR ==========");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createUser,
  login,
};