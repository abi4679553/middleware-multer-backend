
const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");

const cloudinary = require("../config/cloudinary");
const User = require("../models/UserData");

const router = express.Router();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Register profile
router.post(
  "/register-profile",
  upload.single("profilePhoto"),
  async (req, res) => {
    let uploadedPublicId = null;

    try {
      const {
        name,
        email,
        password,
        age,
        qualification,
      } = req.body;

      console.log("Received fields:", Object.keys(req.body || {}));
      console.log("Received file:", req.file?.fieldname);

      // Validate fields
      const missingFields = [];

      if (!name?.trim()) missingFields.push("name");
      if (!email?.trim()) missingFields.push("email");
      if (!password) missingFields.push("password");
      if (!age) missingFields.push("age");
      if (!qualification?.trim()) {
        missingFields.push("qualification");
      }
      if (!req.file) missingFields.push("profilePhoto");

      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Required fields are missing",
          missingFields,
        });
      }

      if (!Number.isFinite(Number(age)) || Number(age) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Enter a valid age",
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check duplicate email
      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered. Use another email.",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Upload profile photo to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "profile-photos",
            resource_type: "image",
          },
          (error, uploadedResult) => {
            if (error) return reject(error);
            resolve(uploadedResult);
          }
        );

        stream.end(req.file.buffer);
      });

      uploadedPublicId = result.public_id;

      console.log("MongoDB database:", User.db.name);
      console.log("MongoDB collection:", User.collection.name);

      // Save to MongoDB
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        age: Number(age),
        qualification: qualification.trim(),
        imageUrl: result.secure_url,
        publicId: result.public_id,
      });

      console.log("Profile saved:", user._id);

      return res.status(201).json({
        success: true,
        message: "Profile registered successfully",
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          qualification: user.qualification,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error("Profile registration error:", error);

      // Remove uploaded image if MongoDB save fails
      if (uploadedPublicId) {
        try {
          await cloudinary.uploader.destroy(uploadedPublicId);
        } catch (cleanupError) {
          console.error("Cloudinary cleanup error:", cleanupError.message);
        }
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "Email already registered",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Profile registration failed",
        error: error.message,
      });
    }
  }
);

// Fetch profiles without passwords
router.get("/fetch-profiles", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Fetch profiles error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profiles",
      error: error.message,
    });
  }
});

// Multer and route error handler
router.use((error, req, res, next) => {
  console.error("Profile route error:", error.message);

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(400).json({
    success: false,
    message: error.message || "Request failed",
  });
});

module.exports = router;
