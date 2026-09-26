const User = require("../models/User");

const middleware = async (req, res, next) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const fetchUser = await User.findById(req.session.user.id);

    if (!fetchUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = fetchUser;

    console.log("Middleware User:", fetchUser);

    next();

  } catch (error) {
    console.error("Middleware Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    next();
  };
};


module.exports = { middleware, allowRoles };